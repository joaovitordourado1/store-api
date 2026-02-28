import type { RequestHandler } from 'express';
import { cartMountSchema } from '../schemas/cart-mount-schema';
import { getProduct } from '../services/products';
import { getAbsoluteImageUrl } from '../utils/get-absolute-image-url';
import { calculatingShippingSchema } from '../schemas/calculating-shipping-schema';
import { cartFinishSchema } from '../schemas/cart-finish-schema';
import { getAddressById } from '../services/user';
import { createOrder } from '../services/order';
import { createPaymentLink } from '../services/payment';

export const cartMount: RequestHandler = async (req, res) => {
    const parseResult = cartMountSchema.safeParse(req.body);
    if (!parseResult.success) {
        return res.status(400).json({ error: 'Invalid product IDs' });
    }

    const { ids } = parseResult.data;
    const products = [];

    for (const id of ids) {
        const product = await getProduct(id);
        if (product) {
            products.push({
                id: product.id,
                label: product.label,
                price: product.price,
                image: product.images?.[0] ? getAbsoluteImageUrl(product.images[0]) : null,
            });
        }
    }

    res.json(products);
};

export const calculateShipping: RequestHandler = async (req, res) => {
    const parseResult = calculatingShippingSchema.safeParse(req.query);
    if (!parseResult.success) {
        return res.status(400).json({ error: 'Invalid zip code' });
    }

    const { zipCode } = parseResult.data;
    const shippingCost = 20.00;
    const shippingDays = 3;

    res.json({ shippingCost, shippingDays, zipCode });
};

export const finishCart: RequestHandler = async (req, res) => {
    const userId = (req as any).userId;
    if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    const parseResult = cartFinishSchema.safeParse(req.body);
    if (!parseResult.success) {
        return res.status(400).json({ error: 'Invalid cart data' });
    }

    const { addressId, cart } = parseResult.data;

    const address = await getAddressById(userId, addressId);
    if (!address) {
        return res.status(400).json({ error: 'Address not found' });
    }

    const shippingCost = 20.00;
    const shippingDay = 3;

    const orderId = await createOrder({ userId, address, shippingCost, shippingDay, cart });
    if (!orderId) {
        return res.status(500).json({ error: 'Failed to create order' });
    }

    const paymentUrl = await createPaymentLink({ orderId, cart, shippingCost });
    if (!paymentUrl) {
        return res.status(500).json({ error: 'Failed to create payment link' });
    }

    res.json({ orderId, paymentUrl });
};
