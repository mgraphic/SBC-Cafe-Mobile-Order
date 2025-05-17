import { IPageable } from '../aws';
import { DynamoDbService } from '../aws/dynamodb.service';
import { TrackerLog, ITracker } from './tracker.model';

export class UserTrackerLogService {
    private readonly dynamoDbService = DynamoDbService.getInstance();

    public async addLog(log: TrackerLog): Promise<void> {
        const tracker: ITracker = {
            ...log,
            createdAt: new Date().toISOString(),
            id: crypto.randomUUID(),
        };

        await this.dynamoDbService.addItem('UserTrackerLogs', tracker);
    }

    public async getLogs(): Promise<ITracker[]> {
        return await this.dynamoDbService.getAllItems<ITracker>(
            'UserTrackerLogs'
        );
    }

    public async getPaginatedLogs(pageable: IPageable): Promise<any> {
        return await this.dynamoDbService.getPaginated<ITracker>(
            'UserTrackerLogs',
            pageable
        );
    }
}
