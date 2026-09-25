import { Resend } from "resend";

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

interface OrderItem {
  name: string;
  quantity: number;
  price: number;
}

interface ReceiptData {
  trackingNumber: string;
  type: "order" | "booking";
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  customerWhatsApp?: string;
  items?: OrderItem[];
  serviceName?: string;
  serviceDate?: string;
  serviceTime?: string;
  subtotal?: number;
  tax?: number;
  shipping?: number;
  total: number;
  currency?: string;
  paymentMethod?: string;
  estimatedDelivery?: string;
  notes?: string;
}

export async function sendReceipt(data: ReceiptData): Promise<{
  success: boolean;
  message: string;
  emailSent?: boolean;
  whatsappUrl?: string;
}> {
  const {
    trackingNumber,
    type,
    customerName,
    customerEmail,
    customerPhone,
    customerWhatsApp,
    items,
    serviceName,
    serviceDate,
    serviceTime,
    subtotal,
    tax,
    shipping,
    total,
    currency = "GHS",
    paymentMethod,
    estimatedDelivery,
    notes,
  } = data;

  const isOrder = type === "order";
  const currencySymbol = currency === "GHS" ? "GH₵" : currency === "USD" ? "$" : currency;

  // Build receipt HTML
  const receiptHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f4f5; margin: 0; padding: 40px 20px;">
  <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
    <!-- Header -->
    <div style="background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%); padding: 32px; text-align: center;">
      <h1 style="color: white; margin: 0; font-size: 28px;">Founders & Footsteps</h1>
      <p style="color: rgba(255,255,255,0.8); margin: 8px 0 0 0; font-size: 14px;">
        ${isOrder ? "Order Confirmation" : "Booking Confirmation"}
      </p>
    </div>

    <!-- Tracking Number Banner -->
    <div style="background: #f0fdf4; padding: 20px; text-align: center; border-bottom: 1px solid #e2e8f0;">
      <p style="color: #16a34a; margin: 0 0 8px 0; font-size: 14px; font-weight: 600;">
        ✓ ${isOrder ? "ORDER" : "BOOKING"} CONFIRMED
      </p>
      <p style="color: #1e293b; margin: 0; font-size: 24px; font-weight: bold; letter-spacing: 2px;">
        ${trackingNumber}
      </p>
    </div>

    <!-- Customer Info -->
    <div style="padding: 24px 32px; border-bottom: 1px solid #e2e8f0;">
      <h2 style="color: #1e293b; margin: 0 0 16px 0; font-size: 18px;">Customer Details</h2>
      <table style="width: 100%; font-size: 14px;">
        <tr>
          <td style="color: #64748b; padding: 4px 0;">Name:</td>
          <td style="color: #1e293b; font-weight: 500; text-align: right;">${customerName}</td>
        </tr>
        <tr>
          <td style="color: #64748b; padding: 4px 0;">Email:</td>
          <td style="color: #1e293b; text-align: right;">${customerEmail}</td>
        </tr>
        ${customerPhone ? `
        <tr>
          <td style="color: #64748b; padding: 4px 0;">Phone:</td>
          <td style="color: #1e293b; text-align: right;">${customerPhone}</td>
        </tr>
        ` : ""}
        ${customerWhatsApp ? `
        <tr>
          <td style="color: #64748b; padding: 4px 0;">WhatsApp:</td>
          <td style="color: #1e293b; text-align: right;">${customerWhatsApp}</td>
        </tr>
        ` : ""}
      </table>
    </div>

    <!-- Order/Booking Details -->
    <div style="padding: 24px 32px; border-bottom: 1px solid #e2e8f0;">
      <h2 style="color: #1e293b; margin: 0 0 16px 0; font-size: 18px;">
        ${isOrder ? "Order Details" : "Booking Details"}
      </h2>
      
      ${isOrder && items ? `
      <table style="width: 100%; font-size: 14px; border-collapse: collapse;">
        <thead>
          <tr style="border-bottom: 1px solid #e2e8f0;">
            <th style="text-align: left; color: #64748b; padding: 8px 0; font-weight: 500;">Item</th>
            <th style="text-align: center; color: #64748b; padding: 8px 0; font-weight: 500;">Qty</th>
            <th style="text-align: right; color: #64748b; padding: 8px 0; font-weight: 500;">Price</th>
          </tr>
        </thead>
        <tbody>
          ${items.map(item => `
          <tr style="border-bottom: 1px solid #f1f5f9;">
            <td style="color: #1e293b; padding: 12px 0;">${item.name}</td>
            <td style="color: #64748b; padding: 12px 0; text-align: center;">${item.quantity}</td>
            <td style="color: #1e293b; padding: 12px 0; text-align: right; font-weight: 500;">
              ${currencySymbol}${(item.price * item.quantity).toLocaleString()}
            </td>
          </tr>
          `).join("")}
        </tbody>
      </table>
      ` : ""}

      ${!isOrder ? `
      <table style="width: 100%; font-size: 14px;">
        <tr>
          <td style="color: #64748b; padding: 8px 0;">Service:</td>
          <td style="color: #1e293b; font-weight: 600; text-align: right;">${serviceName || "N/A"}</td>
        </tr>
        ${serviceDate ? `
        <tr>
          <td style="color: #64748b; padding: 8px 0;">Date:</td>
          <td style="color: #1e293b; text-align: right;">${serviceDate}</td>
        </tr>
        ` : ""}
        ${serviceTime ? `
        <tr>
          <td style="color: #64748b; padding: 8px 0;">Time:</td>
          <td style="color: #1e293b; text-align: right;">${serviceTime}</td>
        </tr>
        ` : ""}
      </table>
      ` : ""}
    </div>

    <!-- Totals -->
    <div style="padding: 24px 32px; background: #f8fafc;">
      <table style="width: 100%; font-size: 14px;">
        ${subtotal ? `
        <tr>
          <td style="color: #64748b; padding: 4px 0;">Subtotal:</td>
          <td style="color: #1e293b; text-align: right;">${currencySymbol}${subtotal.toLocaleString()}</td>
        </tr>
        ` : ""}
        ${tax ? `
        <tr>
          <td style="color: #64748b; padding: 4px 0;">Tax:</td>
          <td style="color: #1e293b; text-align: right;">${currencySymbol}${tax.toLocaleString()}</td>
        </tr>
        ` : ""}
        ${shipping ? `
        <tr>
          <td style="color: #64748b; padding: 4px 0;">Shipping:</td>
          <td style="color: #1e293b; text-align: right;">${currencySymbol}${shipping.toLocaleString()}</td>
        </tr>
        ` : ""}
        <tr>
          <td style="color: #1e293b; padding: 12px 0 0 0; font-size: 18px; font-weight: 700;">Total:</td>
          <td style="color: #1e293b; text-align: right; padding: 12px 0 0 0; font-size: 24px; font-weight: 700;">
            ${currencySymbol}${total.toLocaleString()}
          </td>
        </tr>
      </table>

      ${paymentMethod ? `
      <p style="color: #64748b; font-size: 12px; margin: 16px 0 0 0;">
        Payment Method: <span style="color: #1e293b; font-weight: 500;">${paymentMethod}</span>
      </p>
      ` : ""}
      
      ${estimatedDelivery ? `
      <p style="color: #64748b; font-size: 12px; margin: 8px 0 0 0;">
        Estimated Delivery: <span style="color: #1e293b; font-weight: 500;">${estimatedDelivery}</span>
      </p>
      ` : ""}
    </div>

    ${notes ? `
    <div style="padding: 24px 32px; border-top: 1px solid #e2e8f0;">
      <h3 style="color: #1e293b; margin: 0 0 8px 0; font-size: 14px;">Notes:</h3>
      <p style="color: #64748b; margin: 0; font-size: 14px;">${notes}</p>
    </div>
    ` : ""}

    <!-- Footer -->
    <div style="background: #1e293b; padding: 24px 32px; text-align: center;">
      <p style="color: white; margin: 0 0 8px 0; font-size: 14px;">
        Questions? Contact us at support@foundersfootsteps.com
      </p>
      <p style="color: rgba(255,255,255,0.6); margin: 0; font-size: 12px;">
        © ${new Date().getFullYear()} Founders & Footsteps. All rights reserved.
      </p>
    </div>
  </div>
</body>
</html>
  `;

  let emailSent = false;
  let whatsappUrl: string | undefined;

  // Send email receipt
  if (resend && customerEmail) {
    try {
      await resend.emails.send({
        from: process.env.RESEND_FROM_EMAIL || "Founders & Footsteps <onboarding@resend.dev>",
        to: customerEmail,
        subject: `${isOrder ? "Order" : "Booking"} Confirmation - ${trackingNumber}`,
        html: receiptHtml,
      });
      emailSent = true;
      console.log(`[RECEIPT] Email sent to ${customerEmail} for ${trackingNumber}`);
    } catch (error) {
      console.error("[RECEIPT] Email error:", error);
    }
  }

  // Generate WhatsApp receipt link
  const whatsappNumber = customerWhatsApp || customerPhone;
  if (whatsappNumber) {
    const cleanNumber = whatsappNumber.replace(/\D/g, "");
    const whatsappMessage = generateWhatsAppReceipt(data);
    whatsappUrl = `https://wa.me/${cleanNumber}?text=${encodeURIComponent(whatsappMessage)}`;
  }

  return {
    success: true,
    message: emailSent 
      ? "Receipt sent to email" 
      : whatsappUrl 
      ? "WhatsApp receipt ready" 
      : "Receipt generated",
    emailSent,
    whatsappUrl,
  };
}

