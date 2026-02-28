import type { RequestHandler } from 'express';
import { getCategoryBySlug, getCategoryMetadata } from '../services/category';

export const getCategoryWithMetadata: RequestHandler = async (req, res) => {
    const { slug } = req.params;

    if (typeof slug !== 'string') {
        return res.status(400).json({ error: 'Invalid slug' });
    }

    const category = await getCategoryBySlug(slug);
    if (!category) {
        return res.status(404).json({ error: 'Category not found' });
    }

    const metadata = await getCategoryMetadata(category.id);

    res.json({ ...category, metadata });
};
