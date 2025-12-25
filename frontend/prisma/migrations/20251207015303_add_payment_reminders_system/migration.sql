-- CreateTable
CREATE TABLE "public"."PaymentReminder" (
    "id" TEXT NOT NULL,
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

    CONSTRAINT "PaymentReminder_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."PaymentReminderSettings" (
    "id" TEXT NOT NULL,
    "reminderType" TEXT NOT NULL,
    "hoursAfterBooking" INTEGER NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "emailTemplate" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PaymentReminderSettings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PaymentReminder_bookingId_idx" ON "public"."PaymentReminder"("bookingId");

-- CreateIndex
CREATE INDEX "PaymentReminder_status_idx" ON "public"."PaymentReminder"("status");

-- CreateIndex
CREATE INDEX "PaymentReminder_reminderType_idx" ON "public"."PaymentReminder"("reminderType");

-- CreateIndex
CREATE INDEX "PaymentReminder_createdAt_idx" ON "public"."PaymentReminder"("createdAt");

-- CreateIndex
CREATE INDEX "PaymentReminder_nextRetryAt_idx" ON "public"."PaymentReminder"("nextRetryAt");

-- CreateIndex
CREATE UNIQUE INDEX "PaymentReminderSettings_reminderType_key" ON "public"."PaymentReminderSettings"("reminderType");

-- CreateIndex
CREATE INDEX "PaymentReminderSettings_reminderType_idx" ON "public"."PaymentReminderSettings"("reminderType");

-- CreateIndex
CREATE INDEX "PaymentReminderSettings_enabled_idx" ON "public"."PaymentReminderSettings"("enabled");

-- AddForeignKey
ALTER TABLE "public"."PaymentReminder" ADD CONSTRAINT "PaymentReminder_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "public"."Booking"("id") ON DELETE CASCADE ON UPDATE CASCADE;
