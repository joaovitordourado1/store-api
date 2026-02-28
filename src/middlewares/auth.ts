import type { NextFunction, Request, Response } from 'express';
import { getUserIdByToken } from '../services/user';

export const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers['authorization'];
    if (!authHeader) {
        return res.status(401).json({ error: 'Missing authorization header' });
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
        return res.status(401).json({ error: 'Invalid token format' });
    }

    const user = await getUserIdByToken(token);
    if (!user) {
        return res.status(401).json({ error: 'Invalid or expired token' });
    }

    (req as any).userId = user.id;
    next();
};
