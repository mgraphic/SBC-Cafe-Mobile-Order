import { Request, Response } from 'express';
import { ApiError, Stripe } from 'sbc-cafe-shared-module';
import { stripe } from '../shared/stripe.utils';

export async function submitOrder(
    req: Request<
        unknown,
        unknown,
        {
            items?: Stripe.Checkout.SessionCreateParams.LineItem[];
            successUrl?: string;
            cancelUrl?: string;
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
