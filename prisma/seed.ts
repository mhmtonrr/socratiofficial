import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
    console.log('Seeding comprehensive English database with all categories and products...')

    // Cleanup
    await prisma.productVariant.deleteMany()
    await prisma.productImage.deleteMany()
    await prisma.product.deleteMany()
    await prisma.category.deleteMany()

    // 0. Admin User
    const adminPassword = await bcrypt.hash('admin123', 12);
    await prisma.user.upsert({
        where: { email: 'admin@socrati.com' },
        update: {},
        create: {
            email: 'admin@socrati.com',
            password: adminPassword,
            firstName: 'Admin',
            lastName: 'User',
            role: 'ADMIN',
        }
    });

    // 1. Level 1: Gender
    const catWomen = await prisma.category.create({ data: { name: 'Women', slug: 'women' } })
    const catMen = await prisma.category.create({ data: { name: 'Men', slug: 'men' } })

    // 2. Level 2: Groups
    const catWomenShoes = await prisma.category.create({ data: { name: 'Shoes', slug: 'women-shoes', parentId: catWomen.id } })
    const catWomenBags = await prisma.category.create({ data: { name: 'Bags', slug: 'women-bags', parentId: catWomen.id } })
    const catWomenAcc = await prisma.category.create({ data: { name: 'Accessories', slug: 'women-accessories', parentId: catWomen.id } })

    const catMenShoes = await prisma.category.create({ data: { name: 'Shoes', slug: 'men-shoes', parentId: catMen.id } })
    const catMenBags = await prisma.category.create({ data: { name: 'Bags', slug: 'men-bags', parentId: catMen.id } })
    const catMenAcc = await prisma.category.create({ data: { name: 'Accessories', slug: 'men-accessories', parentId: catMen.id } })

    // 3. Level 3: Subcategories
    const subCats = [
        // Women Shoes
        { name: 'Heels', slug: 'women-heels', parentId: catWomenShoes.id },
        { name: 'Boots', slug: 'women-boots', parentId: catWomenShoes.id },
        { name: 'Sneakers', slug: 'women-sneakers', parentId: catWomenShoes.id },
        { name: 'Loafers', slug: 'women-loafers', parentId: catWomenShoes.id },
        { name: 'Sandals', slug: 'women-sandals', parentId: catWomenShoes.id },
        // Women Bags
        { name: 'Handbags', slug: 'women-handbags', parentId: catWomenBags.id },
        { name: 'Totes', slug: 'women-totes', parentId: catWomenBags.id },
        // Women Acc
        { name: 'Wallets', slug: 'women-wallets', parentId: catWomenAcc.id },
        { name: 'Jewelry', slug: 'women-jewelry', parentId: catWomenAcc.id },
        // Men Shoes
        { name: 'Classic', slug: 'men-classic', parentId: catMenShoes.id },
        { name: 'Boots', slug: 'men-boots', parentId: catMenShoes.id },
        { name: 'Sneakers', slug: 'men-sneakers', parentId: catMenShoes.id },
        { name: 'Loafers', slug: 'men-loafers', parentId: catMenShoes.id },
        // Men Bags
        { name: 'Backpacks', slug: 'men-backpacks', parentId: catMenBags.id },
        { name: 'Briefcases', slug: 'men-briefcases', parentId: catMenBags.id },
        // Men Acc
        { name: 'Wallets', slug: 'men-wallets', parentId: catMenAcc.id },
        { name: 'Belts', slug: 'men-belts', parentId: catMenAcc.id },
    ]

    const catMap: any = {}
    for (const sc of subCats) {
        catMap[sc.slug] = await prisma.category.create({ data: sc })
    }

    // 4. Products
    const productsData = [
        // WOMEN SHOES
        {
            name: 'Stiletto Nero Rugan', slug: 'stiletto-nero-rugan',
            description: 'Timeless elegance with a high-shine patent finish.',
            basePrice: 1250, categoryId: catMap['women-heels'].id,
            imageUrl: 'https://static.ticimax.cloud/7357/uploads/urunresimleri/buyuk/aysel-bayan-stiletto-siyah-rugan-593e.jpg'
        },
        {
            name: 'Suede Chelsea Boots', slug: 'women-chelsea-boots',
            description: 'Handcrafted Italian suede boots with elastic side panels.',
            basePrice: 1450, categoryId: catMap['women-boots'].id,
            imageUrl: 'https://images.unsplash.com/photo-1605812860427-4024433a70fd?q=80&w=1000&auto=format&fit=crop'
        },
        {
            name: 'Urban Knit Sneakers', slug: 'women-urban-sneakers',
            description: 'Lightweight and breathable sneakers for the modern woman.',
            basePrice: 850, categoryId: catMap['women-sneakers'].id,
            imageUrl: 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?q=80&w=1000&auto=format&fit=crop'
        },
        {
            name: 'Gold Embellished Loafers', slug: 'women-gold-loafers',
            description: 'Soft calf leather loafers with a signature gold buckle.',
            basePrice: 980, categoryId: catMap['women-loafers'].id,
            imageUrl: 'https://images.unsplash.com/photo-1591195853828-11db59a44f6b?q=80&w=1000&auto=format&fit=crop'
        },

        // WOMEN BAGS
        {
            name: 'Signature Leather Tote', slug: 'women-signature-tote',
            description: 'Spacious and elegant tote bag in pebbled leather.',
            basePrice: 2200, categoryId: catMap['women-totes'].id,
            imageUrl: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?q=80&w=1000&auto=format&fit=crop'
        },

        // MEN SHOES
        {
            name: 'Oxford Heritage Shoes', slug: 'men-oxford-heritage',
            description: 'Formal lacing and polished calf leather for festive occasions.',
            basePrice: 1550, categoryId: catMap['men-classic'].id,
            imageUrl: 'https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?q=80&w=1000&auto=format&fit=crop'
        },
        {
            name: 'Rugged Suede Boots', slug: 'men-rugged-boots',
            description: 'Durable and stylish boots with a robust sole.',
            basePrice: 1680, categoryId: catMap['men-boots'].id,
            imageUrl: 'https://images.unsplash.com/photo-1491553895911-0055eca6402d?q=80&w=1000&auto=format&fit=crop'
        },
        {
            name: 'Classic Penny Loafers', slug: 'men-penny-loafers',
            description: 'The epitome of smart-casual dressing.',
            basePrice: 1100, categoryId: catMap['men-loafers'].id,
            imageUrl: 'https://images.unsplash.com/photo-1560769629-975ec94e6a86?q=80&w=1000&auto=format&fit=crop'
        },

        // MEN ACCESSORIES
        {
            name: 'Handcrafted Bifold Wallet', slug: 'men-bifold-wallet',
            description: 'Slim profile wallet made from vegetable-tanned leather.',
            basePrice: 350, categoryId: catMap['men-wallets'].id,
            imageUrl: 'https://images.unsplash.com/photo-1627123424574-724758594e93?q=80&w=1000&auto=format&fit=crop'
        }
    ]

    for (const p of productsData) {
        const product = await prisma.product.create({
            data: {
                name: p.name,
                slug: p.slug,
                description: p.description,
                basePrice: p.basePrice,
                categoryId: p.categoryId,
                images: { create: [{ url: p.imageUrl, isMain: true }] }
            }
        })

        // Variants
        const isMen = p.slug.startsWith('men')
        const isOneSize = p.slug.includes('wallet') || p.slug.includes('tote')
        const sizes = isOneSize ? ['One Size'] : (isMen ? ['40', '41', '42', '43', '44'] : ['36', '37', '38', '39', '40'])

        for (const size of sizes) {
            await prisma.productVariant.create({
                data: {
                    sku: `${p.slug.toUpperCase()}-${size}`,
                    productId: product.id,
                    size: size,
                    color: 'Nero Black',
                    colorHex: '#000000',
                    stock: 30,
                    price: p.basePrice
                }
            })
        }
    }

    console.log('Seeding finished: Comprehensive product set created.')
}

main()
    .then(async () => { await prisma.$disconnect() })
    .catch(async (e) => {
        console.error(e)
        await prisma.$disconnect()
        process.exit(1)
    })
