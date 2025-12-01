/*
  Warnings:

  - You are about to add a `paymentStatus` column to the `Booking` table. All the existing records will be filled with `PENDING`.
  - You are about to add a `paymentId` column to the `Booking` table. This is required to store Stripe Payment Intent ID.
  - You are about to add a `paymentAmount` column to the `Booking` table. This is required to store the charged amount.
  - You are about to add a `paymentMethod` column to the `Booking` table. This is optional.
  - You are about to add a `paymentDate` column to the `Booking` table. This is optional.

*/
-- AlterTable
ALTER TABLE "Booking" ADD COLUMN     "paymentStatus" TEXT NOT NULL DEFAULT 'PENDING',
ADD COLUMN     "paymentId" TEXT,
ADD COLUMN     "paymentAmount" DECIMAL(10,2),
ADD COLUMN     "paymentMethod" TEXT,
ADD COLUMN     "paymentDate" TIMESTAMP(3);

-- CreateIndex
CREATE INDEX "Booking_paymentStatus_idx" ON "Booking"("paymentStatus");
CREATE INDEX "Booking_paymentId_idx" ON "Booking"("paymentId");
