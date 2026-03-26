import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

/**
 * SAFE SEED — Uses upsert/connectOrCreate so existing data is NEVER deleted.
 * Running this after a migration will only INSERT missing records, never wipe live data.
 */
async function main() {
    console.log('Running safe seed (upsert mode — existing data will NOT be deleted)...')

    // ── 0. Admin User (safe upsert) ─────────────────────────────────────────
    const adminPassword = await bcrypt.hash('admin123', 12)
    await prisma.user.upsert({
        where: { email: 'admin@socrati.com' },
        update: {},   // never overwrite if admin already exists
        create: {
            email: 'admin@socrati.com',
            password: adminPassword,
            firstName: 'Admin',
            lastName: 'User',
            role: 'ADMIN',
        },
    })

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
