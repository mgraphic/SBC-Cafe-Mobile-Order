import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { environment } from '../environment';

export const dynamodbClient = new DynamoDBClient({
    region: environment.aws.region,
    endpoint: environment.aws.endpoint,
    credentials: {
        accessKeyId: environment.aws.accessKeyId,
        secretAccessKey: environment.aws.secretAccessKey,
    },
});
