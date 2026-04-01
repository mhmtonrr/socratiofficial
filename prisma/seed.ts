import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

/**
 * SAFE SEED — Uses upsert/connectOrCreate so existing data is NEVER deleted.
 * Running this after a migration will only INSERT missing records, never wipe live data.
 */
async function main() {
    console.log('Running safe seed (upsert mode — existing data will NOT be deleted)...')

    // ── 0. Admin User (securely from env) ──────────────────────────────────
    const adminEmail = process.env.ADMIN_LOGIN_EMAIL || 'admin@socratiofficial.co.za'
    const adminPass = process.env.ADMIN_LOGIN_PASSWORD || 'Socrati#Admin#2024!'

    const hashedPassword = await bcrypt.hash(adminPass, 12)

    await prisma.user.upsert({
        where: { email: adminEmail },
        update: {
            password: hashedPassword, // allow updating password via seed re-run if needed
        },
        create: {
            email: adminEmail,
            password: hashedPassword,
            firstName: 'Admin',
            lastName: 'System',
            role: 'ADMIN',
            isVerified: true,
        },
    })

    // Remove the old legacy admin if it exists
    await prisma.user.deleteMany({
        where: {
            email: 'admin@socrati.com',
        }
    }).catch(() => {});

    // ── 1. Ürün ve Kategori Seeding İptal Edildi ─────────────────────────────
    // Ürünler ve görseller zaten Cloudinary / Admin Paneli aracılığıyla gerçek veritabanında yer aldığından,
    // projenin bu aşamasında sahte/dummy ürünler oluşturulmasına artık gerek yoktur.
    console.log('Safe seed finished — only checked for admin account. No dummy products added.')
}

main()
    .then(async () => { await prisma.$disconnect() })
    .catch(async (e) => {
        console.error(e)
        await prisma.$disconnect()
        process.exit(1)
    })
