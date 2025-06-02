import { DynamoDbService } from '../aws/dynamodb.service';
import { IPageable, PaginatedPayload, DynamoDbQueryItem } from '../aws';
import { TrackerLog, ITracker, UserTrackerLogsLookup } from './tracker.model';

export class UserTrackerLogService {
    private readonly tableName = 'UserTrackerLogs';
    private readonly dynamoDbService = DynamoDbService.getInstance();

    public async addLog(log: TrackerLog): Promise<void> {
        const tracker: ITracker = {
            ...log,
            createdAt: new Date().toISOString(),
            id: crypto.randomUUID(),
        };

        await this.dynamoDbService.addItem(this.tableName, tracker);
    }

    public async getLogs(): Promise<ITracker[]> {
        return await this.dynamoDbService.getAllItems<ITracker>(this.tableName);
    }

    public async getPaginatedLogs(
        pageable: IPageable,
        lookup?: UserTrackerLogsLookup,
        lookupValue?: string
    ): Promise<PaginatedPayload<ITracker>> {
        let params: DynamoDbQueryItem | null = null;
        let indexName: string | null = null;

        if (lookup && lookupValue) {
            params = {
                [lookup]: {
                    operation: '=',
                    value: lookupValue,
                },
            };

            switch (lookup) {
                case 'endpoint':
                    indexName = 'EndpointIndex';
                    break;
                case 'id':
                    indexName = 'IdIndex';
                    break;
                case 'ip':
                    indexName = 'IpIndex';
                    break;
            }
        }

        return await this.dynamoDbService.getPaginated<ITracker>(
            this.tableName,
            pageable,
            params,
            indexName
        );
    }
}
