-- CreateTable
CREATE TABLE "public"."service_settings" (
    "id" TEXT NOT NULL,
    "serviceType" "public"."ServiceType" NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "maxCapacity" INTEGER NOT NULL DEFAULT 50,
    "minBookingDays" INTEGER NOT NULL DEFAULT 1,
    "maxBookingDays" INTEGER NOT NULL DEFAULT 365,
    "commissionRate" DOUBLE PRECISION NOT NULL DEFAULT 15,
    "description" TEXT NOT NULL DEFAULT '',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "service_settings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "service_settings_serviceType_key" ON "public"."service_settings"("serviceType");

-- CreateIndex
CREATE INDEX "service_settings_serviceType_idx" ON "public"."service_settings"("serviceType");
