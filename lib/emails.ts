import { Resend } from 'resend';
import { prisma } from './prisma';

// Resend API Key is required.
const resend = new Resend(process.env.RESEND_API_KEY || 're_dummy_key');

// You should configure a verified domain in Resend for this email to arrive securely
// E.g., 'orders@socrati.com' or 'hello@socrati.com'
// For testing without a verified domain, Resend requires you to use 'onboarding@resend.dev'
// AND you can only send TO the email address associated with your Resend account.
const SENDER_EMAIL = process.env.SENDER_EMAIL || 'onboarding@resend.dev';

export interface EmailParams {
  to: string | string[];
  subject: string;
  html: string;
}

/**
 * Universal email sender function using Resend.
 * @param {EmailParams} params - The recipients, subject, and HTML body of the email.
 * @returns Object with data or error.
 */
export const sendEmail = async ({ to, subject, html }: EmailParams) => {
  try {
    const data = await resend.emails.send({
      from: `Socrati <${SENDER_EMAIL}>`,
      to,
      subject,
      html,
    });

    if (data.error) {
       console.error("Resend API failed:", data.error);
       
       // Log failure
       await prisma.emailLog.create({
         data: {
           to: Array.isArray(to) ? to.join(', ') : to,
           subject,
           body: html,
           status: 'FAILED',
           error: JSON.stringify(data.error),
         }
       }).catch(err => console.error("Could not write to EmailLog (Failed):", err));

       return { success: false, error: data.error };
    }

    // Log success
    await prisma.emailLog.create({
      data: {
        to: Array.isArray(to) ? to.join(', ') : to,
        subject,
        body: html,
        status: 'SENT',
      }
    }).catch(err => console.error("Could not write to EmailLog (Sent):", err));

    return { success: true, data };
  } catch (error: any) {
    console.error('Failed to send email:', error);
    
    await prisma.emailLog.create({
      data: {
        to: Array.isArray(to) ? to.join(', ') : to,
        subject,
        body: html,
        status: 'FAILED',
        error: error.message || String(error),
      }
    }).catch(err => console.error("Could not write to EmailLog (Exception):", err));

    return { success: false, error };
  }
};

/**
 * Checks if a variant reached its low stock threshold and notifies admin.
 */
export const checkAndNotifyLowStock = async (variantId: string) => {
    try {
        const variant = await prisma.productVariant.findUnique({
            where: { id: variantId },
            include: { product: true }
        });

        if (!variant || (variant.lowStockThreshold === undefined || variant.lowStockThreshold === null)) return;

        if (variant.stock <= variant.lowStockThreshold) {
            const { buildLowStockEmail } = await import('./email-templates');
            
            await sendEmail({
                to: process.env.ADMIN_EMAIL || 'admin@socrati.com',
                subject: `⚠️ Low Stock Warning: ${variant.product.name}`,
                html: buildLowStockEmail(variant.product.name, variant.sku, variant.stock)
            });
        }
    } catch (error) {
        console.error("Low stock check error:", error);
    }
};
