import { getMenu } from './product.handler';
// import { demoItems } from '../shared/demo-items';
import demoItems from '../shared/demo-items.json';

describe('getMenu', () => {
    let mockResponse: any;

    beforeEach(() => {
        mockResponse = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };
    });

    it('should return status 200 and demoItems', () => {
        getMenu({}, mockResponse);

        expect(mockResponse.status).toHaveBeenCalledWith(200);
        expect(mockResponse.json).toHaveBeenCalledWith(demoItems);
    });
});
