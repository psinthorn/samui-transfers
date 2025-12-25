-- Migration: Add Payment Reminders System
-- Date: 2024-12-07
-- Purpose: Add PaymentReminder model to track payment reminder history and settings

CREATE TABLE IF NOT EXISTS "PaymentReminder" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "bookingId" TEXT NOT NULL,
  "reminderType" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'PENDING',
  "sentAt" TIMESTAMP(3),
  "failureReason" TEXT,
  "nextRetryAt" TIMESTAMP(3),
  "retryCount" INTEGER NOT NULL DEFAULT 0,
  "maxRetries" INTEGER NOT NULL DEFAULT 3,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "PaymentReminder_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "Booking" ("id") ON DELETE CASCADE
);

CREATE INDEX "PaymentReminder_bookingId_idx" on "PaymentReminder"("bookingId");
CREATE INDEX "PaymentReminder_status_idx" on "PaymentReminder"("status");
CREATE INDEX "PaymentReminder_reminderType_idx" on "PaymentReminder"("reminderType");
CREATE INDEX "PaymentReminder_createdAt_idx" on "PaymentReminder"("createdAt");
CREATE INDEX "PaymentReminder_nextRetryAt_idx" on "PaymentReminder"("nextRetryAt");

-- Add payment reminder settings table
CREATE TABLE IF NOT EXISTS "PaymentReminderSettings" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "reminderType" TEXT NOT NULL UNIQUE,
  "hoursAfterBooking" INTEGER NOT NULL,
  "enabled" BOOLEAN NOT NULL DEFAULT true,
  "emailTemplate" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL
);

CREATE INDEX "PaymentReminderSettings_reminderType_idx" on "PaymentReminderSettings"("reminderType");
CREATE INDEX "PaymentReminderSettings_enabled_idx" on "PaymentReminderSettings"("enabled");

-- Insert default reminder settings
INSERT INTO "PaymentReminderSettings" ("id", "reminderType", "hoursAfterBooking", "enabled", "emailTemplate", "createdAt", "updatedAt")
VALUES 
  ('sr_24h', 'FIRST_REMINDER', 24, true, 'payment_reminder_24h', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('sr_48h', 'SECOND_REMINDER', 48, true, 'payment_reminder_48h', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('sr_final', 'FINAL_WARNING', 72, true, 'payment_final_warning', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT DO NOTHING;
