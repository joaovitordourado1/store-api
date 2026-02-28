import { prisma } from '../libs/prisma';

export const getCategory = async (id: number) => {
    return prisma.category.findUnique({
        where: { id },
        select: {
            id: true,
            name: true,
            slug: true,
        },
    });
};

export const getCategoryBySlug = async (slug: string) => {
    return prisma.category.findFirst({
        where: { slug },
        select: {
            id: true,
            name: true,
            slug: true,
        },
    });
};

export const getCategoryMetadata = async (categoryId: number) => {
    return prisma.categoryMetadata.findMany({
        where: { categoryId },
        select: {
            id: true,
            name: true,
            values: {
                select: {
                    id: true,
                    label: true,
                },
            },
        },
    });
};
