import type { RequestHandler } from 'express';
import { getProductSchema } from '../schemas/get-product-schema';
import { getAllProducts, getProduct, getProductsFromSameCategory, incrementProductViews } from '../services/products';
import { getAbsoluteImageUrl } from '../utils/get-absolute-image-url';
import { getOneProductSchema } from '../schemas/get-one-product-schema';
import { getCategory } from '../services/category';
import { getRelatedProductSchema } from '../schemas/get-related-product';
import { getOneProductquerySchema } from '../schemas/get-one-product-query-schema';

export const getProducts: RequestHandler = async (req, res) => {
    const parseResult = getProductSchema.safeParse(req.query);
    if (!parseResult.success) {
        return res.status(400).json({ error: 'Invalid parameters' });
    }

    const { metadata, orderBy, limit } = parseResult.data;

    const products = await getAllProducts({
        metadata: metadata ? JSON.parse(metadata) : undefined,
        order: orderBy ?? 'views',
        limit: limit ? parseInt(limit) : undefined,
    });

    const result = products.map(product => ({
        ...product,
        image: product.image ? getAbsoluteImageUrl(product.image) : null,
        liked: false,
    }));

    res.json(result);
};

export const getOneProduct: RequestHandler = async (req, res) => {
    const parseResult = getOneProductSchema.safeParse(req.params);
    if (!parseResult.success) {
        return res.status(400).json({ error: 'Invalid parameters' });
    }

    const { id } = parseResult.data;
    const product = await getProduct(parseInt(id));

    if (!product) {
        return res.status(404).json({ error: 'Product not found' });
    }

    const productWithUrls = {
        ...product,
        images: product.images ? product.images.map(img => getAbsoluteImageUrl(img)) : null,
    };

    const category = await getCategory(product.categoryId);
    await incrementProductViews(product.id);

    res.json({ ...productWithUrls, category });
};

export const getRelatedProducts: RequestHandler = async (req, res) => {
    const paramsResult = getRelatedProductSchema.safeParse(req.params);
    const queryResult = getOneProductquerySchema.safeParse(req.query);

    if (!paramsResult.success || !queryResult.success) {
        return res.status(400).json({ error: 'Invalid parameters' });
    }

    const { id } = paramsResult.data;
    const { limit } = queryResult.data;

    const products = await getProductsFromSameCategory(
        parseInt(id),
        limit ? parseInt(limit) : undefined,
    );

    const result = products.map(product => ({
        ...product,
        image: product.image ? getAbsoluteImageUrl(product.image) : null,
    }));

    res.json(result);
};
