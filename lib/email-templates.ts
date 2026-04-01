import { Order, OrderItem } from '@prisma/client';

export const buildOrderConfirmationEmail = (
  order: Order & { items: OrderItem[] },
  customerName: string
) => {
  const formatCurrency = (amount: number | string | any) => {
    return new Intl.NumberFormat('en-ZA', {
      style: 'currency',
      currency: 'ZAR',
    }).format(Number(amount));
  };

  const itemsHtml = order.items
    .map(
      (item) => `
    <tr>
      <td style="padding: 12px; border-bottom: 1px solid #e5e7eb;">
        <strong>${item.productName}</strong><br>
        <small style="color: #6b7280;">Size: ${item.size || 'N/A'} | Color: ${item.color || 'N/A'}</small>
      </td>
      <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: center;">${item.quantity}</td>
      <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: right;">${formatCurrency(item.totalPrice)}</td>
    </tr>
  `
    )
    .join('');

  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #1f2937;">
      <div style="text-align: center; padding: 20px 0; background-color: #000; color: #fff;">
        <h1 style="margin: 0; font-size: 24px;">SOCRATI</h1>
      </div>
      
      <div style="padding: 30px 20px;">
        <h2 style="margin-top: 0;">Order Confirmation</h2>
        <p>Hi ${customerName},</p>
        <p>Thank you for your order! We've received your payment and are getting your order ready to be shipped.</p>
        
        <div style="background-color: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <p style="margin: 0;"><strong>Order Number:</strong> ${order.orderNumber}</p>
          <p style="margin: 5px 0 0 0;"><strong>Order Date:</strong> ${new Date(order.createdAt).toLocaleDateString()}</p>
        </div>

        <h3 style="border-bottom: 2px solid #000; padding-bottom: 8px;">Order Summary</h3>
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 30px;">
          <thead>
            <tr style="background-color: #f9fafb; text-align: left;">
              <th style="padding: 12px; border-bottom: 2px solid #e5e7eb;">Item</th>
              <th style="padding: 12px; border-bottom: 2px solid #e5e7eb; text-align: center;">Qty</th>
              <th style="padding: 12px; border-bottom: 2px solid #e5e7eb; text-align: right;">Total</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHtml}
          </tbody>
          <tfoot>
            <tr>
              <td colspan="2" style="padding: 12px; text-align: right; font-weight: bold;">Subtotal</td>
              <td style="padding: 12px; text-align: right;">${formatCurrency(Number(order.totalAmount) - Number(order.shippingCost))}</td>
            </tr>
            <tr>
              <td colspan="2" style="padding: 12px; text-align: right; font-weight: bold;">Shipping</td>
              <td style="padding: 12px; text-align: right;">${formatCurrency(order.shippingCost)}</td>
            </tr>
            <tr>
              <td colspan="2" style="padding: 12px; text-align: right; font-weight: bold; border-top: 2px solid #000;">Total</td>
              <td style="padding: 12px; text-align: right; font-weight: bold; border-top: 2px solid #000;">${formatCurrency(order.totalAmount)}</td>
            </tr>
          </tfoot>
        </table>

        <p>We will send you another email with tracking details once your order has shipped.</p>
        
        <p style="margin-top: 40px; color: #6b7280;">
          Best regards,<br>
          <strong>Socrati Team</strong>
        </p>
      </div>
    </div>
  `;
};

export const buildAdminNewOrderEmail = (
  order: Order & { items: OrderItem[] },
  customerName: string,
  customerEmail: string
) => {
  const formatCurrency = (amount: number | string | any) => {
    return new Intl.NumberFormat('en-ZA', {
      style: 'currency',
      currency: 'ZAR',
    }).format(Number(amount));
  };

  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #1f2937;">
      <div style="background-color: #fce7f3; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
        <h2 style="margin: 0; color: #be185d;">🚨 New Order Received!</h2>
        <p style="margin: 10px 0 0 0;"><strong>Order:</strong> #${order.orderNumber}</p>
        <p style="margin: 5px 0 0 0;"><strong>Customer:</strong> ${customerName} (${customerEmail})</p>
        <p style="margin: 5px 0 0 0;"><strong>Total Value:</strong> ${formatCurrency(order.totalAmount)}</p>
      </div>
      
      <p>Log in to the <a href="${process.env.NEXT_PUBLIC_APP_URL}/admin/orders" style="color: #2563eb;">Admin Dashboard</a> to manage this order.</p>
    </div>
  `;
};

