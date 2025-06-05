import {
    DynamoDBClient,
    QueryCommandInput,
    AttributeValue,
    QueryCommand,
    ScanCommand,
    ScanCommandOutput,
    QueryCommandOutput,
} from '@aws-sdk/client-dynamodb';
import {
    DynamoDBDocumentClient,
    PutCommandOutput,
    PutCommand,
    UpdateCommandOutput,
    UpdateCommand,
    DeleteCommandOutput,
    DeleteCommand,
} from '@aws-sdk/lib-dynamodb';
import winston from 'winston';
import {
    DynamoDbQueryItem,
    IPageable,
    IPageableMetadata,
    PaginatedPayload,
} from './aws.model';
import {
    dynamoDbClient,
    attributeMapToValues,
    valueToAttributeValue,
} from './aws.utils';

/**
 * Query Operations for DynamoDB
 * https://docs.aws.amazon.com/sdk-for-javascript/v3/developer-guide/javascript_dynamodb_code_examples.html
 */

export class DynamoDbService {
    private static instance?: DynamoDbService;
    private static logger?: winston.Logger;
    private readonly client: DynamoDBClient;
    private readonly docClient: DynamoDBDocumentClient;

    private constructor() {
        this.client = dynamoDbClient;
        this.docClient = DynamoDBDocumentClient.from(this.client);
    }

    public static getInstance(): DynamoDbService {
        if (!DynamoDbService.instance) {
            DynamoDbService.instance = new DynamoDbService();
        }

        return DynamoDbService.instance;
    }

    public static setLogger(logger: winston.Logger): void {
        DynamoDbService.logger = logger;
    }

    public async addItem(
        table: string,
        item: Record<string, any>
    ): Promise<PutCommandOutput | undefined> {
        const command = new PutCommand({
            TableName: table,
            Item: item,
        });

        return await this.sendCommand(command);
    }

    public async updateItem(
        table: string,
        key: Record<string, any>,
        update: Record<string, any>
    ): Promise<UpdateCommandOutput | undefined> {
        const updateKeys = Object.keys(update);
        const command = new UpdateCommand({
            TableName: table,
            Key: key,
            UpdateExpression:
                'SET ' + updateKeys.map((k) => `${k} = :${k}`).join(', '),
            ExpressionAttributeValues: Object.fromEntries(
                updateKeys.map((k) => [`:${k}`, update[k]])
            ),
            ReturnValues: 'ALL_NEW',
        });

        return await this.sendCommand(command);
    }

    public async getAllItems<T>(table: string): Promise<T[]> {
        const command = this.getCommandFromQuery({
            TableName: table,
        });

        const response = await this.sendCommand(command);
        const data: T[] = [];

        if (response?.Items && response.Items.length > 0) {
            data.push(
                ...response.Items.map((item) => attributeMapToValues<T>(item))
            );
        }

        return data;
    }

    public async getItem<T>(
        table: string,
        params: DynamoDbQueryItem | null = null,
        indexName: string | null = null,
        consistentRead = false
    ): Promise<T[]> {
        const query: QueryCommandInput = {
            TableName: table,
            ConsistentRead: consistentRead,
        };

        if (params) {
            const paramKeys = Object.keys(params);

            query.KeyConditionExpression = paramKeys
                .map((key) => `#${key} ${params[key].operation} :v_${key}`)
                .join(' AND ');
            query.ExpressionAttributeNames = Object.fromEntries(
                paramKeys.map((key) => [`#${key}`, key])
            );
            query.ExpressionAttributeValues = Object.fromEntries(
                paramKeys.map((key) => [
                    `:v_${key}`,
                    valueToAttributeValue(params[key].value),
                ])
            );
        }

        if (indexName) {
            query.IndexName = indexName;
        }

        const command = this.getCommandFromQuery(query);
        const response = await this.sendCommand(command);
        const data: T[] = [];

        if (response?.Items && response.Items.length > 0) {
            data.push(
                ...response.Items.map((item) => attributeMapToValues<T>(item))
            );
        }

        return data;
    }

