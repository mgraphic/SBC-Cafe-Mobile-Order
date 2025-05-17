export type DynamoDbQueryValue = {
    value: any;
    operation: '=' | '>' | '<' | '>=' | '<=';
};

export type DynamoDbQueryItem = {
    [key: string]: DynamoDbQueryValue;
};

export interface IPageable {
    pageSize: number;
    pageNumber: number;
    totalItems?: number;
    totalPages?: number;
}

export interface IPageableMetadata {
    totalItems: number;
    totalPages: number;
    pageSize: number;
    pageNumber: number;
}
