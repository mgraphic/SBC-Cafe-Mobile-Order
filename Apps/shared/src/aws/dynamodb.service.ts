import {
    DynamoDBClient,
    QueryCommand,
    ScanCommand,
} from '@aws-sdk/client-dynamodb';
import {
    attributeMapToValues,
    dynamoDbClient,
    valueToAttributeValue,
} from './aws.utils';
import {
    DeleteCommand,
    DynamoDBDocumentClient,
    PutCommand,
    UpdateCommand,
} from '@aws-sdk/lib-dynamodb';
import { DynamoDbQueryItem } from './aws.model';

/**
 * Query Operations for DynamoDB
 * https://docs.aws.amazon.com/sdk-for-javascript/v3/developer-guide/javascript_dynamodb_code_examples.html
 */

class DynamoDbService {
    private static instance?: DynamoDbService;
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

    public async addItem(
        table: string,
        item: Record<string, any>
    ): Promise<unknown> {
        const command = new PutCommand({
            TableName: table,
            Item: item,
        });

        return await this.docClient.send(command);
    }

    public async updateItem(
        table: string,
        key: Record<string, any>,
        update: Record<string, any>
    ): Promise<unknown> {
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

        return await this.docClient.send(command);
    }

    public async getAllItems<T>(table: string): Promise<T[]> {
        const command = new ScanCommand({
            TableName: table,
        });

        const response = await this.docClient.send(command);
        const items: T[] = [];

        for (const user of response.Items!) {
            items.push(attributeMapToValues<T>(user));
        }

        return items;
    }

    public async getItem<T>(
        table: string,
        params: DynamoDbQueryItem,
        consistentRead = false
    ): Promise<T[]> {
        const paramKeys = Object.keys(params);
        const command = new QueryCommand({
            TableName: table,
            KeyConditionExpression: paramKeys
                .map((key) => `${key} ${params[key].operation} :${key}`)
                .join(' AND '),
            ExpressionAttributeValues: Object.fromEntries(
                paramKeys.map((key) => [
                    `:${key}`,
                    valueToAttributeValue(params[key].value),
                ])
            ),
            ConsistentRead: consistentRead,
        });

        const response = await this.docClient.send(command);
        const items: T[] = [];

        for (const user of response.Items!) {
            items.push(attributeMapToValues<T>(user));
        }

        return items;
    }

    public async getSecondaryIndexItem<T>(
        table: string,
        indexName: string,
        params: DynamoDbQueryItem,
        consistentRead = false
    ): Promise<T[]> {
        const paramKeys = Object.keys(params);
        const command = new QueryCommand({
            TableName: table,
            IndexName: indexName,
            KeyConditionExpression: paramKeys
                .map((key) => `#${key} ${params[key].operation} :v_${key}`)
                .join(' AND '),
            ExpressionAttributeNames: Object.fromEntries(
                paramKeys.map((key) => [`#${key}`, key])
            ),
            ExpressionAttributeValues: Object.fromEntries(
                paramKeys.map((key) => [
                    `:v_${key}`,
                    valueToAttributeValue(params[key].value),
                ])
            ),
            ConsistentRead: consistentRead,
        });

        const response = await this.docClient.send(command);
        const items: T[] = [];

        for (const user of response.Items!) {
            items.push(attributeMapToValues<T>(user));
        }

        return items;
    }

    public async deleteItem(
        table: string,
        key: Record<string, any>
    ): Promise<unknown> {
        const command = new DeleteCommand({
            TableName: table,
            Key: key,
        });

        return await this.docClient.send(command);
    }
}

export const dynamoDbService = DynamoDbService.getInstance();
