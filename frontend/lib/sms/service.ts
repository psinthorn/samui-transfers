/**
 * SMS Service - Twilio Integration
 * 
 * Handles sending SMS messages through Twilio with:
 * - Multiple message types (booking, payment, driver notifications)
 * - Template-based message generation
 * - User opt-out management
 * - Retry logic for failed messages
 * - Database tracking of all sent messages
 * 
 * Requirements:
 * - TWILIO_ACCOUNT_SID environment variable
 * - TWILIO_AUTH_TOKEN environment variable
 * - TWILIO_PHONE_NUMBER environment variable
 */

import twilio from "twilio"
import { db } from "@/lib/db"

// SMS Message Types
export type SMSMessageType =
  | "BOOKING_CONFIRMATION"
  | "PAYMENT_REMINDER"
  | "PAYMENT_CONFIRMATION"
  | "REFUND_NOTIFICATION"
  | "DRIVER_ASSIGNED"
  | "DRIVER_ARRIVING"

// SMS Template Interface
interface SMSTemplateData {
  bookingReference?: string
  amount?: string
  currency?: string
  driverName?: string
  driverPhone?: string
  pickupTime?: string
  customerName?: string
  paymentLink?: string
  eta?: string
}

// Default SMS Templates
const SMS_TEMPLATES: Record<SMSMessageType, string> = {
  BOOKING_CONFIRMATION:
    "Hi {customerName}! Your Samui Transfers booking {bookingReference} is confirmed. Pickup at {pickupTime}. Reply STOP to opt-out.",
  PAYMENT_REMINDER:
    "Reminder: Payment of {amount} {currency} is pending for booking {bookingReference}. Complete payment: {paymentLink}",
  PAYMENT_CONFIRMATION:
    "Payment confirmed for {bookingReference}! Your booking is now active. Driver will contact you soon.",
  REFUND_NOTIFICATION:
    "Refund of {amount} {currency} has been processed for booking {bookingReference}. Expected in 3-5 business days.",
  DRIVER_ASSIGNED:
    "{driverName} is your driver for booking {bookingReference}. Contact: {driverPhone}",
  DRIVER_ARRIVING:
    "{driverName} is arriving shortly for booking {bookingReference}. ETA: {eta} minutes.",
}

class SMSService {
  private twilioClient: ReturnType<typeof twilio>
  private fromNumber: string

  constructor() {
    const accountSid = process.env.TWILIO_ACCOUNT_SID
    const authToken = process.env.TWILIO_AUTH_TOKEN
    this.fromNumber = process.env.TWILIO_PHONE_NUMBER || ""

    if (!accountSid || !authToken || !this.fromNumber) {
      console.warn(
        "Twilio not fully configured. SMS service will be disabled. Required: TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_PHONE_NUMBER"
      )
    }

    this.twilioClient = twilio(accountSid, authToken)
  }

