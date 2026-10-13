import { Request, Response } from 'express';
import {
    ApiError,
    CafeOrderDetails,
    IPageable,
    MailerService,
    Order,
    OrderService,
    OrderUpdatedEventPayload,
    PAGINATED_DEFAULT_PAGESIZE,
    PaginatedPayload,
    RealtimePartialEvent,
    SettingsService,
    SmsService,
    Stripe,
    StripeCheckoutSessionMetadata,
    StripeLineItem,
    StripeOrderDetails,
} from 'sbc-cafe-shared-module';
import { stripe } from '../shared/stripe.utils';
import { environment } from '../environment';

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

export async function getCheckoutSession(
    req: Request<{ csid: string }>,
    res: Response<
        | {
              ok: boolean;
              orderDetails?: StripeOrderDetails;
          }
        | ApiError
    >,
): Promise<void> {
    const { csid } = req.params;

    try {
        const session = await stripe.checkout.sessions.retrieve(csid);

        if (!session) {
            res.status(404).json({ error: 'Order not found' });
            return;
        }

        const items = (await stripe.checkout.sessions.listLineItems(csid, {
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

export async function getOrder(
    req: Request<{ csid: string }>,
    res: Response<
        | {
              ok: boolean;
              orderDetails: CafeOrderDetails;
          }
        | ApiError
    >,
): Promise<void> {
    const orderService = new OrderService();
    const { csid } = req.params;

    try {
        const order = await orderService.getOrderById(csid);
        // const session = await stripe.checkout.sessions.retrieve(csid);

        if (!order) {
            res.status(404).json({ error: 'Order not found' });
            return;
        }

        const items = (await stripe.checkout.sessions.listLineItems(csid, {
            limit: 100,
            expand: ['data.price.product'],
        })) as Stripe.ApiList<StripeLineItem>;

        res.status(200).json({
            ok: true,
            orderDetails: {
                order: order,
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

export async function getOpenOrders(
    req: Request<unknown, unknown, IPageable, unknown>,
    res: Response<PaginatedPayload<Order> | ApiError>,
): Promise<void> {
    const orderService = new OrderService();
    const pagable: IPageable = {
        pageSize: req.body.pageSize ?? PAGINATED_DEFAULT_PAGESIZE,
        pageNumber: req.body.pageNumber ?? 1,
        totalItems: req.body.totalItems,
        totalPages: req.body.totalPages,
    };

    try {
        const orders = await orderService.getOpenOrders(pagable);

        res.status(200).json(orders);
    } catch (error) {
        res.status(500).json(
            error instanceof Error
                ? { error: error.message }
                : { error: 'Unknown error' },
        );
    }
}

export async function getOpenOrderDetails(
    req: Request<unknown, unknown, IPageable, unknown>,
    res: Response<PaginatedPayload<CafeOrderDetails> | ApiError>,
): Promise<void> {
    const orderService = new OrderService();
    const pagable: IPageable = {
        pageSize: req.body.pageSize ?? PAGINATED_DEFAULT_PAGESIZE,
        pageNumber: req.body.pageNumber ?? 1,
        totalItems: req.body.totalItems,
        totalPages: req.body.totalPages,
    };

    try {
        const orders = await orderService.getOpenOrders(pagable);
        const payload: PaginatedPayload<CafeOrderDetails> = {
            data: [],
            metadata: orders.metadata,
        };

        for (const order of orders.data) {
            const items = (await stripe.checkout.sessions.listLineItems(
                order.csid,
                {
                    limit: 100,
                    expand: ['data.price.product'],
                },
            )) as Stripe.ApiList<StripeLineItem>;

            payload.data.push({
                order: order,
                items: items.data || [],
            });
        }

        res.status(200).json(payload);
    } catch (error) {
        res.status(500).json(
            error instanceof Error
                ? { error: error.message }
                : { error: 'Unknown error' },
        );
    }
}

export async function completeOrder(
    req: Request<{ csid: string }, unknown, unknown, unknown>,
    res: Response<{ success: boolean } | ApiError>,
): Promise<void> {
    if (
        !req.user?.hasPermission('ORDER') ||
        !req.user?.hasPermission('ORDER_COMPLETE')
    ) {
        res.sendStatus(403);
        return;
    }

    const orderService = new OrderService();
    const { csid } = req.params;

    try {
        // Get order details
        const session = await stripe.checkout.sessions.retrieve(csid);
        const items = (await stripe.checkout.sessions.listLineItems(csid, {
            limit: 100,
            expand: ['data.price.product'],
        })) as Stripe.ApiList<StripeLineItem>;

        // Get store name
        const organizationName =
            (await SettingsService.getInstance().getSetting(
                'organizationName',
            )) as string;
        const cafeName = (await SettingsService.getInstance().getSetting(
            'cafeName',
        )) as string;
        const storeName = `${organizationName} ${cafeName}`;

        // Send order confirmation email
        const customerEmail = session.metadata?.customerEmail;

        if (customerEmail) {
            const mailerService = MailerService.getInstance();

            // Transform line items into email template format
            const lineItems = (items.data || []).map((item) => {
                const product = item.price?.product as Stripe.Product;

                return {
                    description: item.description || 'Order item',
                    quantity: item.quantity || 1,
                    unitPrice: ((item.price?.unit_amount || 0) / 100).toFixed(
                        2,
                    ),
                    totalPrice: ((item.amount_total || 0) / 100).toFixed(2),
                    imageUrl: product?.images?.[0] || undefined,
                };
            });
            const totalAmount = ((session.amount_total || 0) / 100).toFixed(2);
            const customerName = session.metadata?.customerName || 'Customer';

            await mailerService.sendOrderConfirmation(
                customerEmail,
                `Your ${storeName} Order Is Ready To Pick Up`,
                {
                    customerName,
                    orderNumber: csid,
                    paymentStatus: session.payment_status || 'pending',
                    items: lineItems,
                    totalAmount,
                    orderUrl: `${environment.ui.storeUrl}/order-confirmation?csid=${csid}`,
                },
                true,
            );
        }

        // Send order ready SMS
        const customerMobile = session.metadata?.customerMobile;
        if (customerMobile) {
            const smsService = new SmsService();

            await smsService.sendMessage({
                recipient: customerMobile,
                content: `Your ${storeName} order is ready to pick up. Order details: ${environment.ui.storeUrl}/order-confirmation?csid=${csid}`,
                type: 'transactional',
                tag: 'alert',
                unicodeEnabled: false,
            });
        }

        // Notify realtime subscribers about the order update
        const rtEvent: RealtimePartialEvent<OrderUpdatedEventPayload> = {
            type: 'order.updated',
            payload: { csid },
        };

        await fetch(`${environment.realtime.endpoint}/publish`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Internal-Api-Key': environment.privateSharedApiKey,
            },
            body: JSON.stringify(rtEvent),
        });

        // Complete the order in the system
        await orderService.completeOrder(csid);
        res.status(200).json({ success: true });
    } catch (error) {
        res.status(500).json(
            error instanceof Error
                ? { error: error.message }
                : { error: 'Unknown error' },
        );
    }
}

export async function cancelOrder(
    req: Request<{ csid: string }, unknown, unknown, unknown>,
    res: Response<{ success: boolean } | ApiError>,
): Promise<void> {
    if (
        !req.user?.hasPermission('ORDER') ||
        !req.user?.hasPermission('ORDER_CANCEL')
    ) {
        res.sendStatus(403);
        return;
    }

    const orderService = new OrderService();
    const { csid } = req.params;

    try {
        await orderService.cancelOrder(csid);
        res.status(200).json({ success: true });

        const rtEvent: RealtimePartialEvent<OrderUpdatedEventPayload> = {
            type: 'order.updated',
            payload: { csid },
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
        res.status(500).json(
            error instanceof Error
                ? { error: error.message }
                : { error: 'Unknown error' },
        );
    }
}