export const buildWelcomeEmail = (firstName: string) => {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #1f2937;">
      <div style="text-align: center; padding: 20px 0; background-color: #000; color: #fff;">
        <h1 style="margin: 0; font-size: 24px;">SOCRATI</h1>
      </div>
      
      <div style="padding: 30px 20px;">
        <h2 style="margin-top: 0;">Welcome to Socrati, ${firstName}! 🎉</h2>
        <p>We are thrilled to have you here. Your account has been successfully created.</p>
        
        <p>With your new account you can:</p>
        <ul style="background-color: #f3f4f6; padding: 20px 40px; border-radius: 8px;">
          <li style="margin-bottom: 10px;">Check out faster</li>
          <li style="margin-bottom: 10px;">View and track your orders</li>
          <li style="margin-bottom: 10px;">Save your shipping addresses</li>
        </ul>

        <p style="text-align: center; margin-top: 30px;">
          <a href="${process.env.NEXT_PUBLIC_APP_URL}/login" style="background-color: #000; color: #fff; padding: 12px 24px; text-decoration: none; font-weight: bold; border-radius: 4px; display: inline-block;">Log Into Your Account</a>
        </p>

        <p style="margin-top: 40px; color: #6b7280; font-size: 14px;">
          Best regards,<br>
          <strong>The Socrati Team</strong>
        </p>
      </div>
    </div>
  `;
};

export const buildPasswordResetEmail = (resetLink: string) => {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #1f2937;">
      <div style="text-align: center; padding: 20px 0; background-color: #000; color: #fff;">
        <h1 style="margin: 0; font-size: 24px;">SOCRATI</h1>
      </div>
      
      <div style="padding: 30px 20px;">
        <h2 style="margin-top: 0;">Password Reset Request</h2>
        <p>We received a request to reset your password for your Socrati account.</p>
        <p>Click the button below to choose a new password. This link will expire in 1 hour.</p>
        
        <p style="text-align: center; margin-top: 30px; margin-bottom: 30px;">
          <a href="${resetLink}" style="background-color: #000; color: #fff; padding: 12px 24px; text-decoration: none; font-weight: bold; border-radius: 4px; display: inline-block;">Reset Password</a>
        </p>

        <p style="font-size: 14px; color: #6b7280;">If you didn't request a password reset, you can safely ignore this email. Your current password will remain unchanged.</p>

        <p style="margin-top: 40px; color: #6b7280; font-size: 14px;">
          Best regards,<br>
          <strong>The Socrati Team</strong>
        </p>
      </div>
    </div>
  `;
};

