import Stripe from 'stripe';
import { getProduct } from '../services/products';
import { getStripeEnv } from '../utils/get-stripe-env';
import type { CartItem } from '../types/cart-item';

export const stripe = new Stripe(getStripeEnv());

type StripeCheckoutParams = {
    cart: CartItem[];
    shippingCost: number;
    orderId: number;
};

export const createStripeCheckoutSession = async ({ cart, shippingCost, orderId }: StripeCheckoutParams) => {
    const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = [];

    for (const item of cart) {
        const product = await getProduct(item.productId);
        if (product) {
            lineItems.push({
                price_data: {
                    currency: 'usd',
                    product_data: { name: product.label },
                    unit_amount: Math.round(product.price * 100),
                },
                quantity: item.quantity,
            });
        }
    }

    if (shippingCost > 0) {
        lineItems.push({
            price_data: {
                currency: 'usd',
                product_data: { name: 'Shipping' },
                unit_amount: Math.round(shippingCost * 100),
            },
            quantity: 1,
        });
    }

    const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: lineItems,
        mode: 'payment',
        metadata: { orderId: orderId.toString() },
        success_url: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/success`,
        cancel_url: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/cancel`,
    });

    return session.url;
};

export const getConstructEvent = async (rawBody: string, sig: string, webhookSecret: string) => {
    try {
        return stripe.webhooks.constructEvent(rawBody, sig, webhookSecret);
    } catch (error) {
        console.error('Webhook signature verification failed:', error);
        return null;
    }
};

export const getStripeCheckoutSession = async (sessionId: string) => {
    return stripe.checkout.sessions.retrieve(sessionId);
};
