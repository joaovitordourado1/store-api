export const getStripeEnv = () => {
    return process.env.STRIPE_KEY || '';
}