import type { RequestHandler } from 'express';
import { registerSchema } from '../schemas/register-schema';
import { loginSchema } from '../schemas/login-schema';
import { addAdressSchema } from '../schemas/add-address-schema';
import { createUser, logUser, createAddress, getAddressesByUserId } from '../services/user';

export const register: RequestHandler = async (req, res) => {
    const result = registerSchema.safeParse(req.body);
    if (!result.success) {
        return res.status(400).json({ error: 'Invalid data' });
    }

    const { name, email, password } = result.data;
    const user = await createUser(name, email, password);

    if (!user) {
        return res.status(409).json({ error: 'Email already in use' });
    }

    res.status(201).json({ user });
};

export const login: RequestHandler = async (req, res) => {
    const result = loginSchema.safeParse(req.body);
    if (!result.success) {
        return res.status(400).json({ error: 'Invalid data' });
    }

    const { email, password } = result.data;
    const token = await logUser(email, password);

    if (!token) {
        return res.status(401).json({ error: 'Invalid email or password' });
    }

    res.json({ token });
};

export const addAddress: RequestHandler = async (req, res) => {
    const userId = (req as any).userId;
    if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    const result = addAdressSchema.safeParse(req.body);
    if (!result.success) {
        return res.status(400).json({ error: 'Invalid data' });
    }

    const address = await createAddress(userId, result.data);
    if (!address) {
        return res.status(500).json({ error: 'Failed to create address' });
    }

    res.status(201).json({ address });
};

export const getAddresses: RequestHandler = async (req, res) => {
    const userId = (req as any).userId;
    if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    const addresses = await getAddressesByUserId(userId);
    res.json({ addresses });
};