  /**
   * Send SMS message to customer
   */
  async sendSMS(
    phoneNumber: string,
    messageType: SMSMessageType,
    userId: string,
    bookingId?: string,
    templateData: SMSTemplateData = {}
  ): Promise<{ success: boolean; error?: string; messageSid?: string }> {
    try {
      // Check if user has opted out
      const smsSettings = await db.sMSSettings.findUnique({
        where: { userId },
      })

      if (smsSettings?.optedOut) {
        return {
          success: false,
          error: "User has opted out of SMS notifications",
        }
      }

      // Check notification preference
      const preferenceMap = {
        BOOKING_CONFIRMATION: "bookingConfirmation",
        PAYMENT_REMINDER: "paymentReminders",
        PAYMENT_CONFIRMATION: "paymentConfirmation",
        REFUND_NOTIFICATION: "refundNotification",
        DRIVER_ASSIGNED: "driverNotifications",
        DRIVER_ARRIVING: "driverNotifications",
      } as const

      const prefKey = preferenceMap[messageType as keyof typeof preferenceMap]
      if (smsSettings && prefKey && !smsSettings[prefKey as keyof typeof smsSettings]) {
        return {
          success: false,
          error: `User has disabled ${messageType} notifications`,
        }
      }

      // Get or generate message content
      const messageContent = await this.getMessageContent(
        messageType,
        templateData
      )

      // Create database record
      const smsMessage = await db.sMSMessage.create({
        data: {
          bookingId: bookingId || null,
          userId,
          phoneNumber: this.formatPhoneNumber(phoneNumber),
          messageType,
          content: messageContent,
          status: "PENDING",
        },
      })

      // Send via Twilio
      let twilioSid: string | null = null
      let twilioError: string | null = null

      if (this.twilioClient && this.fromNumber) {
        try {
          const message = await this.twilioClient.messages.create({
            body: messageContent,
            from: this.fromNumber,
            to: this.formatPhoneNumber(phoneNumber),
          })

          twilioSid = message.sid
          console.log(`SMS sent successfully: ${message.sid}`)
        } catch (error: any) {
          twilioError = error.message
          console.error(`Failed to send SMS: ${error.message}`)
        }
      }

      // Update database with Twilio details
      const updatedMessage = await db.sMSMessage.update({
        where: { id: smsMessage.id },
        data: {
          status: twilioSid ? "SENT" : "FAILED",
          sentAt: twilioSid ? new Date() : null,
          twiliSid: twilioSid,
          failureReason: twilioError,
        },
      })

      return {
        success: !!twilioSid,
        error: twilioError || undefined,
        messageSid: twilioSid || undefined,
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error"
      console.error(`SMS service error: ${errorMessage}`)

      return {
        success: false,
        error: errorMessage,
      }
    }
  }

  /**
   * Send multiple SMS messages (for batch operations)
   */
  async sendBatchSMS(
    messages: Array<{
      phoneNumber: string
      messageType: SMSMessageType
      userId: string
      bookingId?: string
      templateData?: SMSTemplateData
    }>
  ): Promise<Array<{ success: boolean; error?: string }>> {
    const results = []

    for (const msg of messages) {
      const result = await this.sendSMS(
        msg.phoneNumber,
        msg.messageType,
        msg.userId,
        msg.bookingId,
        msg.templateData
      )
      results.push(result)

      // Small delay to avoid rate limiting
      await new Promise((resolve) => setTimeout(resolve, 100))
    }

    return results
  }

  /**
   * Get message content from template
   */
  private async getMessageContent(
    messageType: SMSMessageType,
    data: SMSTemplateData
  ): Promise<string> {
    // Try to get from database
    const template = await db.sMSTemplate.findUnique({
      where: { messageType },
    })

    let templateText = template?.template || SMS_TEMPLATES[messageType]

    // Replace placeholders
    let content = templateText
    Object.entries(data).forEach(([key, value]) => {
      content = content.replace(`{${key}}`, String(value || ""))
    })

    return content
  }

  /**
   * Format phone number to international format
   */
  private formatPhoneNumber(phone: string): string {
    // Remove all non-digits
    let cleaned = phone.replace(/\D/g, "")

    // Add country code if needed (default: +66 for Thailand)
    if (cleaned.length === 9 || cleaned.length === 10) {
      cleaned = "66" + cleaned.substring(1) // Replace leading 0 with 66
    }

    if (!cleaned.startsWith("+")) {
      cleaned = "+" + cleaned
    }

    return cleaned
  }

  /**
   * Update SMS template
   */
  async updateTemplate(
    messageType: SMSMessageType,
    template: string
  ): Promise<void> {
    await db.sMSTemplate.upsert({
      where: { messageType },
      update: { template },
      create: {
        messageType,
        template,
        maxLength: 160,
      },
    })
  }

  /**
   * Get user SMS settings
   */
  async getUserSettings(userId: string) {
    return db.sMSSettings.findUnique({
      where: { userId },
    })
  }

  /**
   * Update user SMS settings
   */
  async updateUserSettings(
    userId: string,
    settings: Partial<{
      phoneNumber: string
      optedOut: boolean
      bookingConfirmation: boolean
      paymentReminders: boolean
      paymentConfirmation: boolean
      refundNotification: boolean
      driverNotifications: boolean
    }>
  ) {
    return db.sMSSettings.upsert({
      where: { userId },
      update: {
        phoneNumber: settings.phoneNumber,
        optedOut: settings.optedOut,
        bookingConfirmation: settings.bookingConfirmation,
        paymentReminders: settings.paymentReminders,
        paymentConfirmation: settings.paymentConfirmation,
        refundNotification: settings.refundNotification,
        driverNotifications: settings.driverNotifications,
      },
      create: {
        userId,
        phoneNumber: settings.phoneNumber,
        optedOut: settings.optedOut ?? false,
        bookingConfirmation: settings.bookingConfirmation ?? true,
        paymentReminders: settings.paymentReminders ?? true,
        paymentConfirmation: settings.paymentConfirmation ?? true,
        refundNotification: settings.refundNotification ?? true,
        driverNotifications: settings.driverNotifications ?? true,
      },
    })
  }

  /**
   * Send SMS confirmation code for phone verification
   */
  async sendVerificationCode(
    phoneNumber: string,
    userId: string
  ): Promise<{ success: boolean; error?: string; code?: string }> {
    try {
      // Generate 6-digit code
      const code = Math.floor(100000 + Math.random() * 900000).toString()

      // Send SMS
      const result = await this.sendSMS(
        phoneNumber,
        "BOOKING_CONFIRMATION", // Use existing template for now
        userId,
        undefined,
        {
          customerName: "Customer",
          bookingReference: `Verification code: ${code}`,
          pickupTime: "Valid for 10 minutes",
        }
      )

      if (result.success) {
        // In production, you'd want to store this code temporarily for verification
        return { success: true, code }
      }

      return { success: false, error: result.error }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error"
      return { success: false, error: errorMessage }
    }
  }

  /**
   * Handle SMS opt-out (from webhook or user request)
   */
  async handleOptOut(phoneNumber: string): Promise<void> {
    const formatted = this.formatPhoneNumber(phoneNumber)

    // Find user by phone number and update settings
    const smsSettings = await db.sMSSettings.findFirst({
      where: {
        phoneNumber: formatted,
      },
    })

    if (smsSettings) {
      await db.sMSSettings.update({
        where: { id: smsSettings.id },
        data: {
          optedOut: true,
          optedOutAt: new Date(),
          optedOutReason: "User replied STOP",
        },
      })

      console.log(`User ${smsSettings.userId} opted out of SMS`)
    }
  }

  /**
   * Retry failed SMS messages
   */
  async retryFailedMessages(maxRetries: number = 3): Promise<void> {
    try {
      const failedMessages = await db.sMSMessage.findMany({
        where: {
          status: "FAILED",
          retryCount: { lt: maxRetries },
        },
        orderBy: { createdAt: "asc" },
        take: 50,
      })

      for (const msg of failedMessages) {
        await db.sMSMessage.update({
          where: { id: msg.id },
          data: {
            retryCount: msg.retryCount + 1,
            nextRetryAt: new Date(Date.now() + 5 * 60 * 1000), // Retry in 5 minutes
          },
        })

        // Resend the message
        if (this.twilioClient && this.fromNumber) {
          try {
            const message = await this.twilioClient.messages.create({
              body: msg.content,
              from: this.fromNumber,
              to: msg.phoneNumber,
            })

            await db.sMSMessage.update({
              where: { id: msg.id },
              data: {
                status: "SENT",
                sentAt: new Date(),
                twiliSid: message.sid,
                failureReason: null,
              },
            })
          } catch (error: any) {
            console.error(`Retry failed for ${msg.id}: ${error.message}`)
          }
        }
      }

      console.log(`Retried ${failedMessages.length} failed SMS messages`)
    } catch (error) {
      console.error("Error retrying failed messages:", error)
    }
  }
}

// Export singleton instance
export const smsService = new SMSService()
