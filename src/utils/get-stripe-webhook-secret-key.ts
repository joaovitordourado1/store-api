export const getStripeWebhookSecretKey = () => {
    return process.env.STRIPE_WEBHOOK_SECRET_KEY || '';
}