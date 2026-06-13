import { StripeApi } from 'sbc-cafe-shared-module';
import { environment } from '../environment';

export const stripe = new StripeApi(environment.stripeApi.secretKey, {
    ...environment.stripeApi.url,
});