function generateWhatsAppReceipt(data: ReceiptData): string {
  const {
    trackingNumber,
    type,
    customerName,
    items,
    serviceName,
    serviceDate,
    serviceTime,
    total,
    currency = "GHS",
  } = data;

  const isOrder = type === "order";
  const currencySymbol = currency === "GHS" ? "GH₵" : currency === "USD" ? "$" : currency;

  let message = `*FOUNDERS & FOOTSTEPS*\n`;
  message += `━━━━━━━━━━━━━━━━━━━━\n\n`;
  message += `✅ *${isOrder ? "ORDER" : "BOOKING"} CONFIRMED*\n\n`;
  message += `📋 *Tracking #:* ${trackingNumber}\n`;
  message += `👤 *Customer:* ${customerName}\n\n`;

  if (isOrder && items) {
    message += `📦 *Order Details:*\n`;
    items.forEach((item, i) => {
      message += `${i + 1}. ${item.name} x${item.quantity} - ${currencySymbol}${(item.price * item.quantity).toLocaleString()}\n`;
    });
    message += `\n`;
  } else {
    message += `📅 *Booking Details:*\n`;
    message += `Service: ${serviceName || "N/A"}\n`;
    if (serviceDate) message += `Date: ${serviceDate}\n`;
    if (serviceTime) message += `Time: ${serviceTime}\n`;
    message += `\n`;
  }

  message += `━━━━━━━━━━━━━━━━━━━━\n`;
  message += `💰 *TOTAL: ${currencySymbol}${total.toLocaleString()}*\n`;
  message += `━━━━━━━━━━━━━━━━━━━━\n\n`;
  message += `Thank you for choosing Founders & Footsteps! 🙏\n\n`;
  message += `Questions? Reply to this message or call us.`;

  return message;
}

// Send receipt via WhatsApp to admin
export async function notifyAdminWhatsApp(
  adminWhatsApp: string,
  data: ReceiptData
): Promise<string> {
  const cleanNumber = adminWhatsApp.replace(/\D/g, "");
  const message = `🔔 *NEW ${data.type.toUpperCase()}*\n\n` + generateWhatsAppReceipt(data);
  return `https://wa.me/${cleanNumber}?text=${encodeURIComponent(message)}`;
}
