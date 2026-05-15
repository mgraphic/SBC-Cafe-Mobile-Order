import {
    AttributeValue,
    DynamoDBClient,
    DynamoDBClientConfig,
} from '@aws-sdk/client-dynamodb';
import { getSharedEnvironment } from '../environment-provider';

export function valueToAttributeValue<T>(value: T): AttributeValue {
    switch (typeof value) {
        case 'string':
            return { S: value };
        case 'number':
            return { N: `${value}` };
        case 'boolean':
            return { BOOL: value };
        case 'object':
            if (Array.isArray(value)) {
                return { L: value.map((item) => valueToAttributeValue(item)) };
            }
            return {
                M: Object.entries(value as any).reduce(
                    (acc, [key, item]) => ({
                        ...acc,
                        [key]: valueToAttributeValue(item),
                    }),
                    {},
                ),
            };
        default:
            throw new Error(`Unknown type ${typeof value}`);
    }
}

export function attributeValueToValue<T>(value: AttributeValue): T {
    switch (true) {
        case !!value.S:
            return value.S as T;
        case !!value.N:
            return Number(value.N) as T;
        case !!value.BOOL:
            return value.BOOL as T;
        case !!value.L:
            return value.L?.map((item) =>
                attributeValueToValue(item),
            ) as unknown as T;
        case !!value.M:
            return Object.entries(value.M || []).reduce(
                (acc, [key, item]) => ({
                    ...acc,
                    [key]: attributeValueToValue(item),
                }),
                {},
            ) as unknown as T;
        default:
            throw new Error(`Unknown type ${JSON.stringify(value)}`);
    }
}

export function attributeMapToValues<T>(
    items: Record<string, AttributeValue>,
): T {
    return Object.keys(items).reduce(
        (acc, key) => ({
            ...acc,
            [key]: attributeValueToValue(items[key]),
        }),
        [],
    ) as T;
}

function getDynamoDbConfig(): DynamoDBClientConfig {
    const sharedEnv = getSharedEnvironment();
    const config: DynamoDBClientConfig = {
        region: sharedEnv.aws.region,
    };

    if (sharedEnv.aws.endpoint) {
        config.endpoint = sharedEnv.aws.endpoint;
    }

    if (sharedEnv.aws.accessKeyId || sharedEnv.aws.secretAccessKey) {
        const credentials: Record<string, string> = {};

        if (sharedEnv.aws.accessKeyId) {
            credentials.accessKeyId = sharedEnv.aws.accessKeyId;
        }

        if (sharedEnv.aws.secretAccessKey) {
            credentials.secretAccessKey = sharedEnv.aws.secretAccessKey;
        }

        config.credentials = credentials as any;
    }

    return config;
}

let _dynamoDbClient: DynamoDBClient | null = null;

/**
 * Get the DynamoDB client instance.
 * Lazily initializes the client on first access using the current environment configuration.
 */
export function getDynamoDbClient(): DynamoDBClient {
    if (!_dynamoDbClient) {
        _dynamoDbClient = new DynamoDBClient(getDynamoDbConfig());
    }
    return _dynamoDbClient;
}

/**
 * @deprecated Use getDynamoDbClient() instead for proper lazy initialization
 */
export const dynamoDbClient = new Proxy({} as DynamoDBClient, {
    get: (target, prop) => {
        const client = getDynamoDbClient();
        return (client as any)[prop];
    },
});
