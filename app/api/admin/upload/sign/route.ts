export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { v2 as cloudinary } from 'cloudinary';

export async function POST() {
    try {
        const session = await getServerSession(authOptions);

        if (!session || (session.user as any).role !== 'ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const timestamp = Math.round(new Date().getTime() / 1000);

        // Generate signature
        // The folder property matches what we used in the direct upload
        const signature = cloudinary.utils.api_sign_request(
            {
                timestamp: timestamp,
                folder: 'socrati_uploads',
            },
            process.env.CLOUDINARY_API_SECRET! // Use secret from environment
        );

        return NextResponse.json({
            signature,
            timestamp,
            cloudName: process.env.CLOUDINARY_CLOUD_NAME || 'dp51rxj6b',
            apiKey: process.env.CLOUDINARY_API_KEY || '961167775428167',
        });
    } catch (error) {
        console.error('Signature Error:', error);
        return NextResponse.json({ error: 'Failed to generate signature' }, { status: 500 });
    }
}
