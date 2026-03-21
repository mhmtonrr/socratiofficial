'use client';

import { useEffect, useRef } from 'react';

interface HappyPayWidgetProps {
    /** Product/order price in ZAR (e.g. 500 for R500) */
    amount: number;
    /** Widget layout variant – 'peach' (default) or 'peach2' */
    layout?: 'peach' | 'peach2';
}

/**
 * HappyPay BNPL widget.
 * Dynamically injects the HappyPay script whenever `amount` changes,
 * removing any previous instance first so re-renders stay clean.
 */
export default function HappyPayWidget({ amount, layout = 'peach' }: HappyPayWidgetProps) {
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!containerRef.current) return;

        // Remove any existing HappyPay script to allow re-init on price change
        const existing = document.getElementById('happypay_script');
        if (existing) existing.remove();

        const script = document.createElement('script');
        script.id = 'happypay_script';
        script.src = `https://widgets.happypay.co.za/integrations/shopify_widget.js?amount=${amount}&layout=${layout}`;
        script.async = true;
        script.type = 'application/javascript';

        // Append into our container so the widget renders here
        containerRef.current.appendChild(script);

        return () => {
            const s = document.getElementById('happypay_script');
            if (s) s.remove();
        };
    }, [amount, layout]);

    return <div ref={containerRef} className="happypay-widget-container" />;
}
