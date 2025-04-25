import {
    AttributeValue,
    DynamoDBClient,
    DynamoDBClientConfig,
} from '@aws-sdk/client-dynamodb';
import { environment } from '../environment';

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
                    {}
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
                attributeValueToValue(item)
            ) as unknown as T;
        case !!value.M:
            return Object.entries(value.M || []).reduce(
                (acc, [key, item]) => ({
                    ...acc,
                    [key]: attributeValueToValue(item),
                }),
                {}
            ) as unknown as T;
        default:
            throw new Error(`Unknown type ${JSON.stringify(value)}`);
    }
}

export function attributeMapToValues<T>(
    items: Record<string, AttributeValue>
): T {
    return Object.keys(items).reduce(
        (acc, key) => ({
            ...acc,
            [key]: attributeValueToValue(items[key]),
        }),
        []
    ) as T;
}

function getDynamoDbConfig(): DynamoDBClientConfig {
    const config: DynamoDBClientConfig = {
        region: environment.aws.region,
    };

    if (environment.aws.endpoint) {
        config.endpoint = environment.aws.endpoint;
    }

    if (environment.aws.accessKeyId || environment.aws.secretAccessKey) {
        const credentials: Record<string, string> = {};

        if (environment.aws.accessKeyId) {
            credentials.accessKeyId = environment.aws.accessKeyId;
        }

        if (environment.aws.secretAccessKey) {
            credentials.secretAccessKey = environment.aws.secretAccessKey;
        }

        config.credentials = credentials as any;
    }

    return config;
}

export const dynamoDbClient = new DynamoDBClient(getDynamoDbConfig());
