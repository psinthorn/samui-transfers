/**
 * Payment Reminder Service
 * 
 * Handles automated payment reminders for pending bookings:
 * - First reminder after 24 hours
 * - Second reminder after 48 hours
 * - Final warning after 72 hours
 * - Auto-cancel booking if no payment after 72 hours
 */

import { db } from "@/lib/db"
import { sendEmail } from "@/lib/email/service"

interface ReminderTemplate {
  name: string
  hours: number
  subject: string
  getHtmlBody: (bookingRef: string, customerName: string, amount: number) => string
  getTextBody: (bookingRef: string, customerName: string, amount: number) => string
}

const REMINDER_TEMPLATES: Record<string, ReminderTemplate> = {
  FIRST_REMINDER: {
    name: "First Payment Reminder",
    hours: 24,
    subject: "Payment Reminder - Your Samui Transfers Booking",
    getHtmlBody: (bookingRef, customerName, amount) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 8px; }
    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; }
    .content { padding: 30px; }
    .alert { background: #fff3cd; border-left: 4px solid #ffc107; padding: 20px; margin: 20px 0; }
    .button { background: #667eea; color: white; padding: 12px 30px; border-radius: 4px; text-decoration: none; display: inline-block; }
    .footer { background: #f5f5f5; padding: 20px; text-align: center; color: #666; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>💳 Payment Reminder</h1>
    </div>
    <div class="content">
      <p>Hi ${customerName},</p>
      
      <div class="alert">
        <p><strong>Your payment is due!</strong></p>
        <p>We haven't received payment for your booking yet.</p>
      </div>
      
      <p><strong>Booking Reference:</strong> ${bookingRef}</p>
      <p><strong>Outstanding Amount:</strong> ฿${amount.toFixed(2)}</p>
      
      <p>Please complete your payment as soon as possible to confirm your booking. 
      If payment is not received within 72 hours of your booking, your reservation may be cancelled.</p>
      
      <p style="text-align: center; margin-top: 30px;">
        <a href="${process.env.NEXT_PUBLIC_APP_URL}/user/bookings/${bookingRef}" class="button">
          Complete Payment
        </a>
      </p>
      
      <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
      
      <p>If you have any questions or issues with payment, please contact us at support@samuitransfers.com</p>
    </div>
    <div class="footer">
      <p>© ${new Date().getFullYear()} Samui Transfers</p>
    </div>
  </div>
</body>
</html>
    `,
    getTextBody: (bookingRef, customerName, amount) => `
Payment Reminder

Hi ${customerName},

We haven't received payment for your booking yet.

Booking Reference: ${bookingRef}
Outstanding Amount: ฿${amount.toFixed(2)}

Please complete your payment as soon as possible to confirm your booking.
If payment is not received within 72 hours of your booking, your reservation may be cancelled.

Complete payment at: ${process.env.NEXT_PUBLIC_APP_URL}/user/bookings/${bookingRef}

If you have any questions, contact us at support@samuitransfers.com

© ${new Date().getFullYear()} Samui Transfers
    `,
  },

  SECOND_REMINDER: {
    name: "Second Payment Reminder",
    hours: 48,
    subject: "Urgent: Payment Due - Your Samui Transfers Booking",
    getHtmlBody: (bookingRef, customerName, amount) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 8px; }
    .header { background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); color: white; padding: 30px; }
    .content { padding: 30px; }
    .alert { background: #ffe5e5; border-left: 4px solid #f5576c; padding: 20px; margin: 20px 0; }
    .button { background: #f5576c; color: white; padding: 12px 30px; border-radius: 4px; text-decoration: none; display: inline-block; }
    .footer { background: #f5f5f5; padding: 20px; text-align: center; color: #666; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>⚠️ Urgent: Payment Due</h1>
    </div>
    <div class="content">
      <p>Hi ${customerName},</p>
      
      <div class="alert">
        <p><strong>Your payment is now 48 hours overdue.</strong></p>
        <p>If you don't complete payment within the next 24 hours, your booking will be automatically cancelled.</p>
      </div>
      
      <p><strong>Booking Reference:</strong> ${bookingRef}</p>
      <p><strong>Outstanding Amount:</strong> ฿${amount.toFixed(2)}</p>
      
      <p style="text-align: center; margin-top: 30px;">
        <a href="${process.env.NEXT_PUBLIC_APP_URL}/user/bookings/${bookingRef}" class="button">
          Complete Payment Now
        </a>
      </p>
      
      <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
      
      <p>If you experience any issues with payment, please contact us immediately at support@samuitransfers.com</p>
    </div>
    <div class="footer">
      <p>© ${new Date().getFullYear()} Samui Transfers</p>
    </div>
  </div>
</body>
</html>
    `,
    getTextBody: (bookingRef, customerName, amount) => `
Urgent: Payment Due

Hi ${customerName},

Your payment is now 48 hours overdue.
If you don't complete payment within the next 24 hours, your booking will be automatically cancelled.

Booking Reference: ${bookingRef}
Outstanding Amount: ฿${amount.toFixed(2)}

Complete payment now: ${process.env.NEXT_PUBLIC_APP_URL}/user/bookings/${bookingRef}

If you experience any issues, contact us immediately at support@samuitransfers.com

© ${new Date().getFullYear()} Samui Transfers
    `,
  },

  FINAL_WARNING: {
    name: "Final Payment Warning",
    hours: 72,
    subject: "Final Notice: Your Booking Will Be Cancelled",
    getHtmlBody: (bookingRef, customerName, amount) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 8px; }
    .header { background: linear-gradient(135deg, #d32f2f 0%, #c62828 100%); color: white; padding: 30px; }
    .content { padding: 30px; }
    .alert { background: #ffebee; border-left: 4px solid #d32f2f; padding: 20px; margin: 20px 0; }
    .button { background: #d32f2f; color: white; padding: 12px 30px; border-radius: 4px; text-decoration: none; display: inline-block; }
    .footer { background: #f5f5f5; padding: 20px; text-align: center; color: #666; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🚨 Final Notice: Booking Cancellation</h1>
    </div>
    <div class="content">
      <p>Hi ${customerName},</p>
      
      <div class="alert">
        <p><strong>FINAL NOTICE: Your booking will be cancelled in 24 hours if payment is not received.</strong></p>
      </div>
      
      <p><strong>Booking Reference:</strong> ${bookingRef}</p>
      <p><strong>Outstanding Amount:</strong> ฿${amount.toFixed(2)}</p>
      
      <p>This is your final notice. If payment is not received within the next 24 hours, your booking will be automatically cancelled and you will lose your reservation.</p>
      
      <p style="text-align: center; margin-top: 30px;">
        <a href="${process.env.NEXT_PUBLIC_APP_URL}/user/bookings/${bookingRef}" class="button">
          Pay Now to Save Your Booking
        </a>
      </p>
      
      <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
      
      <p>Contact support immediately if you need help: support@samuitransfers.com or +66 XX XXXX XXXX</p>
    </div>
    <div class="footer">
      <p>© ${new Date().getFullYear()} Samui Transfers</p>
    </div>
  </div>
</body>
</html>
    `,
    getTextBody: (bookingRef, customerName, amount) => `
Final Notice: Booking Cancellation

Hi ${customerName},

FINAL NOTICE: Your booking will be cancelled in 24 hours if payment is not received.

Booking Reference: ${bookingRef}
Outstanding Amount: ฿${amount.toFixed(2)}

This is your final notice. If payment is not received within 24 hours, your booking will be automatically cancelled.

Pay now: ${process.env.NEXT_PUBLIC_APP_URL}/user/bookings/${bookingRef}

Contact support immediately: support@samuitransfers.com

© ${new Date().getFullYear()} Samui Transfers
    `,
  },
}

export async function sendPaymentReminder(
  bookingId: string,
  reminderType: "FIRST_REMINDER" | "SECOND_REMINDER" | "FINAL_WARNING"
): Promise<{ success: boolean; error?: string }> {
  try {
    // Get booking and customer details
    const booking = await db.booking.findUnique({
      where: { id: bookingId },
      include: { user: true },
    })

    if (!booking || !booking.user) {
      throw new Error("Booking or customer not found")
    }

    if (booking.paymentStatus === "COMPLETED") {
      throw new Error("Payment already completed")
    }

    if (!booking.user.email) {
      throw new Error("Customer email not available")
    }

    const template = REMINDER_TEMPLATES[reminderType]
    if (!template) {
      throw new Error(`Unknown reminder type: ${reminderType}`)
    }

    const amount = booking.paymentAmount ? Number(booking.paymentAmount) : 0

    // Send email
    const emailResult = await sendEmail({
      to: booking.user.email,
      subject: template.subject,
      html: template.getHtmlBody(
        booking.referenceNumber || booking.id,
        booking.user.name || "Valued Customer",
        amount
      ),
      text: template.getTextBody(
        booking.referenceNumber || booking.id,
        booking.user.name || "Valued Customer",
        amount
      ),
    })

    if (!emailResult.success) {
      throw new Error(emailResult.error || "Failed to send email")
    }

    // Create or update reminder record
    await db.paymentReminder.upsert({
      where: {
        id: `${bookingId}-${reminderType}`,
      },
      create: {
        id: `${bookingId}-${reminderType}`,
        bookingId,
        reminderType,
        status: "SENT",
        sentAt: new Date(),
      },
      update: {
        status: "SENT",
        sentAt: new Date(),
        retryCount: 0,
      },
    })

    console.log(`✓ Payment reminder sent (${reminderType}) to ${booking.user.email}`)
    return { success: true }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error"
    console.error(`✗ Failed to send payment reminder: ${errorMessage}`)

    // Create failed reminder record
    try {
      const existing = await db.paymentReminder.findUnique({
        where: {
          id: `${bookingId}-${reminderType}`,
        },
      })

      if (existing) {
        await db.paymentReminder.update({
          where: { id: `${bookingId}-${reminderType}` },
          data: {
            status: existing.retryCount < (existing.maxRetries || 3) ? "PENDING" : "FAILED",
            failureReason: errorMessage,
            retryCount: existing.retryCount + 1,
            nextRetryAt: existing.retryCount < (existing.maxRetries || 3)
              ? new Date(Date.now() + 3600000) // Retry in 1 hour
              : null,
          },
        })
      }
    } catch (dbError) {
      console.error("Failed to update reminder record:", dbError)
    }

    return { success: false, error: errorMessage }
  }
}

/**
 * Cancel booking and send cancellation email
 */
export async function cancelBookingDueToPaymentTimeout(bookingId: string): Promise<void> {
  try {
    const booking = await db.booking.findUnique({
      where: { id: bookingId },
      include: { user: true },
    })

    if (!booking) {
      throw new Error("Booking not found")
    }

    // Only cancel if still pending payment
    if (booking.paymentStatus !== "PENDING") {
      console.log(`Booking ${bookingId} not cancelled - payment status is ${booking.paymentStatus}`)
      return
    }

    // Update booking status
    await db.booking.update({
      where: { id: bookingId },
      data: {
        status: "CANCELLED",
        paymentStatus: "CANCELLED",
        cancellationReason: "Automatic cancellation due to payment timeout (72 hours)",
        cancellationDate: new Date(),
      },
    })

    // Send cancellation email
    if (booking.user?.email) {
      await sendEmail({
        to: booking.user.email,
        subject: "Your Samui Transfers Booking Has Been Cancelled",
        html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 8px; }
    .header { background: #f5f5f5; padding: 30px; border-bottom: 4px solid #d32f2f; }
    .content { padding: 30px; }
    .footer { background: #f5f5f5; padding: 20px; text-align: center; color: #666; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Booking Cancelled</h1>
    </div>
    <div class="content">
      <p>Hi ${booking.user?.name || "Valued Customer"},</p>
      
      <p>Your booking has been automatically cancelled due to non-payment.</p>
      
      <p><strong>Booking Reference:</strong> ${booking.referenceNumber || booking.id}</p>
      
      <p>We did not receive payment within 72 hours of your booking. If you still need a transfer, 
      please create a new booking and complete payment immediately.</p>
      
      <p>If you believe this is a mistake or need assistance, please contact us at support@samuitransfers.com</p>
    </div>
    <div class="footer">
      <p>© ${new Date().getFullYear()} Samui Transfers</p>
    </div>
  </div>
</body>
</html>
        `,
        text: `
Your booking has been cancelled

Booking Reference: ${booking.referenceNumber || booking.id}

We did not receive payment within 72 hours of your booking. 
If you still need a transfer, please create a new booking and complete payment immediately.

Contact us: support@samuitransfers.com

© ${new Date().getFullYear()} Samui Transfers
        `,
      })
    }

    console.log(`✓ Booking ${bookingId} cancelled due to payment timeout`)
  } catch (error) {
    console.error("Failed to cancel booking:", error)
    throw error
  }
}

/**
 * Process payment reminders - called by scheduled job
 */
export async function processPaymentReminders(): Promise<{
  processed: number
  sent: number
  cancelled: number
  errors: number
}> {
  const result = {
    processed: 0,
    sent: 0,
    cancelled: 0,
    errors: 0,
  }

  try {
    const now = new Date()

    // Get reminder settings
    const settings = await db.paymentReminderSettings.findMany({
      where: { enabled: true },
    })

    for (const setting of settings) {
      const hoursAgo = new Date(now.getTime() - setting.hoursAfterBooking * 60 * 60 * 1000)

      // Find bookings pending payment that need this reminder
      const bookings = await db.booking.findMany({
        where: {
          paymentStatus: "PENDING",
          status: { not: "CANCELLED" },
          createdAt: {
            gte: new Date(hoursAgo.getTime() - 60 * 60 * 1000), // Within 1 hour window
            lte: hoursAgo,
          },
        },
      })

      for (const booking of bookings) {
        result.processed++

        // Check if reminder already sent
        const existingReminder = await db.paymentReminder.findFirst({
          where: {
            bookingId: booking.id,
            reminderType: setting.reminderType,
          },
        })

        if (existingReminder && existingReminder.status === "SENT") {
          continue // Already sent
        }

        // Send reminder
        const sendResult = await sendPaymentReminder(
          booking.id,
          setting.reminderType as "FIRST_REMINDER" | "SECOND_REMINDER" | "FINAL_WARNING"
        )

        if (sendResult.success) {
          result.sent++
        } else {
          result.errors++
        }

        // If final warning, check if we should cancel
        if (setting.reminderType === "FINAL_WARNING") {
          const finalWarningTime = new Date(booking.createdAt.getTime() + 72 * 60 * 60 * 1000)
          if (now > finalWarningTime) {
            try {
              await cancelBookingDueToPaymentTimeout(booking.id)
              result.cancelled++
            } catch (error) {
              console.error(`Failed to cancel booking ${booking.id}:`, error)
              result.errors++
            }
          }
        }
      }
    }

    console.log(`Payment reminders processed:`, result)
    return result
  } catch (error) {
    console.error("Error processing payment reminders:", error)
    throw error
  }
}
