import { Router } from 'express';
import { authMiddleware } from '../middlewares/auth';
import * as bannerController from '../controllers/banner';
import * as productController from '../controllers/product';
import * as categoryController from '../controllers/category';
import * as cartController from '../controllers/cart';
import * as userController from '../controllers/user';
import * as webhookController from '../controllers/webhook';
import * as orderController from '../controllers/order';

export const routes = Router();

// Health check
routes.get('/ping', (req, res) => {
    res.json({ message: 'pong' });
});

// Public routes
routes.get('/banners', bannerController.getBanners);
routes.get('/products', productController.getProducts);
routes.get('/products/:id', productController.getOneProduct);
routes.get('/product/:id/related', productController.getRelatedProducts);
routes.get('/category/:slug/metadata', categoryController.getCategoryWithMetadata);
routes.post('/cart/mount', cartController.cartMount);
routes.get('/cart/shipping', cartController.calculateShipping);
routes.post('/user/register', userController.register);
routes.post('/user/login', userController.login);

// Webhook (raw body)
routes.post('/webhook/stripe', webhookController.stripeWebhook);

// Protected routes
routes.post('/user/addresses', authMiddleware, userController.addAddress);
routes.get('/user/addresses', authMiddleware, userController.getAddresses);
routes.post('/cart/finish', authMiddleware, cartController.finishCart);
routes.get('/orders/sessions', orderController.getOrderSessionById);
routes.get('/orders', authMiddleware, orderController.listOrders);
routes.get('/orders/:id', authMiddleware, orderController.getOrderById);
