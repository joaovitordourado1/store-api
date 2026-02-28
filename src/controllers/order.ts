import type { RequestHandler } from 'express';
import { getOrderBySessionIdSchema } from '../schemas/get-order-by-session-id';
import { getOrderIdFromSessionId } from '../services/payment';
import { getUsersOrders, getOrderById as getOrder } from '../services/order';
import { getOrderSchema } from '../schemas/get-order-schema';
import { getAbsoluteImageUrl } from '../utils/get-absolute-image-url';

export const getOrderSessionById: RequestHandler = async (req, res) => {
    const result = getOrderBySessionIdSchema.safeParse(req.query);
    if (!result.success) {
        return res.status(400).json({ error: 'Invalid session ID' });
    }

    const { sessionId } = result.data;
    const orderId = await getOrderIdFromSessionId(sessionId);

    if (!orderId) {
        return res.status(404).json({ error: 'Order not found' });
    }

    res.json({ orderId });
};

export const listOrders: RequestHandler = async (req, res) => {
    const userId = (req as any).userId;
    if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    const orders = await getUsersOrders(userId);
    res.json(orders);
};

export const getOrderById: RequestHandler = async (req, res) => {
    const userId = (req as any).userId;
    if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    const result = getOrderSchema.safeParse(req.params);
    if (!result.success) {
        return res.status(400).json({ error: 'Invalid order ID' });
    }

    const { id } = result.data;
    const order = await getOrder(userId, parseInt(id));

    if (!order) {
        return res.status(404).json({ error: 'Order not found' });
    }

    const orderProducts = order.orderProducts.map(item => ({
        ...item,
        product: {
            ...item.product,
            images: item.product.images.map(image => getAbsoluteImageUrl(image.url)),
        },
    }));

    res.json({ ...order, orderProducts });
};
