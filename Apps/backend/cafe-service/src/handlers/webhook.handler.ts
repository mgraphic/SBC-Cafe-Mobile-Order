import { Response, Request } from 'express';
import { logger } from '../shared/logger.utils';
import { environment } from '../environment';
import {
    MailerService,
    NewOrderAlertEventPayload,
    NewOrderPayload,
    OrderService,
    RealtimePartialEvent,
    SmsService,
    Stripe,
    StripeApi,
    StripeCheckoutSessionMetadata,
    StripeLineItem,
    TokenUser,
    UsersService,
} from 'sbc-cafe-shared-module';
import { stripe } from '../shared/stripe.utils';

export async function handleWebhook(
    req: Request,
    res: Response,
): Promise<void> {
    const sig = req.headers['stripe-signature'];
    const endpointSecret = environment.stripeApi.webhookSecret;
    let event: Stripe.Event;

    try {
        event = StripeApi.webhooks.constructEvent(
            req.body,
            sig || '',
            endpointSecret,
        );

        logger.info(`Received Stripe webhook event: ${JSON.stringify(event)}`);
    } catch (err: any) {
        logger.error(`Webhook signature verification failed: ${err.message}`);
        res.status(400).send(`Webhook Error: ${err.message}`);
        return;
    }

    switch (event.type) {
        case 'checkout.session.completed': {
            const session = event.data.object;
            logger.info('Checkout session completed:', session.id);

            const csid = session.id;
            const metadata = session.metadata as StripeCheckoutSessionMetadata;
            let items: Partial<Stripe.ApiList<StripeLineItem>> = { data: [] };

            // Add order to cafe DB
            try {
                const orderService = new OrderService();
                const orderPayload: Partial<NewOrderPayload> = {
                    csid,
                    customerName: metadata.customerName,
                    customerEmail: metadata.customerEmail,
                    customerMobile: metadata.customerMobile,
                    paymentStatus: session.payment_status,
                    pid: session.payment_intent as string,
                };

                await orderService.addOrder(
                    JSON.parse(JSON.stringify(orderPayload)),
                );
            } catch (error) {
                logger.error('Failed to add order to cafe DB', error);
            }

            // Fetch the line items for the completed checkout session from Stripe
            try {
                items = (await stripe.checkout.sessions.listLineItems(csid, {
                    limit: 100,
                    expand: ['data.price.product'],
                })) as Stripe.ApiList<StripeLineItem>;
            } catch (error) {
                logger.error(
                    'Failed to list line items for checkout session',
                    error,
                );
            }

            // Publish real-time event to the admin dashboard
            try {
                const rtEvent: RealtimePartialEvent<NewOrderAlertEventPayload> =
                    {
                        type: 'new-order-alert',
                        payload: {
                            csid,
                            items: items.data || [],
                            metadata,
                        },
                    };

                await fetch(`${environment.realtime.endpoint}/publish`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-Internal-Api-Key': environment.privateSharedApiKey,
                    },
                    body: JSON.stringify(rtEvent),
                });
            } catch (error) {
                logger.error('Failed to publish real-time event', error);
            }

            // Send SMS alert to all admin users
            try {
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
            } catch (error) {
                logger.error(
                    'Failed to send alert SMS messages to admin users',
                    error,
                );
            }

            // Send order confirmation email to customer
            try {
                const customerEmail = session.metadata?.customerEmail; //session.customer_details?.email;

                if (customerEmail) {
                    const mailerService = MailerService.getInstance();

                    // Transform line items into email template format
                    const lineItems = (items.data || []).map((item) => {
                        const product = item.price?.product as Stripe.Product;

                        return {
                            description: item.description || 'Order item',
                            quantity: item.quantity || 1,
                            unitPrice: Number(
                                ((item.price?.unit_amount || 0) / 100).toFixed(
                                    2,
                                ),
                            ),
                            totalPrice: Number(
                                ((item.amount_total || 0) / 100).toFixed(2),
                            ),
                            imageUrl: product?.images?.[0] || undefined,
                        };
                    });

                    const totalAmount = Number(
                        ((session.amount_total || 0) / 100).toFixed(2),
                    );

                    const customerName =
                        session.metadata?.customerName || 'Customer';

                    await mailerService.sendOrderConfirmation(
                        customerEmail,
                        'Your Order Confirmation',
                        {
                            customerName,
                            orderNumber: csid,
                            paymentStatus: session.payment_status || 'pending',
                            items: lineItems,
                            totalAmount,
                            orderUrl: `${environment.ui.storeUrl}/order-confirmation?csid=${csid}`,
                        },
                    );

                    logger.info(
                        `Order confirmation email sent to ${customerEmail}`,
                    );
                } else {
                    logger.warn(
                        `No customer email found for checkout session ${csid}`,
                    );
                }
            } catch (error) {
                logger.error('Failed to send order confirmation email', error);
            }

            break;
        }

        case 'payment_intent.succeeded': {
            const paymentIntent = event.data.object;
            logger.info('PaymentIntent succeeded:', paymentIntent.id);
            break;
        }

        case 'payment_intent.payment_failed': {
            const failedPayment = event.data.object;
            logger.warn('PaymentIntent failed:', failedPayment.id);
            break;
        }

        default:
            logger.warn(`Unhandled event type: ${event.type}`);
    }

    res.status(200).json({ received: true });
}
