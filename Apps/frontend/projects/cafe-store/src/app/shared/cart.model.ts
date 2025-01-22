import { ProductItem } from './product.model';

export type CartItem = ProductItem & {
  quantity: number;
};
