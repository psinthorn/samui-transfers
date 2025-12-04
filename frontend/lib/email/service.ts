/**
 * Email Service Wrapper
 * 
 * This wrapper provides a unified interface for sending emails.
 * Currently uses Resend (which can be configured to use SendGrid, AWS SES, or any other provider).
 * 
 * Environment variables required:
 * - RESEND_API_KEY: API key for Resend service
 * - NEXT_PUBLIC_APP_URL: URL of the application
 */

interface EmailParams {
  to: string
  subject: string
  html: string
  text: string
  from?: string
}

interface EmailResponse {
  success: boolean
  messageId?: string
  error?: string
}

const DEFAULT_FROM_EMAIL = process.env.NEXT_PUBLIC_FROM_EMAIL || "noreply@samuitransfers.com"
const RESEND_API_KEY = process.env.RESEND_API_KEY

/**
 * Send email using Resend service
 * Fallback to console logging in development if API key is not configured
 */
export async function sendEmail(params: EmailParams): Promise<EmailResponse> {
  try {
    // Use configured from address or default
    const fromEmail = params.from || DEFAULT_FROM_EMAIL

    if (!RESEND_API_KEY) {
      // Development mode: log instead of sending
      console.log("📧 Email would be sent (development mode):")
      console.log(`  To: ${params.to}`)
      console.log(`  From: ${fromEmail}`)
      console.log(`  Subject: ${params.subject}`)
      console.log(`  Body: ${params.text.substring(0, 100)}...`)

      return {
        success: true,
        messageId: `dev-${Date.now()}`,
      }
    }

    // Production mode: send via Resend
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: fromEmail,
        to: params.to,
        subject: params.subject,
        html: params.html,
        text: params.text,
      }),
    })

    if (!response.ok) {
      const error = await response.json()
      console.error("Failed to send email:", error)
      return {
        success: false,
        error: error.message || "Failed to send email",
      }
    }

    const data = await response.json()
    console.log(`✓ Email sent to ${params.to}`, data)

    return {
      success: true,
      messageId: data.id,
    }
  } catch (error) {
    console.error("Error sending email:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    }
  }
}

/**
 * Send payment receipt email
 */
export async function sendPaymentReceiptEmail(
  recipientEmail: string,
  recipientName: string,
  htmlContent: string,
  plainTextContent: string
): Promise<EmailResponse> {
  return sendEmail({
    to: recipientEmail,
    subject: `Payment Receipt - Samui Transfers Booking`,
    html: htmlContent,
    text: plainTextContent,
    from: DEFAULT_FROM_EMAIL,
  })
}

/**
 * Send booking confirmation email
 */
export async function sendBookingConfirmationEmail(
  recipientEmail: string,
  recipientName: string,
  bookingId: string,
  bookingDetails: string
): Promise<EmailResponse> {
  const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 8px; }
    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; }
    .content { padding: 30px; }
    .footer { background: #f5f5f5; padding: 20px; text-align: center; color: #666; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>✓ Booking Confirmed</h1>
    </div>
    <div class="content">
      <p>Hi ${recipientName},</p>
      <p>Your booking has been confirmed! Here are your details:</p>
      <p><strong>Booking ID:</strong> ${bookingId}</p>
      <pre>${bookingDetails}</pre>
      <p>If you have any questions, please contact us at support@samuitransfers.com</p>
    </div>
    <div class="footer">
      <p>© ${new Date().getFullYear()} Samui Transfers</p>
    </div>
  </div>
</body>
</html>
  `

  const plainTextContent = `
Booking Confirmed

Hi ${recipientName},

Your booking has been confirmed! Here are your details:

Booking ID: ${bookingId}

${bookingDetails}

If you have any questions, please contact us at support@samuitransfers.com

© ${new Date().getFullYear()} Samui Transfers
  `

  return sendEmail({
    to: recipientEmail,
    subject: `Booking Confirmed - ${bookingId}`,
    html: htmlContent,
    text: plainTextContent,
    from: DEFAULT_FROM_EMAIL,
  })
}

/**
 * Send refund notification email
 */
export async function sendRefundNotificationEmail(
  recipientEmail: string,
  recipientName: string,
  bookingId: string,
  refundAmount: number,
  currency: string
): Promise<EmailResponse> {
  const formattedAmount = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
  }).format(refundAmount)

  const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 8px; }
    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; }
    .content { padding: 30px; }
    .amount { font-size: 32px; color: #667eea; font-weight: bold; }
    .footer { background: #f5f5f5; padding: 20px; text-align: center; color: #666; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>💰 Refund Processed</h1>
    </div>
    <div class="content">
      <p>Hi ${recipientName},</p>
      <p>Your refund has been processed successfully.</p>
      <p>
        <strong>Booking ID:</strong> ${bookingId}<br>
        <strong>Refund Amount:</strong> <span class="amount">${formattedAmount}</span>
      </p>
      <p>The funds will be returned to your original payment method within 3-5 business days.</p>
      <p>If you have any questions, please contact us at support@samuitransfers.com</p>
    </div>
    <div class="footer">
      <p>© ${new Date().getFullYear()} Samui Transfers</p>
    </div>
  </div>
</body>
</html>
  `

  const plainTextContent = `
Refund Processed

Hi ${recipientName},

Your refund has been processed successfully.

Booking ID: ${bookingId}
Refund Amount: ${formattedAmount}

The funds will be returned to your original payment method within 3-5 business days.

If you have any questions, please contact us at support@samuitransfers.com

© ${new Date().getFullYear()} Samui Transfers
  `

  return sendEmail({
    to: recipientEmail,
    subject: `Refund Processed - ${bookingId}`,
    html: htmlContent,
    text: plainTextContent,
    from: DEFAULT_FROM_EMAIL,
  })
}
