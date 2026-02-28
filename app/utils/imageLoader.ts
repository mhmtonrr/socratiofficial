'use client';

export default function myImageLoader({ src, width, quality }: { src: string; width: number; quality?: number }) {
    // Cloudinary Optimization
    if (src.startsWith('https://res.cloudinary.com/')) {
        const parts = src.split('/upload/');
        if (parts.length === 2) {
            // Auto-format, auto-quality, and resize via Cloudinary API
            const transformations = `f_auto,c_limit,w_${width},q_${quality || 'auto'}`;
            return `${parts[0]}/upload/${transformations}/${parts[1]}`;
        }
    }

    // Unsplash Optimization (bonus)
    if (src.includes('images.unsplash.com')) {
        const url = new URL(src);
        url.searchParams.set('w', width.toString());
        url.searchParams.set('q', (quality || 75).toString());
        url.searchParams.set('auto', 'format');
        return url.toString();
    }

    // Fallback for local or static images - returns as is
    // Note: Next.js might show a warning if local images don't respond to width changes,
    // but for production builds, it usually works fine or can be silenced with 'unoptimized' on specific tags.
    return src;
}
