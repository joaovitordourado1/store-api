import type { Address } from '../types/address';
import { prisma } from '../libs/prisma';
import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcrypt';

const SALT_ROUNDS = 10;

export const createUser = async (name: string, email: string, password: string) => {
    const existingUser = await prisma.user.findUnique({
        where: { email },
    });

    if (existingUser) return null;

    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    const user = await prisma.user.create({
        data: {
            name,
            email: email.toLowerCase(),
            password: hashedPassword,
        },
    });

    if (!user) return null;

    return {
        id: user.id,
        name: user.name,
        email: user.email,
    };
};

export const logUser = async (email: string, password: string) => {
    const user = await prisma.user.findUnique({
        where: { email },
    });

    if (!user) return null;

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) return null;

    const token = uuidv4();

    await prisma.user.update({
        where: { id: user.id },
        data: { token },
    });

    return token;
};

export const getUserIdByToken = async (token: string) => {
    const user = await prisma.user.findFirst({
        where: { token },
    });

    if (!user) return null;

    return { id: user.id };
};

export const createAddress = async (userId: number, data: Address) => {
    return prisma.userAddress.create({
        data: {
            ...data,
            userId,
        },
    });
};

export const getAddressesByUserId = async (userId: number) => {
    return prisma.userAddress.findMany({
        where: { userId },
        select: {
            id: true,
            zipcode: true,
            street: true,
            number: true,
            complement: true,
            city: true,
            state: true,
            country: true,
        },
    });
};

export const getAddressById = async (userId: number, addressId: number) => {
    return prisma.userAddress.findFirst({
        where: {
            id: addressId,
            userId,
        },
        select: {
            id: true,
            zipcode: true,
            street: true,
            number: true,
            complement: true,
            city: true,
            state: true,
            country: true,
        },
    });
};
