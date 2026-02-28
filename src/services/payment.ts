import { createStripeCheckoutSession, getStripeCheckoutSession } from '../libs/stripe';
import type { CartItem } from '../types/cart-item';

type CreatePaymentLinkParams = {
    cart: CartItem[];
    shippingCost: number;
    orderId: number;
};

export const createPaymentLink = async ({ cart, shippingCost, orderId }: CreatePaymentLinkParams) => {
    try {
        const session = await createStripeCheckoutSession({ cart, shippingCost, orderId });
        return session;
    } catch (error) {
        console.error('Error creating Stripe checkout session:', error);
        throw new Error('Failed to create payment link');
    }
};

export const getOrderIdFromSessionId = async (sessionId: string) => {
    try {
        const session = await getStripeCheckoutSession(sessionId);
        const orderId = session.metadata?.orderId;
        return orderId ? parseInt(orderId) : null;
    } catch (error) {
        console.error('Error retrieving Stripe checkout session:', error);
        throw new Error('Failed to retrieve order ID from session');
    }
};
