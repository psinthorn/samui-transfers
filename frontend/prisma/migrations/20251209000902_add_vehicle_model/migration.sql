-- CreateTable
CREATE TABLE "public"."Vehicle" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "vehicleType" TEXT NOT NULL,
    "registrationNumber" TEXT,
    "capacity" INTEGER NOT NULL,
    "color" TEXT,
    "yearOfManufacture" INTEGER,
    "homePort" TEXT NOT NULL,
    "currentLocation" TEXT,
    "status" TEXT NOT NULL DEFAULT 'AVAILABLE',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "maintenanceUntil" TIMESTAMP(3),
    "lastMaintenanceDate" TIMESTAMP(3),
    "nextMaintenanceDate" TIMESTAMP(3),
    "maintenanceNotes" TEXT,
    "safetyInspectionDate" TIMESTAMP(3),
    "safetyInspectionValid" BOOLEAN NOT NULL DEFAULT true,
    "insuranceExpiry" TIMESTAMP(3),
    "mileage" INTEGER,
    "fuelType" TEXT,
    "fuelCapacity" DECIMAL(65,30),
    "fuelConsumption" DECIMAL(65,30),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Vehicle_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Vehicle_registrationNumber_key" ON "public"."Vehicle"("registrationNumber");

-- CreateIndex
CREATE INDEX "Vehicle_vehicleType_idx" ON "public"."Vehicle"("vehicleType");

-- CreateIndex
CREATE INDEX "Vehicle_status_idx" ON "public"."Vehicle"("status");

-- CreateIndex
CREATE INDEX "Vehicle_homePort_idx" ON "public"."Vehicle"("homePort");

-- CreateIndex
CREATE INDEX "Vehicle_isActive_idx" ON "public"."Vehicle"("isActive");

-- CreateIndex
CREATE INDEX "Vehicle_registrationNumber_idx" ON "public"."Vehicle"("registrationNumber");
