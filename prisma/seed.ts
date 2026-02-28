import 'dotenv/config';
import { PrismaClient } from '../src/generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';
import bcrypt from 'bcrypt';

const { Pool } = pg;
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
    console.log('Seeding database...');

    const hashedPassword = await bcrypt.hash('123456', 10);

    // Users
    const user1 = await prisma.user.upsert({
        where: { email: 'joao@email.com' },
        update: {},
        create: {
            name: 'Joao',
            email: 'joao@email.com',
            password: hashedPassword,
        },
    });

    const user2 = await prisma.user.upsert({
        where: { email: 'maria@email.com' },
        update: {},
        create: {
            name: 'Maria',
            email: 'maria@email.com',
            password: hashedPassword,
        },
    });

    console.log('Users created');

    // Addresses
    await prisma.userAddress.createMany({
        data: [
            {
                userId: user1.id,
                zipcode: '01001000',
                state: 'SP',
                city: 'Sao Paulo',
                street: 'Praca da Se',
                number: '100',
                country: 'Brasil',
                complement: 'Apto 10',
            },
            {
                userId: user2.id,
                zipcode: '20040020',
                state: 'RJ',
                city: 'Rio de Janeiro',
                street: 'Av. Rio Branco',
                number: '200',
                country: 'Brasil',
            },
        ],
        skipDuplicates: true,
    });

    console.log('Addresses created');

    // Banners
    await prisma.banner.createMany({
        data: [
            { img: 'banner1.jpg', link: '/promocoes' },
            { img: 'banner2.jpg', link: '/novidades' },
        ],
        skipDuplicates: true,
    });

    console.log('Banners created');

    // Categories
    const catEletronicos = await prisma.category.upsert({
        where: { slug: 'eletronicos' },
        update: {},
        create: { slug: 'eletronicos', name: 'Eletronicos' },
    });

    const catRoupas = await prisma.category.upsert({
        where: { slug: 'roupas' },
        update: {},
        create: { slug: 'roupas', name: 'Roupas' },
    });

    const catAcessorios = await prisma.category.upsert({
        where: { slug: 'acessorios' },
        update: {},
        create: { slug: 'acessorios', name: 'Acessorios' },
    });

    console.log('Categories created');

    // Category metadata
    const metaCor = await prisma.categoryMetadata.upsert({
        where: { id: 'cor-roupas' },
        update: {},
        create: { id: 'cor-roupas', categoryId: catRoupas.id, name: 'Cor' },
    });

    const metaTamanho = await prisma.categoryMetadata.upsert({
        where: { id: 'tamanho-roupas' },
        update: {},
        create: { id: 'tamanho-roupas', categoryId: catRoupas.id, name: 'Tamanho' },
    });

    await prisma.metaDataValue.createMany({
        data: [
            { id: 'cor-preto', label: 'Preto', categoryMetadataId: metaCor.id },
            { id: 'cor-branco', label: 'Branco', categoryMetadataId: metaCor.id },
            { id: 'cor-azul', label: 'Azul', categoryMetadataId: metaCor.id },
            { id: 'tam-p', label: 'P', categoryMetadataId: metaTamanho.id },
            { id: 'tam-m', label: 'M', categoryMetadataId: metaTamanho.id },
            { id: 'tam-g', label: 'G', categoryMetadataId: metaTamanho.id },
        ],
        skipDuplicates: true,
    });

    console.log('Metadata created');

    // Products
    const product1 = await prisma.product.create({
        data: {
            label: 'Smartphone X',
            description: 'Smartphone com tela AMOLED e 128GB',
            price: 1999.99,
            categoryId: catEletronicos.id,
            img: 'smartphone-x.jpg',
            images: {
                create: [
                    { url: 'smartphone-x-1.jpg' },
                    { url: 'smartphone-x-2.jpg' },
                ],
            },
        },
    });

    const product2 = await prisma.product.create({
        data: {
            label: 'Fone Bluetooth Pro',
            description: 'Fone sem fio com cancelamento de ruido',
            price: 349.90,
            categoryId: catEletronicos.id,
            img: 'fone-bluetooth.jpg',
            images: {
                create: [{ url: 'fone-bluetooth-1.jpg' }],
            },
        },
    });

    const product3 = await prisma.product.create({
        data: {
            label: 'Camiseta Basica',
            description: 'Camiseta 100% algodao',
            price: 59.90,
            categoryId: catRoupas.id,
            img: 'camiseta-basica.jpg',
            images: {
                create: [
                    { url: 'camiseta-basica-1.jpg' },
                    { url: 'camiseta-basica-2.jpg' },
                ],
            },
        },
    });

    const product4 = await prisma.product.create({
        data: {
            label: 'Calca Jeans Slim',
            description: 'Calca jeans corte slim fit',
            price: 149.90,
            categoryId: catRoupas.id,
            img: 'calca-jeans.jpg',
            images: {
                create: [{ url: 'calca-jeans-1.jpg' }],
            },
        },
    });

    const product5 = await prisma.product.create({
        data: {
            label: 'Relogio Digital',
            description: 'Relogio digital a prova dagua',
            price: 199.90,
            categoryId: catAcessorios.id,
            img: 'relogio-digital.jpg',
            images: {
                create: [{ url: 'relogio-digital-1.jpg' }],
            },
        },
    });

    console.log('Products created');

    // Orders
    await prisma.order.create({
        data: {
            userId: user1.id,
            totalPrice: 2349.89,
            status: 'paid',
            shippingCost: 20.00,
            shippingDays: 3,
            shippingZipcode: '01001000',
            shippingState: 'SP',
            shippingCity: 'Sao Paulo',
            shippingStreet: 'Praca da Se',
            shippingNumber: '100',
            shippingCountry: 'Brasil',
            shippingComplement: 'Apto 10',
            orderProducts: {
                create: [
                    { productId: product1.id, quantity: 1, price: 1999.99 },
                    { productId: product2.id, quantity: 1, price: 349.90 },
                ],
            },
        },
    });

    await prisma.order.create({
        data: {
            userId: user2.id,
            totalPrice: 269.70,
            status: 'pending',
            shippingCost: 20.00,
            shippingDays: 3,
            shippingZipcode: '20040020',
            shippingState: 'RJ',
            shippingCity: 'Rio de Janeiro',
            shippingStreet: 'Av. Rio Branco',
            shippingNumber: '200',
            shippingCountry: 'Brasil',
            orderProducts: {
                create: [
                    { productId: product3.id, quantity: 2, price: 59.90 },
                    { productId: product4.id, quantity: 1, price: 149.90 },
                ],
            },
        },
    });

    console.log('Orders created');
    console.log('Seed completed!');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