export const buildVerificationEmail = (verificationLink: string) => {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #1f2937;">
      <div style="text-align: center; padding: 20px 0; background-color: #000; color: #fff;">
        <h1 style="margin: 0; font-size: 24px;">SOCRATI</h1>
      </div>
      
      <div style="padding: 30px 20px;">
        <h2 style="margin-top: 0;">Verify Your Email Address</h2>
        <p>Thank you for creating an account with Socrati!</p>
        <p>Please click the button below to verify your email address and activate your account. This link will expire in 24 hours.</p>
        
        <p style="text-align: center; margin-top: 30px; margin-bottom: 30px;">
          <a href="${verificationLink}" style="background-color: #000; color: #fff; padding: 12px 24px; text-decoration: none; font-weight: bold; border-radius: 4px; display: inline-block;">Verify Email</a>
        </p>

        <p style="font-size: 14px; color: #6b7280;">If you didn't create this account, you can safely ignore this email.</p>

        <p style="margin-top: 40px; color: #6b7280; font-size: 14px;">
          Best regards,<br>
          <strong>The Socrati Team</strong>
        </p>
      </div>
    </div>
  `;
};

export const buildOrderShippedEmail = (
  orderNumber: string,
  trackingNumber: string | null,
  trackingUrl: string | null
) => {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #1f2937;">
      <div style="text-align: center; padding: 20px 0; background-color: #000; color: #fff;">
        <h1 style="margin: 0; font-size: 24px;">SOCRATI</h1>
      </div>
      
      <div style="padding: 30px 20px;">
        <h2 style="margin-top: 0;">Your Order is on the Way! 🚚</h2>
        <p>Your order #${orderNumber} has been handed over to our shipping partner and is on its way to you.</p>
        
        ${trackingNumber ? `
        <div style="background-color: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0; text-align: center;">
          <p style="margin: 0; font-size: 14px; text-transform: uppercase; letter-spacing: 0.1em; color: #6b7280;">Tracking Number</p>
          <p style="margin: 5px 0 0 0; font-size: 20px; font-weight: bold;">${trackingNumber}</p>
          ${trackingUrl ? `<a href="${trackingUrl}" style="display: inline-block; margin-top: 15px; background-color: #000; color: #fff; padding: 10px 20px; text-decoration: none; font-weight: bold; font-size: 12px; text-transform: uppercase;">Track Package</a>` : ''}
        </div>
        ` : ''}

        <p style="font-size: 14px; color: #6b7280;">If you have any questions about your shipment, please contact our support team.</p>

        <p style="margin-top: 40px; color: #6b7280; font-size: 14px;">
          Best regards,<br>
          <strong>Socrati Team</strong>
        </p>
      </div>
    </div>
  `;
};

export const buildOrderDeliveredEmail = (orderNumber: string) => {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #1f2937;">
      <div style="text-align: center; padding: 20px 0; background-color: #000; color: #fff;">
        <h1 style="margin: 0; font-size: 24px;">SOCRATI</h1>
      </div>
      
      <div style="padding: 30px 20px;">
        <h2 style="margin-top: 0;">Order Delivered 📦</h2>
        <p>Great news! Your order #${orderNumber} has been successfully delivered.</p>
        
        <p>We hope you love your new Socrati items. If there are any issues with your order, or you need to process a return, please visit our website within the next 14 days.</p>

        <p style="text-align: center; margin-top: 30px; margin-bottom: 30px;">
          <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://socratiofficial.co.za'}" style="background-color: #000; color: #fff; padding: 12px 24px; text-decoration: none; font-weight: bold; display: inline-block;">Shop Again</a>
        </p>

        <p style="margin-top: 40px; color: #6b7280; font-size: 14px;">
          Best regards,<br>
          <strong>Socrati Team</strong>
        </p>
      </div>
    </div>
  `;
};

export const buildLowStockEmail = (productName: string, sku: string, stock: number) => {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #1f2937;">
      <div style="background-color: #fef08a; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
        <h2 style="margin: 0; color: #854d0e;">⚠️ Low Stock Alert</h2>
        <p style="margin: 10px 0 0 0;">A product variant has reached its low stock warning threshold.</p>
      </div>

      <div style="padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px;">
        <p style="margin: 0 0 10px 0;"><strong>Product:</strong> ${productName}</p>
        <p style="margin: 0 0 10px 0;"><strong>SKU:</strong> ${sku}</p>
        <p style="margin: 0; color: #dc2626;"><strong>Remaining Stock:</strong> ${stock} left</p>
      </div>
      
      <p style="margin-top: 20px; text-align: center;">
        <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://socratiofficial.co.za'}/admin/inventory" style="background-color: #000; color: #fff; padding: 10px 20px; text-decoration: none; font-weight: bold; border-radius: 4px; display: inline-block;">Manage Inventory</a>
      </p>
    </div>
  `;
};
