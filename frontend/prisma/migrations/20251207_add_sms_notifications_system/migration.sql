-- AddSMSNotificationsSystem

-- CreateTable SMSMessage
CREATE TABLE "SMSMessage" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "bookingId" TEXT,
    "userId" TEXT NOT NULL,
    "phoneNumber" TEXT NOT NULL,
    "messageType" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "sentAt" TIMESTAMP(3),
    "deliveredAt" TIMESTAMP(3),
    "failureReason" TEXT,
    "twiliSid" TEXT UNIQUE,
    "twiliStatus" TEXT,
    "twiliErrorCode" INTEGER,
    "nextRetryAt" TIMESTAMP(3),
    "retryCount" INTEGER NOT NULL DEFAULT 0,
    "maxRetries" INTEGER NOT NULL DEFAULT 3,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "SMSMessage_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "Booking" ("id") ON DELETE CASCADE,
    CONSTRAINT "SMSMessage_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE
);

-- CreateTable SMSTemplate
CREATE TABLE "SMSTemplate" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "messageType" TEXT NOT NULL UNIQUE,
    "template" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "maxLength" INTEGER NOT NULL DEFAULT 160,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL
);

-- CreateTable SMSSettings
CREATE TABLE "SMSSettings" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL UNIQUE,
    "phoneNumber" TEXT,
    "phoneVerified" BOOLEAN NOT NULL DEFAULT false,
    "phoneVerifiedAt" TIMESTAMP(3),
    "optedOut" BOOLEAN NOT NULL DEFAULT false,
    "optedOutAt" TIMESTAMP(3),
    "optedOutReason" TEXT,
    "bookingConfirmation" BOOLEAN NOT NULL DEFAULT true,
    "paymentReminders" BOOLEAN NOT NULL DEFAULT true,
    "paymentConfirmation" BOOLEAN NOT NULL DEFAULT true,
    "refundNotification" BOOLEAN NOT NULL DEFAULT true,
    "driverNotifications" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "SMSSettings_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE
);

-- CreateIndex
CREATE INDEX "SMSMessage_bookingId_idx" ON "SMSMessage"("bookingId");

-- CreateIndex
CREATE INDEX "SMSMessage_userId_idx" ON "SMSMessage"("userId");

-- CreateIndex
CREATE INDEX "SMSMessage_status_idx" ON "SMSMessage"("status");

-- CreateIndex
CREATE INDEX "SMSMessage_messageType_idx" ON "SMSMessage"("messageType");

-- CreateIndex
CREATE INDEX "SMSMessage_sentAt_idx" ON "SMSMessage"("sentAt");

-- CreateIndex
CREATE INDEX "SMSMessage_createdAt_idx" ON "SMSMessage"("createdAt");

-- CreateIndex
CREATE INDEX "SMSTemplate_messageType_idx" ON "SMSTemplate"("messageType");

-- CreateIndex
CREATE INDEX "SMSTemplate_enabled_idx" ON "SMSTemplate"("enabled");

-- CreateIndex
CREATE INDEX "SMSSettings_userId_idx" ON "SMSSettings"("userId");

-- InsertDefaultTemplates
INSERT INTO "SMSTemplate" ("id", "messageType", "template", "enabled", "maxLength", "createdAt", "updatedAt")
VALUES 
  (gen_random_uuid()::text, 'BOOKING_CONFIRMATION', 'Hi {customerName}! Your Samui Transfers booking {bookingReference} is confirmed. Pickup at {pickupTime}. Reply STOP to opt-out.', true, 160, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (gen_random_uuid()::text, 'PAYMENT_REMINDER', 'Reminder: Payment of {amount} {currency} is pending for booking {bookingReference}. Complete payment: {paymentLink}', true, 160, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (gen_random_uuid()::text, 'PAYMENT_CONFIRMATION', 'Payment confirmed for {bookingReference}! Your booking is now active. Driver will contact you soon.', true, 160, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (gen_random_uuid()::text, 'REFUND_NOTIFICATION', 'Refund of {amount} {currency} has been processed for booking {bookingReference}. Expected in 3-5 business days.', true, 160, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (gen_random_uuid()::text, 'DRIVER_ASSIGNED', '{driverName} is your driver for booking {bookingReference}. Contact: {driverPhone}', true, 160, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (gen_random_uuid()::text, 'DRIVER_ARRIVING', '{driverName} is arriving shortly for booking {bookingReference}. ETA: {eta} minutes.', true, 160, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
