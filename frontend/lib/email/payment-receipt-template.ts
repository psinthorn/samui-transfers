import { PaymentMethod, PaymentStatus } from "@prisma/client"

export interface PaymentEmailData {
  paymentId: string
  bookingId: string
  amount: number
  currency: string
  method: PaymentMethod
  status: PaymentStatus
  transactionId: string | null
  payerName: string
  payerEmail: string
  completedAt: Date | string
  booking: {
    pickupLocation: string
    dropoffLocation: string
    pickupDate: string
    pickupTime: string
    passengers: number
    vehicleType: string
  }
}

export function generatePaymentReceiptHTML(data: PaymentEmailData): string {
  const amount = typeof data.amount === "number" ? data.amount : parseFloat(data.amount as any)
  const formattedAmount = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: data.currency || "THB",
  }).format(amount)

  const completedDate = new Date(data.completedAt)
  const formattedDate = completedDate.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })

  const statusColor =
    data.status === "COMPLETED"
      ? "#10b981"
      : data.status === "PENDING"
        ? "#f59e0b"
        : "#ef4444"

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      line-height: 1.6;
      color: #333;
      margin: 0;
      padding: 0;
      background-color: #f5f5f5;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      background-color: white;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 40px 30px;
      text-align: center;
    }
    .header h1 {
      margin: 0;
      font-size: 28px;
      font-weight: 600;
    }
    .content {
      padding: 30px;
    }
    .section {
      margin-bottom: 30px;
    }
    .section-title {
      font-size: 16px;
      font-weight: 600;
      color: #333;
      margin-bottom: 15px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      border-bottom: 2px solid #f0f0f0;
      padding-bottom: 10px;
    }
    .info-row {
      display: flex;
      justify-content: space-between;
      margin-bottom: 12px;
      padding: 8px 0;
    }
    .info-label {
      color: #666;
      font-weight: 500;
    }
    .info-value {
      color: #333;
      font-weight: 600;
    }
    .amount-display {
      background-color: #f9fafb;
      padding: 20px;
      border-radius: 6px;
      margin: 20px 0;
      text-align: center;
      border: 2px solid #f0f0f0;
    }
    .amount {
      font-size: 36px;
      font-weight: 700;
      color: #667eea;
      margin: 0;
    }
    .amount-label {
      font-size: 14px;
      color: #666;
      margin: 5px 0 0 0;
    }
    .status-badge {
      display: inline-block;
      background-color: ${statusColor};
      color: white;
      padding: 6px 12px;
      border-radius: 4px;
      font-size: 12px;
      font-weight: 600;
      text-transform: uppercase;
    }
    .trip-details {
      background-color: #f9fafb;
      padding: 15px;
      border-radius: 6px;
      margin: 15px 0;
    }
    .trip-route {
      font-size: 14px;
      color: #333;
      font-weight: 500;
      margin-bottom: 8px;
    }
    .trip-info {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 10px;
      margin-top: 8px;
    }
    .trip-info-item {
      font-size: 12px;
      color: #666;
    }
    .trip-info-label {
      font-weight: 600;
      color: #333;
    }
    .footer {
      background-color: #f9fafb;
      padding: 20px 30px;
      text-align: center;
      color: #666;
      font-size: 12px;
      border-top: 1px solid #e5e7eb;
    }
    .footer-text {
      margin: 8px 0;
    }
    .support-link {
      color: #667eea;
      text-decoration: none;
      font-weight: 600;
    }
    .divider {
      height: 1px;
      background-color: #e5e7eb;
      margin: 20px 0;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>✓ Payment Receipt</h1>
    </div>
    
    <div class="content">
      <div class="section">
        <p style="color: #333; margin: 0;">Hello ${data.payerName},</p>
        <p style="color: #666; margin: 10px 0 0 0;">Thank you for your payment. Here's your receipt for booking #${data.bookingId}.</p>
      </div>

      <div class="amount-display">
        <p class="amount">${formattedAmount}</p>
        <p class="amount-label">Payment Amount</p>
        <p class="status-badge" style="display: inline-block; margin-top: 10px;">${data.status}</p>
      </div>

      <div class="section">
        <div class="section-title">Payment Information</div>
        <div class="info-row">
          <span class="info-label">Payment Date:</span>
          <span class="info-value">${formattedDate}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Payment Method:</span>
          <span class="info-value">${data.method === "stripe" ? "Credit Card (Stripe)" : data.method === "paypal" ? "PayPal" : data.method}</span>
        </div>
        ${
          data.transactionId
            ? `<div class="info-row">
          <span class="info-label">Transaction ID:</span>
          <span class="info-value" style="font-family: monospace; font-size: 12px;">${data.transactionId}</span>
        </div>`
            : ""
        }
        <div class="info-row">
          <span class="info-label">Booking ID:</span>
          <span class="info-value" style="font-family: monospace;">${data.bookingId}</span>
        </div>
      </div>

      <div class="divider"></div>

      <div class="section">
        <div class="section-title">Trip Details</div>
        <div class="trip-details">
          <div class="trip-route">
            🗺️ ${data.booking.pickupLocation} → ${data.booking.dropoffLocation}
          </div>
          <div class="trip-info">
            <div class="trip-info-item">
              <div class="trip-info-label">📅 Date</div>
              <div>${data.booking.pickupDate}</div>
            </div>
            <div class="trip-info-item">
              <div class="trip-info-label">⏰ Time</div>
              <div>${data.booking.pickupTime}</div>
            </div>
            <div class="trip-info-item">
              <div class="trip-info-label">👥 Passengers</div>
              <div>${data.booking.passengers}</div>
            </div>
            <div class="trip-info-item">
              <div class="trip-info-label">🚗 Vehicle</div>
              <div>${data.booking.vehicleType}</div>
            </div>
          </div>
        </div>
      </div>

      <div class="divider"></div>

      <div class="section">
        <p style="color: #666; font-size: 14px; margin: 0;">
          If you have any questions about your payment or booking, please don't hesitate to contact us. We're here to help!
        </p>
      </div>
    </div>

    <div class="footer">
      <div class="footer-text">
        <strong>Samui Transfers</strong>
      </div>
      <div class="footer-text">
        <a href="mailto:support@samuitransfers.com" class="support-link">support@samuitransfers.com</a>
      </div>
      <div class="footer-text">
        © ${new Date().getFullYear()} Samui Transfers. All rights reserved.
      </div>
      <div class="footer-text" style="margin-top: 15px; color: #999; font-size: 11px;">
        This is an automated receipt. Please do not reply to this email.
      </div>
    </div>
  </div>
</body>
</html>
  `.trim()
}

export function generatePaymentReceiptPlainText(data: PaymentEmailData): string {
  const amount = typeof data.amount === "number" ? data.amount : parseFloat(data.amount as any)
  const formattedAmount = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: data.currency || "THB",
  }).format(amount)

  const completedDate = new Date(data.completedAt)
  const formattedDate = completedDate.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })

  return `
PAYMENT RECEIPT
===============

Hello ${data.payerName},

Thank you for your payment. Here's your receipt for booking #${data.bookingId}.

PAYMENT DETAILS
===============
Amount: ${formattedAmount}
Status: ${data.status}
Payment Date: ${formattedDate}
Payment Method: ${data.method === "stripe" ? "Credit Card (Stripe)" : data.method === "paypal" ? "PayPal" : data.method}
${data.transactionId ? `Transaction ID: ${data.transactionId}\n` : ""}
Booking ID: ${data.bookingId}

TRIP DETAILS
============
Route: ${data.booking.pickupLocation} → ${data.booking.dropoffLocation}
Date: ${data.booking.pickupDate}
Time: ${data.booking.pickupTime}
Passengers: ${data.booking.passengers}
Vehicle: ${data.booking.vehicleType}

If you have any questions about your payment or booking, please contact us at:
support@samuitransfers.com

© ${new Date().getFullYear()} Samui Transfers. All rights reserved.
This is an automated receipt. Please do not reply to this email.
  `.trim()
}
