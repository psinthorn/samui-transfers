-- CreateTable
CREATE TABLE "public"."PaymentGateway" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "description" TEXT,
    "isPublic" BOOLEAN NOT NULL DEFAULT true,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "icon" TEXT,
    "processingTime" TEXT,
    "fees" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PaymentGateway_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PaymentGateway_type_key" ON "public"."PaymentGateway"("type");

-- CreateIndex
CREATE INDEX "PaymentGateway_type_idx" ON "public"."PaymentGateway"("type");

-- CreateIndex
CREATE INDEX "PaymentGateway_isPublic_idx" ON "public"."PaymentGateway"("isPublic");

-- CreateIndex
CREATE INDEX "PaymentGateway_enabled_idx" ON "public"."PaymentGateway"("enabled");

-- CreateIndex
CREATE INDEX "PaymentGateway_displayOrder_idx" ON "public"."PaymentGateway"("displayOrder");
