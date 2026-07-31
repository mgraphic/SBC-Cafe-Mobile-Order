import { Stripe } from 'stripe';
import { PAGINATED_DEFAULT_PAGESIZE } from '../aws/aws.model';

export type { Stripe } from 'stripe';

export { default as StripeApi } from 'stripe';

export const STRIPE_LISTING_PAGE_SIZE = PAGINATED_DEFAULT_PAGESIZE;

export type StripeProductPrice = Stripe.Product & {
    default_price: Stripe.Price;
};

export type StripeProductPriceList = Stripe.ApiList<StripeProductPrice>;

export type StripeProduct = Stripe.Product & {
    metadata: Stripe.Metadata & {
        slug?: string;
    };
};

export type StripeProductList = Stripe.ApiList<StripeProduct>;

export type StripeCheckoutSessionMetadata = Stripe.Metadata & {
    customerName: string;
} & (
        | { customerEmail: string; customerMobile?: string }
        | { customerEmail?: string; customerMobile: string }
    );

export type StripeLineItem = Stripe.LineItem & {
    price: Stripe.Price & {
        product: StripeProduct;
    };
};

export type StripeOrderDetails = {
    order: Stripe.Checkout.Session;
    items: StripeLineItem[];
};
