import { DynamoDbService } from '../aws/dynamodb.service';
import { IPageable, PaginatedPayload } from '../aws';
import {
    NewOrderPayload,
    Order,
    OrderLookupField,
    openOrderStatuseTypes,
} from './order.model';

export class OrderService {
    // GSIs defined in Local/create.orders.json
    private static readonly ORDER_LOOKUP_INDEXES: Record<
        OrderLookupField,
        string
    > = {
        customerName: 'CustomerNameIndex',
        customerEmail: 'CustomerEmailIndex',
        customerMobile: 'CustomerMobileIndex',
        orderStatus: 'OrderStatusCreatedAtIndex',
    };

    // Terminal statuses excluded when looking up open orders only
    private static readonly OPEN_ORDER_STATUSES: Order['orderStatus'][] = [
        ...openOrderStatuseTypes,
    ];

    private readonly dynamoDbService = DynamoDbService.getInstance();

    public async getOrderById(csid: string): Promise<Order | undefined> {
        return (
            await this.dynamoDbService.getItem<Order>('Orders', {
                csid: { operation: '=', value: csid },
            })
        )[0];
    }

    public async lookupOrders(
        field: OrderLookupField,
        value: string,
        openOnly = false,
    ): Promise<Order[]> {
        const orders = await this.dynamoDbService.getItem<Order>(
            'Orders',
            { [field]: { operation: '=', value } },
            OrderService.ORDER_LOOKUP_INDEXES[field],
        );
        const filtered = openOnly
            ? orders.filter((order) =>
                  OrderService.OPEN_ORDER_STATUSES.includes(order.orderStatus),
              )
            : orders;
        return filtered.length > 0 ? filtered : [];
    }

    public async getOpenOrders(
        pageable: IPageable,
    ): Promise<PaginatedPayload<Order>> {
        return await this.dynamoDbService.getPaginated<Order>(
            'Orders',
            pageable,
            { orderStatus: { operation: '=', value: 'pending' } },
            OrderService.ORDER_LOOKUP_INDEXES.orderStatus,
        );
    }

    public async getCompletedOrders(
        pageable: IPageable,
    ): Promise<PaginatedPayload<Order>> {
        return await this.dynamoDbService.getPaginated<Order>(
            'Orders',
            pageable,
            { orderStatus: { operation: '=', value: 'fulfilled' } },
            'OrderStatusCompletedAtIndex',
        );
    }

    public async getFulfilledOrders(
        pageable: IPageable,
    ): Promise<PaginatedPayload<Order>> {
        return await this.dynamoDbService.getPaginated<Order>(
            'Orders',
            pageable,
            { orderStatus: { operation: '=', value: 'fulfilled' } },
            OrderService.ORDER_LOOKUP_INDEXES.orderStatus,
        );
    }

    public async getArchivedOrders(
        pageable: IPageable,
    ): Promise<PaginatedPayload<Order>> {
        return await this.dynamoDbService.getPaginated<Order>(
            'Orders',
            pageable,
            { orderStatus: { operation: '=', value: 'archived' } },
            OrderService.ORDER_LOOKUP_INDEXES.orderStatus,
        );
    }

    public async getCancelledOrders(
        pageable: IPageable,
    ): Promise<PaginatedPayload<Order>> {
        return await this.dynamoDbService.getPaginated<Order>(
            'Orders',
            pageable,
            { orderStatus: { operation: '=', value: 'cancelled' } },
            OrderService.ORDER_LOOKUP_INDEXES.orderStatus,
        );
    }

    public async addOrder(order: NewOrderPayload): Promise<boolean> {
        if (!(await this.getOrderById(order.csid))) {
            const orderPayload = {
                ...order,
                orderStatus: 'pending',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            };

            await this.dynamoDbService.addItem('Orders', orderPayload);
            return true;
        }

        return false;
    }

    public async updateOrder(
        csid: string,
        order: Partial<Order>,
    ): Promise<void> {
        const existingOrder = await this.dynamoDbService.getItem<Order>(
            'Orders',
            {
                csid: { operation: '=', value: csid },
            },
        );

        const orderPayload = {
            ...order,
            updatedAt: new Date().toISOString(),
        };

        if (existingOrder?.length > 0) {
            await this.dynamoDbService.updateItem(
                'Orders',
                { csid },
                orderPayload,
            );
        }
    }

    public async completeOrder(csid: string): Promise<void> {
        await this.updateOrder(csid, {
            orderStatus: 'fulfilled',
            completedAt: new Date().toISOString(),
        });
    }

    public async archiveOrder(csid: string): Promise<void> {
        await this.updateOrder(csid, { orderStatus: 'archived' });
    }

    public async cancelOrder(csid: string): Promise<void> {
        await this.updateOrder(csid, { orderStatus: 'cancelled' });
    }
}
