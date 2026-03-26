import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const session = await getServerSession(authOptions);

        if (!session || (session.user as any).role !== 'ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const emailLogs = await prisma.emailLog.findMany({
            orderBy: {
                createdAt: 'desc',
            },
            take: 100, // Limit to recent 100 emails
        });

        return NextResponse.json(emailLogs);
    } catch (error) {
        console.error('Error fetching email logs:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
