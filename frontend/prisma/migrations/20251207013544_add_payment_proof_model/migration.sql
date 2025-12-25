-- AlterTable
ALTER TABLE "public"."Booking" ADD COLUMN     "paymentProofStatus" TEXT;

-- CreateTable
CREATE TABLE "public"."PaymentProof" (
    "id" TEXT NOT NULL,
    "bookingId" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "originalFileName" TEXT NOT NULL,
    "filePath" TEXT NOT NULL,
    "fileSize" INTEGER NOT NULL,
    "mimeType" TEXT NOT NULL,
    "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "uploadedBy" TEXT NOT NULL,
    "expectedAmount" DECIMAL(65,30) NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "verifiedAt" TIMESTAMP(3),
    "rejectedAt" TIMESTAMP(3),
    "rejectionReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PaymentProof_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PaymentProof_bookingId_idx" ON "public"."PaymentProof"("bookingId");

-- CreateIndex
CREATE INDEX "PaymentProof_status_idx" ON "public"."PaymentProof"("status");

-- CreateIndex
CREATE INDEX "PaymentProof_uploadedAt_idx" ON "public"."PaymentProof"("uploadedAt");

-- CreateIndex
CREATE INDEX "PaymentProof_uploadedBy_idx" ON "public"."PaymentProof"("uploadedBy");

-- AddForeignKey
ALTER TABLE "public"."PaymentProof" ADD CONSTRAINT "PaymentProof_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "public"."Booking"("id") ON DELETE CASCADE ON UPDATE CASCADE;