    public async deleteItem(
        table: string,
        key: Record<string, any>
    ): Promise<DeleteCommandOutput | undefined> {
        const command = new DeleteCommand({
            TableName: table,
            Key: key,
        });

        return await this.sendCommand(command);
    }

    public async getPaginated<T>(
        table: string,
        pageable: IPageable,
        params: DynamoDbQueryItem | null = null,
        indexName: string | null = null,
        consistentRead = false
    ): Promise<PaginatedPayload<T>> {
        const { pageSize, pageNumber } = pageable;
        const query: QueryCommandInput = {
            TableName: table,
            ConsistentRead: consistentRead,
        };

        if (params) {
            const paramKeys = Object.keys(params);

            query.KeyConditionExpression = paramKeys
                .map((key) => `#${key} ${params[key].operation} :v_${key}`)
                .join(' AND ');
            query.ExpressionAttributeNames = Object.fromEntries(
                paramKeys.map((key) => [`#${key}`, key])
            );
            query.ExpressionAttributeValues = Object.fromEntries(
                paramKeys.map((key) => [
                    `:v_${key}`,
                    valueToAttributeValue(params[key].value),
                ])
            );
        }

        if (indexName) {
            query.IndexName = indexName;
        }

        const totalItems =
            pageable.totalItems ?? (await this.getRecordCount(query));
        const totalPages =
            pageable.totalPages ?? Math.ceil(totalItems / pageSize);
        const metadata: IPageableMetadata = {
            pageSize,
            pageNumber,
            totalPages,
            totalItems,
        };

        if (pageSize < 1 || pageNumber < 1 || pageNumber > totalPages) {
            return { data: [], metadata };
        }

        const paginatedQuery: QueryCommandInput = {
            ...query,
            Limit: pageSize,
            ExclusiveStartKey:
                pageNumber > 1
                    ? await this.getStartKey(query, { pageSize, pageNumber })
                    : undefined,
        };

        const command = this.getCommandFromQuery(paginatedQuery);
        const response = await this.sendCommand(command);

        if (!response) {
            return { data: [], metadata };
        }

        const data: T[] = [];

        if (response.Items && response.Items.length > 0) {
            data.push(
                ...response.Items.map((item) => attributeMapToValues<T>(item))
            );
        }

        return { data, metadata };
    }

    private async getRecordCount(query: QueryCommandInput): Promise<number> {
        const command = this.getCommandFromQuery(query);
        const response = await this.sendCommand(command);
        return response?.Count || 0;
    }

    private async getStartKey(
        query: QueryCommandInput,
        pageable: IPageable
    ): Promise<Record<string, AttributeValue> | undefined> {
        const command = this.getCommandFromQuery({
            ...query,
            Limit: (pageable.pageNumber - 1) * pageable.pageSize,
        });
        const response = await this.sendCommand(command);

        if (!response) {
            return undefined;
        }

        return response.LastEvaluatedKey;
    }

    private getCommandFromQuery(
        query: QueryCommandInput
    ): QueryCommand | ScanCommand {
        if (query.KeyConditionExpression) {
            return new QueryCommand(query);
        }

        return new ScanCommand(query);
    }

    private async sendCommand(
        command: PutCommand
    ): Promise<PutCommandOutput | undefined>;
    private async sendCommand(
        command: UpdateCommand
    ): Promise<UpdateCommandOutput | undefined>;
    private async sendCommand(
        command: DeleteCommand
    ): Promise<DeleteCommandOutput | undefined>;
    private async sendCommand(
        command: ScanCommand
    ): Promise<ScanCommandOutput | undefined>;
    private async sendCommand(
        command: QueryCommand
    ): Promise<QueryCommandOutput | undefined>;
    private async sendCommand(command: any): Promise<any | undefined> {
        try {
            return await this.docClient.send(command);
        } catch (error) {
            if (DynamoDbService.logger) {
                DynamoDbService.logger.error(error);
                return;
            }

            console.error(error);
        }
    }
}
