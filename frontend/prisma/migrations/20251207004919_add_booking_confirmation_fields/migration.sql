-- AlterTable
ALTER TABLE "public"."Booking" ADD COLUMN     "cancellationDate" TIMESTAMP(3),
ADD COLUMN     "cancellationReason" TEXT,
ADD COLUMN     "cancellationRequestedAt" TIMESTAMP(3),
ADD COLUMN     "confirmationSentAt" TIMESTAMP(3),
ADD COLUMN     "referenceNumber" TEXT,
ADD COLUMN     "refundAmount" DECIMAL(65,30),
ADD COLUMN     "refundProcessedAt" TIMESTAMP(3);

-- CreateIndex
CREATE INDEX "Booking_referenceNumber_idx" ON "public"."Booking"("referenceNumber");

-- CreateIndex
CREATE INDEX "Booking_cancellationDate_idx" ON "public"."Booking"("cancellationDate");
