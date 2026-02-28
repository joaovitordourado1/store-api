import type { RequestHandler } from 'express';
import { getStripeWebhookSecretKey } from '../utils/get-stripe-webhook-secret-key';
import { getConstructEvent } from '../libs/stripe';
import { updateOrderStatus } from '../services/order';

export const stripeWebhook: RequestHandler = async (req, res) => {
    const sig = req.headers['stripe-signature'] as string;
    const webhookSecret = getStripeWebhookSecretKey();
    const rawBody = req.body;

    const event = await getConstructEvent(rawBody, sig, webhookSecret);
    if (!event) {
        return res.status(400).json({ error: 'Invalid webhook event' });
    }

    const session = event.data.object as any;
    const orderId = parseInt(session.metadata.orderId);

    switch (event.type) {
        case 'checkout.session.completed':
            await updateOrderStatus(orderId, 'paid');
            break;
        case 'checkout.session.async_payment_failed':
            await updateOrderStatus(orderId, 'failed');
            break;
        default:
            console.warn(`Unhandled event type: ${event.type}`);
    }

    res.json({ received: true });
};
