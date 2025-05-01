import { ProductItem } from '../../../../shared-lib/src/public-api';

export type CartItem = ProductItem & {
  quantity: number;
};
