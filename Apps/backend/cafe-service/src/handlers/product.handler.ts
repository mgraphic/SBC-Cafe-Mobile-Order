import { Request, Response } from 'express';
import { demoItems } from '../shared/demo-items';

export function getMenu(_: unknown, res: Response): void {
    res.status(200).json(demoItems);
}
