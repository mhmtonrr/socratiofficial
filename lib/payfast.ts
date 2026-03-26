/**
 * lib/payfast.ts
 * Payfast payment provider utility.
 * Handles signature generation and ITN (Instant Transaction Notification) validation.
 * Designed to be extensible — other providers can follow the same pattern.
 */

import crypto from 'crypto';
import https from 'https';

// ─── Config ───────────────────────────────────────────────────────────────────

export const PAYFAST_CONFIG = {
    merchantId: process.env.PAYFAST_MERCHANT_ID!,
    merchantKey: process.env.PAYFAST_MERCHANT_KEY!,
    passphrase: process.env.PAYFAST_PASSPHRASE || '',
    sandbox: process.env.PAYFAST_SANDBOX === 'true',
    get host() {
        return this.sandbox ? 'sandbox.payfast.co.za' : 'www.payfast.co.za';
    },
    get processUrl() {
        return `https://${this.host}/eng/process`;
    },
    get validateUrl() {
        return `https://${this.host}/eng/query/validate`;
    },
};

// ─── Types ────────────────────────────────────────────────────────────────────

export interface PayfastFormData {
    // Merchant
    merchant_id: string;
    merchant_key: string;
    return_url: string;
    cancel_url: string;
    notify_url: string;
    // Customer
    name_first?: string;
    name_last?: string;
    email_address?: string;
    cell_number?: string;
    // Transaction
    m_payment_id: string;
    amount: string;
    item_name: string;
    item_description?: string;
    custom_str1?: string;   // We'll use for orderId
    // Options
    email_confirmation?: string;
    confirmation_address?: string;
    // Signature (added last)
    signature?: string;
}

export interface PayfastITNData {
    m_payment_id?: string;
    pf_payment_id: string;
    payment_status: 'COMPLETE' | 'CANCELLED';
    item_name: string;
    item_description?: string;
    amount_gross?: string;
    amount_fee?: string;
    amount_net?: string;
    custom_str1?: string;
    name_first?: string;
    name_last?: string;
    email_address?: string;
    merchant_id: string;
    signature?: string;
    [key: string]: string | undefined;
}

// ─── Signature Generation ─────────────────────────────────────────────────────

/**
 * Generates the MD5 signature for a Payfast form submission.
 * IMPORTANT: Fields must be in the exact order they appear in the form — NOT alphabetical.
 * Spaces must be encoded as '+', percent-encoding must be UPPERCASE.
 */
export function generateSignature(
    data: Record<string, string>,
    passphrase: string = PAYFAST_CONFIG.passphrase
): string {
    let pfOutput = '';

    for (const key in data) {
        if (Object.prototype.hasOwnProperty.call(data, key)) {
            const val = data[key];
            if (val !== '' && val !== undefined && val !== null) {
                pfOutput += `${key}=${encodeURIComponent(val.trim()).replace(/%20/g, '+')}&`;
            }
        }
    }

    // Remove trailing ampersand
    let getString = pfOutput.slice(0, -1);

    if (passphrase) {
        getString += `&passphrase=${encodeURIComponent(passphrase.trim()).replace(/%20/g, '+')}`;
    }

    return crypto.createHash('md5').update(getString).digest('hex');
}

// ─── Build Form Data ─────────────────────────────────────────────────────────

/**
 * Builds the complete Payfast form data object including the signature.
 * Returns an object ready to be rendered as hidden form inputs.
 */
export function buildPayfastFormData(params: {
    orderId: string;
    orderNumber: string;
    amount: number;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    appUrl: string;
}): PayfastFormData & { signature: string } {
    const { orderId, orderNumber, amount, firstName, lastName, email, phone, appUrl } = params;

    // Amount must be formatted to exactly 2 decimal places
    const formattedAmount = amount.toFixed(2);

    // Sanitize phone number (digits only)
    const sanitizedPhone = phone ? phone.replace(/\D/g, '') : undefined;

    // Build data IN THE EXACT ORDER specified by Payfast docs
    const data: Record<string, string> = {
        // Merchant details
        merchant_id: PAYFAST_CONFIG.merchantId,
        merchant_key: PAYFAST_CONFIG.merchantKey,
        return_url: `${appUrl}/order-success?orderNumber=${orderNumber}`,
        cancel_url: `${appUrl}/payment/cancel?orderNumber=${orderNumber}`,
        notify_url: `${appUrl}/api/payfast/notify`,
        // Customer details
        name_first: firstName,
        name_last: lastName,
        email_address: email,
        ...(sanitizedPhone ? { cell_number: sanitizedPhone } : {}),
        // Transaction details
        m_payment_id: orderNumber,
        amount: formattedAmount,
        item_name: `Order #${orderNumber}`,
        item_description: `Socrati order #${orderNumber}`,
        custom_str1: orderId, // Pass the DB orderId for webhook lookup
        // Options
        email_confirmation: '1',
        confirmation_address: email,
    };

    const signature = generateSignature(data);
    return { ...data, signature } as PayfastFormData & { signature: string };
}

