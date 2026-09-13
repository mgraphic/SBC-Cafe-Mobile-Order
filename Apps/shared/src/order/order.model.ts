import { StripeLineItem } from '../stripe';

export const ORDER_TABLE_NAME = 'Orders';

export const openOrderStatuseTypes = ['pending'] as const;

export type OpenOrderStatus = (typeof openOrderStatuseTypes)[number];

export const closedOrderStatuseTypes = [
    'archived',
    'cancelled',
    'fulfilled',
] as const;

export type ClosedOrderStatus = (typeof closedOrderStatuseTypes)[number];

export type OrderCustomerContact =
    | {
          customerEmail?: string;
          customerMobile: string;
      }
    | {
          customerEmail: string;
          customerMobile?: string;
      };

export type Order = {
    csid: string;
    customerName: string;
    paymentStatus: string;
    pid: string;
    orderStatus: ClosedOrderStatus | OpenOrderStatus;
    createdAt: string;
    updatedAt: string;
    completedAt?: string;
} & OrderCustomerContact;

export type NewOrderPayload = Pick<
    Order,
    'csid' | 'customerName' | 'paymentStatus' | 'pid'
> &
    OrderCustomerContact;

export type CafeOrderDetails = {
    order: Order;
    items: StripeLineItem[];
};

export type OrderLookupField =
    | 'customerName'
    | 'customerEmail'
    | 'customerMobile'
    | 'orderStatus';
