import { Request, Response } from 'express';
import {
    ApiError,
    Stripe,
    StripeCheckoutSessionMetadata,
    StripeLineItem,
    StripeOrderDetails,
} from 'sbc-cafe-shared-module';
import { stripe } from '../shared/stripe.utils';

export async function submitOrder(
    req: Request<
        unknown,
        unknown,
        {
            items?: Stripe.Checkout.SessionCreateParams.LineItem[];
            successUrl?: string;
            cancelUrl?: string;
            metadata?: StripeCheckoutSessionMetadata;
        }
    >,
    res: Response<{ ok: boolean; url?: string } | ApiError>,
): Promise<void> {
    if (
        !req.body.items ||
        !Array.isArray(req.body.items) ||
        req.body.items.length === 0
    ) {
        res.status(400).json({ error: 'No items provided' });
        return;
    }

    if (!req.body.successUrl) {
        res.status(400).json({ error: 'No success URL provided' });
        return;
    }

    try {
        const session = await stripe.checkout.sessions.create({
            line_items: req.body.items ?? [],
            mode: 'payment',
            success_url: req.body.successUrl,
            cancel_url: req.body.cancelUrl,
            metadata: req.body.metadata,
        });

        if (!session.url) {
            res.status(500).json({
                error: 'Failed to create checkout session',
            });
            return;
        }

        res.status(200).json({
            ok: true,
            url: session.url,
        });
    } catch (error) {
        res.status(500).json(
            error instanceof Error
                ? { error: error.message }
                : { error: 'Unknown error' },
        );
    }
}

export async function getOrder(
    req: Request<{ orderId: string }>,
    res: Response<
        | {
              ok: boolean;
              orderDetails?: StripeOrderDetails;
          }
        | ApiError
    >,
): Promise<void> {
    const { orderId } = req.params;

    try {
        const session = await stripe.checkout.sessions.retrieve(orderId);

        if (!session) {
            res.status(404).json({ error: 'Order not found' });
            return;
        }

        const items = (await stripe.checkout.sessions.listLineItems(orderId, {
            limit: 100,
            expand: ['data.price.product'],
        })) as Stripe.ApiList<StripeLineItem>;

        console.log('\n\n', JSON.stringify(items), '\n\n');

        res.status(200).json({
            ok: true,
            orderDetails: {
                order: session,
                items: items.data || [],
            },
        });
    } catch (error) {
        res.status(500).json(
            error instanceof Error
                ? { error: error.message }
                : { error: 'Unknown error' },
        );
    }
}
