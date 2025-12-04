-- CreateEnum
CREATE TYPE "public"."PaymentMethod" AS ENUM ('stripe', 'paypal', 'bank_transfer', 'cash');

-- CreateEnum
CREATE TYPE "public"."PaymentStatus" AS ENUM ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED', 'CANCELLED', 'REFUNDED', 'PARTIALLY_REFUNDED');

-- CreateTable
CREATE TABLE "public"."Payment" (
    "id" TEXT NOT NULL,
    "bookingId" TEXT NOT NULL,
    "method" "public"."PaymentMethod" NOT NULL,
    "amount" DECIMAL(65,30) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'THB',
    "status" "public"."PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "stripeSessionId" TEXT,
    "stripePaymentIntentId" TEXT,
    "paypalOrderId" TEXT,
    "payer" TEXT,
    "payerEmail" TEXT,
    "payerName" TEXT,
    "transactionId" TEXT,
    "failureReason" TEXT,
    "failureCode" TEXT,
    "metadata" JSONB,
    "webhookData" JSONB,
    "processedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "refundedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Payment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."PaymentWebhook" (
    "id" TEXT NOT NULL,
    "paymentId" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "eventType" TEXT NOT NULL,
    "externalId" TEXT NOT NULL,
    "rawData" JSONB NOT NULL,
    "processed" BOOLEAN NOT NULL DEFAULT false,
    "processedAt" TIMESTAMP(3),
    "errorMessage" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PaymentWebhook_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Payment_stripeSessionId_key" ON "public"."Payment"("stripeSessionId");

-- CreateIndex
CREATE UNIQUE INDEX "Payment_stripePaymentIntentId_key" ON "public"."Payment"("stripePaymentIntentId");

-- CreateIndex
CREATE UNIQUE INDEX "Payment_paypalOrderId_key" ON "public"."Payment"("paypalOrderId");

-- CreateIndex
CREATE UNIQUE INDEX "Payment_transactionId_key" ON "public"."Payment"("transactionId");

-- CreateIndex
CREATE INDEX "Payment_bookingId_idx" ON "public"."Payment"("bookingId");

-- CreateIndex
CREATE INDEX "Payment_method_idx" ON "public"."Payment"("method");

-- CreateIndex
CREATE INDEX "Payment_status_idx" ON "public"."Payment"("status");

-- CreateIndex
CREATE INDEX "Payment_createdAt_idx" ON "public"."Payment"("createdAt");

-- CreateIndex
CREATE INDEX "Payment_processedAt_idx" ON "public"."Payment"("processedAt");

-- CreateIndex
CREATE INDEX "Payment_paypalOrderId_idx" ON "public"."Payment"("paypalOrderId");

-- CreateIndex
CREATE INDEX "Payment_stripeSessionId_idx" ON "public"."Payment"("stripeSessionId");

-- CreateIndex
CREATE INDEX "Payment_payerEmail_idx" ON "public"."Payment"("payerEmail");

-- CreateIndex
CREATE UNIQUE INDEX "PaymentWebhook_externalId_key" ON "public"."PaymentWebhook"("externalId");

-- CreateIndex
CREATE INDEX "PaymentWebhook_paymentId_idx" ON "public"."PaymentWebhook"("paymentId");

-- CreateIndex
CREATE INDEX "PaymentWebhook_provider_idx" ON "public"."PaymentWebhook"("provider");

-- CreateIndex
CREATE INDEX "PaymentWebhook_eventType_idx" ON "public"."PaymentWebhook"("eventType");

-- CreateIndex
CREATE INDEX "PaymentWebhook_processed_idx" ON "public"."PaymentWebhook"("processed");

-- CreateIndex
CREATE INDEX "PaymentWebhook_createdAt_idx" ON "public"."PaymentWebhook"("createdAt");

-- AddForeignKey
ALTER TABLE "public"."Payment" ADD CONSTRAINT "Payment_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "public"."Booking"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."PaymentWebhook" ADD CONSTRAINT "PaymentWebhook_paymentId_fkey" FOREIGN KEY ("paymentId") REFERENCES "public"."Payment"("id") ON DELETE CASCADE ON UPDATE CASCADE;
