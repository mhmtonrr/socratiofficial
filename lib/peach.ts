/**
 * lib/peach.ts
 * Peach Payments server-side helpers.
 *
 * Flow:
 *  1. getAccessToken()  → POST /api/oauth/token  → JWT
 *  2. createCheckout()  → POST /v2/checkout       → checkoutId
 */

const SANDBOX = process.env.PEACH_SANDBOX !== 'false';

export const PEACH_CONFIG = {
    authUrl: SANDBOX
        ? 'https://sandbox-dashboard.peachpayments.com'
        : 'https://dashboard.peachpayments.com',
    checkoutUrl: SANDBOX
        ? 'https://testsecure.peachpayments.com'
        : 'https://secure.peachpayments.com',
    /** Embedded JS script loaded by the browser */
    sdkUrl: SANDBOX
        ? 'https://sandbox-checkout.peachpayments.com/js/checkout.js'
        : 'https://checkout.peachpayments.com/js/checkout.js',
} as const;

// ── 1. Get OAuth access token ─────────────────────────────────────────────────

interface TokenResponse {
    access_token: string;
    token_type: string;
    expires_in: number;
}

async function getAccessToken(): Promise<string> {
    const res = await fetch(`${PEACH_CONFIG.authUrl}/api/oauth/token`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
            clientId: process.env.PEACH_CLIENT_ID,
            clientSecret: process.env.PEACH_CLIENT_SECRET,
            merchantId: process.env.PEACH_MERCHANT_ID,
        }),
        cache: 'no-store',
    });

    if (!res.ok) {
        const text = await res.text();
        throw new Error(`Peach auth failed (${res.status}): ${text}`);
    }

    const data: TokenResponse = await res.json();
    return data.access_token;
}

// ── 2. Create checkout instance ───────────────────────────────────────────────

export interface PeachCheckoutParams {
    merchantTransactionId: string; // your order number
    amount: number;                 // e.g. 500.00
    currency?: string;              // default ZAR
    shopperResultUrl: string;       // redirect after payment
    notificationUrl: string;        // webhook
    customerEmail?: string;
    customerFirstName?: string;
    customerLastName?: string;
    billingStreet?: string;
    billingCity?: string;
    billingState?: string;
    billingPostcode?: string;
    billingCountry?: string;        // ISO-2, e.g. "ZA"
}

export interface PeachCheckoutResult {
    checkoutId: string;
}

export async function createPeachCheckout(
    params: PeachCheckoutParams
): Promise<PeachCheckoutResult> {
    const token = await getAccessToken();

    // Unique nonce required per request
    const nonce = crypto.randomUUID();

    const payload: Record<string, unknown> = {
        merchantTransactionId: params.merchantTransactionId,
        amount: params.amount.toFixed(2),
        currency: params.currency ?? 'ZAR',
        nonce,
        paymentType: 'DB',
        shopperResultUrl: params.shopperResultUrl,
        notificationUrl: params.notificationUrl,
    };

    if (params.customerEmail) {
        payload.customer = {
            email: params.customerEmail,
            givenName: params.customerFirstName,
            surname: params.customerLastName,
        };
    }

    if (params.billingStreet) {
        payload.billing = {
            street1: params.billingStreet,
            city: params.billingCity,
            state: params.billingState,
            postcode: params.billingPostcode,
            country: params.billingCountry ?? 'ZA',
        };
    }

    const res = await fetch(`${PEACH_CONFIG.checkoutUrl}/v2/checkout`, {
        method: 'POST',
        headers: {
            'content-type': 'application/json',
            authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
        cache: 'no-store',
    });

    if (!res.ok) {
        const text = await res.text();
        throw new Error(`Peach checkout creation failed (${res.status}): ${text}`);
    }

    const data = await res.json();

    // The API returns either { id } or { checkoutId } depending on version
    const checkoutId: string = data.id ?? data.checkoutId;
    if (!checkoutId) {
        throw new Error(`Peach did not return a checkoutId: ${JSON.stringify(data)}`);
    }

    return { checkoutId };
}
