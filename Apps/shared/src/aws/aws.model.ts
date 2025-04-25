export type DynamoDbQueryValue = {
    value: any;
    operation: '=' | '>' | '<' | '>=' | '<=';
};

export type DynamoDbQueryItem = {
    [key: string]: DynamoDbQueryValue;
};
