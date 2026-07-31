import { getOrder } from './order.handler';
import { stripe } from '../shared/stripe.utils';

jest.mock('../shared/stripe.utils', () => ({
    stripe: {
        checkout: {
            sessions: {
                retrieve: jest.fn(),
                listLineItems: jest.fn(),
            },
        },
    },
}));

describe('getOrder', () => {
    let mockResponse: any;

    beforeEach(() => {
        jest.clearAllMocks();

        mockResponse = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };

        (stripe.checkout.sessions.retrieve as jest.Mock).mockResolvedValue({
            id: 'cs_test_123',
        });
        (stripe.checkout.sessions.listLineItems as jest.Mock).mockResolvedValue(
            {
                data: [],
            },
        );
    });

    it('expands price product data when fetching order items', async () => {
        await getOrder(
            { params: { orderId: 'cs_test_123' } } as any,
            mockResponse as any,
        );

        expect(stripe.checkout.sessions.listLineItems).toHaveBeenCalledWith(
            'cs_test_123',
            {
                limit: 100,
                expand: ['data.price.product'],
            },
        );
    });
});