// ─── ITN Validation ───────────────────────────────────────────────────────────

/**
 * Step 1: Validates the ITN signature from Payfast.
 */
export function validateITNSignature(
    pfData: Record<string, string>,
    passphrase: string = PAYFAST_CONFIG.passphrase
): boolean {
    const receivedSignature = pfData['signature'];
    if (!receivedSignature) return false;

    // Build param string excluding signature
    let pfParamString = '';
    for (const key in pfData) {
        if (Object.prototype.hasOwnProperty.call(pfData, key) && key !== 'signature') {
            pfParamString += `${key}=${encodeURIComponent(pfData[key].trim()).replace(/%20/g, '+')}&`;
        }
    }
    pfParamString = pfParamString.slice(0, -1);

    if (passphrase) {
        pfParamString += `&passphrase=${encodeURIComponent(passphrase.trim()).replace(/%20/g, '+')}`;
    }

    const expectedSignature = crypto.createHash('md5').update(pfParamString).digest('hex');
    return receivedSignature === expectedSignature;
}

/**
 * Step 2: Validates that the request IP belongs to a known Payfast server.
 */
export async function validatePayfastIP(ipAddress: string): Promise<boolean> {
    const validHosts = [
        'www.payfast.co.za',
        'sandbox.payfast.co.za',
        'w1w.payfast.co.za',
        'w2w.payfast.co.za',
    ];

    // In sandbox mode, also allow localhost for local testing
    if (PAYFAST_CONFIG.sandbox && (ipAddress === '127.0.0.1' || ipAddress === '::1' || ipAddress === '::ffff:127.0.0.1')) {
        return true;
    }

    const validIPs = new Set<string>();

    await Promise.allSettled(
        validHosts.map(host =>
            new Promise<void>((resolve) => {
                const { lookup } = require('dns');
                lookup(host, { all: true }, (_err: any, addresses: any[]) => {
                    if (addresses) {
                        addresses.forEach(a => validIPs.add(a.address));
                    }
                    resolve();
                });
            })
        )
    );

    return validIPs.has(ipAddress);
}

/**
 * Step 3: Validates that the payment amount matches the order total.
 */
export function validatePaymentAmount(expectedAmount: number, pfAmountGross: string): boolean {
    return Math.abs(expectedAmount - parseFloat(pfAmountGross)) <= 0.01;
}

/**
 * Step 4: Server-to-server confirmation with Payfast.
 */
export function confirmWithPayfast(pfParamString: string): Promise<boolean> {
    return new Promise((resolve) => {
        const postData = pfParamString;
        const options = {
            hostname: PAYFAST_CONFIG.host,
            port: 443,
            path: '/eng/query/validate',
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Content-Length': Buffer.byteLength(postData),
            },
        };

        const req = https.request(options, (res) => {
            let data = '';
            res.on('data', chunk => { data += chunk; });
            res.on('end', () => resolve(data.trim() === 'VALID'));
        });

        req.on('error', (err) => {
            console.error('Payfast server confirm error:', err);
            resolve(false);
        });

        req.write(postData);
        req.end();
    });
}

/**
 * Builds the ITN param string for server confirmation (excludes signature).
 */
export function buildITNParamString(pfData: Record<string, string>): string {
    let pfParamString = '';
    for (const key in pfData) {
        if (Object.prototype.hasOwnProperty.call(pfData, key) && key !== 'signature') {
            pfParamString += `${key}=${encodeURIComponent(pfData[key].trim()).replace(/%20/g, '+')}&`;
        }
    }
    return pfParamString.slice(0, -1);
}
