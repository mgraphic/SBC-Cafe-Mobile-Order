import { Response, Request } from 'express';
import { logger } from '../shared/logger.utils';
import { environment } from '../environment';
import {
    NewOrderAlertEventPayload,
    RealtimePartialEvent,
    SmsService,
    Stripe,
    StripeApi,
    StripeCheckoutSessionMetadata,
    TokenUser,
    UsersService,
} from 'sbc-cafe-shared-module';
import { stripe } from '../shared/stripe.utils';

export async function handleWebhook(
    req: Request,
    res: Response,
): Promise<void> {
    logger.info('Received webhook event');

    const sig = req.headers['stripe-signature'];
    const endpointSecret = environment.stripeApi.webhookSecret;
    let event: Stripe.Event;

    try {
        event = StripeApi.webhooks.constructEvent(
            req.body,
            sig || '',
            endpointSecret,
        );
    } catch (err: any) {
        logger.error(`Webhook signature verification failed: ${err.message}`);
        res.status(400).send(`Webhook Error: ${err.message}`);
        return;
    }

    switch (event.type) {
        case 'checkout.session.completed': {
            const session = event.data.object;
            logger.info('Checkout session completed:', session.id);
            // TODO: fulfill the order
            break;
        }

        case 'payment_intent.succeeded': {
            const paymentIntent = event.data.object;
            logger.info('PaymentIntent succeeded:', paymentIntent.id);

            const csid =
                paymentIntent.payment_details?.order_reference ?? 'unknown';
            const rtEvent: RealtimePartialEvent<NewOrderAlertEventPayload> = {
                type: 'new-order-alert',
                payload: {
                    csid,
                    items: (await stripe.checkout.sessions
                        .listLineItems(csid, { limit: 100 })
                        .then(
                            (lineItems) => lineItems.data,
                        )) as unknown as Stripe.LineItem[],
                    metadata: (
                        (await stripe.checkout.sessions.retrieve(
                            csid,
                        )) as unknown as Stripe.Checkout.Session
                    ).metadata as unknown as StripeCheckoutSessionMetadata,
                },
            };

            fetch(`${environment.realtime.endpoint}/publish`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Internal-Api-Key': environment.privateSharedApiKey,
                },
                body: JSON.stringify(rtEvent),
            });

            const userService = new UsersService();
            const smsService = new SmsService();

            for (const user of await userService.getAllUsers(true)) {
                try {
                    const tokenUser = new TokenUser(user);

                    if (!tokenUser.hasRole('ADMIN')) {
                        continue;
                    }

                    const result = await smsService.sendMessage({
                        recipient: user.mobile,
                        content:
                            'New order received. Please check the admin dashboard for details.',
                        type: 'transactional',
                        tag: 'alert',
                        unicodeEnabled: false,
                    });
                } catch (error) {
                    logger.error('Failed to send alert SMS message', error);
                }
            }

            break;
        }

        case 'payment_intent.payment_failed': {
            const failedPayment = event.data.object;
            logger.info('PaymentIntent failed:', failedPayment.id);
            break;
        }

        default:
            logger.warn(`Unhandled event type: ${event.type}`);
            logger.info(JSON.stringify(event));
    }

    res.status(200).json({ received: true });
}
