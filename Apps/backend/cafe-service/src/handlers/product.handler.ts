import { Request, Response } from 'express';
import {
    ApiError,
    STRIPE_LISTING_PAGE_SIZE,
    Stripe,
    StripeApi,
    StripeProductPrice,
    StripeProductPriceList,
} from 'sbc-cafe-shared-module';
import { environment } from '../environment';
import { logger } from '../shared/logger.utils';

const stripe = new StripeApi(environment.stripeApi.secretKey, {
    ...environment.stripeApi.url,
});

export async function getAllItems(
    req: Request,
    res: Response<StripeProductPriceList | ApiError>,
): Promise<void> {
    const params: Stripe.ProductListParams = {
        active: true,
        expand: ['data.default_price'],
        limit: req.query.limit
            ? parseInt(req.query.limit as string, 10)
            : STRIPE_LISTING_PAGE_SIZE,
    };

    if (req.query.starting_after) {
        params.starting_after = req.query.starting_after as string;
    }

    try {
        const products = await stripe.products.list(params);
        res.status(200).json(products as StripeProductPriceList);
    } catch (err) {
        logger.error(
            'Failed to fetch products from Stripe',
            err instanceof Error ? err : new Error(String(err)),
        );
        res.status(500).json({ error: 'Failed to fetch products from Stripe' });
    }
}

export async function getItemById(
    req: Request,
    res: Response<StripeProductPrice | ApiError>,
): Promise<void> {
    const { id } = req.params;

    try {
        const product = await stripe.products.retrieve(id as string, {
            expand: ['default_price'],
        });

        if (!product || !product.active) {
            res.status(404).json({ error: 'Product not found' });
            return;
        }

        res.status(200).json(product as StripeProductPrice);
    } catch (err) {
        logger.error(
            `Failed to fetch product with ID ${id} from Stripe`,
            err instanceof Error ? err : new Error(String(err)),
        );
        res.status(500).json({
            error: `Failed to fetch product with ID ${id} from Stripe`,
        });
    }
}

export async function getItemBySlug(
    req: Request,
    res: Response<StripeProductPrice | ApiError>,
): Promise<void> {
    const { slug } = req.params;

    try {
        const products = await stripe.products.search({
            limit: 1,
            expand: ['data.default_price'],
            query: `metadata['slug']:'${slug}' AND active:'true'`,
        });

        if (products.data.length === 0) {
            res.status(404).json({ error: 'Product not found' });
            return;
        }

        const product = products.data[0];

        res.status(200).json(product as StripeProductPrice);
    } catch (err) {
        logger.error(
            `Failed to fetch product with slug ${slug} from Stripe`,
            err instanceof Error ? err : new Error(String(err)),
        );
        res.status(500).json({
            error: `Failed to fetch product with slug ${slug} from Stripe`,
        });
    }
}
