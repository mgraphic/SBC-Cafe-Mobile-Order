import { Request, Response } from 'express';
import { ProductItem } from '../shared/models/product.model';
// import { demoItems } from '../shared/demo-items';
// @ts-ignore
import demoItems from '../shared/demo-items.json' with { type: 'json' };

export function getMenu(_: unknown, res: Response): void {
    res.status(200).json(demoItems as ProductItem[]);
}
