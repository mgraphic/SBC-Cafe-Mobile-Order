import { StripeProductPrice } from 'sbc-cafe-shared-module';

export type CartItem = StripeProductPrice & {
  quantity: number;
};
