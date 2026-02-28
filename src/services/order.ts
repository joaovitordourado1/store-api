import { prisma } from '../libs/prisma';
import type { Address } from '../types/address';
import type { CartItem } from '../types/cart-item';
import { getAbsoluteImageUrl } from '../utils/get-absolute-image-url';
import { getProduct } from './products';

type CreateOrderParams = {
    userId: number;
    address: Address;
    shippingCost: number;
    shippingDay: number;
    cart: CartItem[];
};

export const createOrder = async ({ userId, address, shippingCost, shippingDay, cart }: CreateOrderParams) => {
    let total = 0;
    const orderItems: { productId: number; quantity: number; price: number }[] = [];

    for (const item of cart) {
        const product = await getProduct(item.productId);
        if (product) {
            total += product.price * item.quantity;
            orderItems.push({
                productId: item.productId,
                quantity: item.quantity,
                price: product.price,
            });
        }
    }

    const order = await prisma.order.create({
        data: {
            userId,
            totalPrice: total,
            shippingCost,
            shippingDays: shippingDay,
            shippingZipcode: address.zipcode,
            shippingStreet: address.street,
            shippingNumber: address.number,
            shippingComplement: address.complement,
            shippingCity: address.city,
            shippingState: address.state,
            shippingCountry: address.country,
            orderProducts: {
                create: orderItems,
            },
        },
    });

    if (!order) return null;

    return order.id;
};

export const updateOrderStatus = async (orderId: number, status: 'paid' | 'failed' | 'delivered') => {
    await prisma.order.update({
        where: { id: orderId },
        data: { status },
    });
};

export const getUsersOrders = async (userId: number) => {
    return prisma.order.findMany({
        where: { userId },
        select: {
            id: true,
            status: true,
            totalPrice: true,
            createdAt: true,
        },
        orderBy: { createdAt: 'desc' },
    });
};

export const getOrderById = async (userId: number, orderId: number) => {
    const order = await prisma.order.findFirst({
        where: { id: orderId, userId },
        select: {
            id: true,
            status: true,
            totalPrice: true,
            shippingCost: true,
            shippingDays: true,
            shippingZipcode: true,
            shippingStreet: true,
            shippingNumber: true,
            shippingComplement: true,
            shippingCity: true,
            shippingState: true,
            shippingCountry: true,
            createdAt: true,
            orderProducts: {
                select: {
                    productId: true,
                    quantity: true,
                    price: true,
                    product: {
                        select: {
                            id: true,
                            label: true,
                            images: {
                                take: 1,
                                orderBy: { id: 'asc' },
                            },
                        },
                    },
                },
            },
        },
    });

    if (!order) return null;

    return {
        ...order,
        orderProducts: order.orderProducts.map(item => ({
            ...item,
            product: {
                ...item.product,
                image: item.product.images?.[0]
                    ? getAbsoluteImageUrl(item.product.images[0].url)
                    : null,
            },
        })),
    };
};
