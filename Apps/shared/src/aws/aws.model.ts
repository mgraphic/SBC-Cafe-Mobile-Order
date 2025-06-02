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

export interface PaginatedPayload<T> {
    data: T[];
    metadata: IPageableMetadata;
}

export const PAGINATED_DEFAULT_PAGESIZE = 10 as const;
export const PAGINATED_PAGESIZE_OPTIONS = [10, 25, 50, 100] as const;
