-- AlterTable
ALTER TABLE "public"."Booking" ALTER COLUMN "paymentAmount" SET DATA TYPE DECIMAL(65,30);

-- CreateTable
CREATE TABLE "public"."ServiceRate" (
    "id" TEXT NOT NULL,
    "vehicleType" TEXT NOT NULL,
    "basePrice" DECIMAL(65,30) NOT NULL,
    "distanceRate" DECIMAL(65,30) NOT NULL,
    "minDistance" INTEGER NOT NULL,
    "maxDistance" INTEGER,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ServiceRate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."PricingRule" (
    "id" TEXT NOT NULL,
    "ruleType" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "multiplier" DECIMAL(65,30) NOT NULL,
    "startTime" TIMESTAMP(3) NOT NULL,
    "endTime" TIMESTAMP(3) NOT NULL,
    "startDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),
    "dayOfWeek" INTEGER[],
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PricingRule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."RateHistory" (
    "id" TEXT NOT NULL,
    "bookingId" TEXT NOT NULL,
    "vehicleType" TEXT NOT NULL,
    "basePrice" DECIMAL(65,30) NOT NULL,
    "distanceRate" DECIMAL(65,30) NOT NULL,
    "appliedRules" JSONB NOT NULL,
    "finalPrice" DECIMAL(65,30) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RateHistory_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ServiceRate_vehicleType_idx" ON "public"."ServiceRate"("vehicleType");

-- CreateIndex
CREATE INDEX "ServiceRate_isActive_idx" ON "public"."ServiceRate"("isActive");

-- CreateIndex
CREATE INDEX "PricingRule_ruleType_idx" ON "public"."PricingRule"("ruleType");

-- CreateIndex
CREATE INDEX "PricingRule_isActive_idx" ON "public"."PricingRule"("isActive");

-- CreateIndex
CREATE INDEX "RateHistory_bookingId_idx" ON "public"."RateHistory"("bookingId");

-- CreateIndex
CREATE INDEX "RateHistory_createdAt_idx" ON "public"."RateHistory"("createdAt");
