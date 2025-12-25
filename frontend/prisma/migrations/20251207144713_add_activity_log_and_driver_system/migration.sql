-- DropForeignKey
ALTER TABLE "public"."SMSMessage" DROP CONSTRAINT "SMSMessage_bookingId_fkey";

-- DropForeignKey
ALTER TABLE "public"."SMSMessage" DROP CONSTRAINT "SMSMessage_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."SMSSettings" DROP CONSTRAINT "SMSSettings_userId_fkey";

-- CreateTable
CREATE TABLE "public"."ActivityLog" (
    "id" TEXT NOT NULL,
    "actorId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "resourceType" TEXT NOT NULL,
    "resourceId" TEXT,
    "oldValues" JSONB,
    "newValues" JSONB,
    "details" TEXT,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ActivityLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Driver" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "licenseNumber" TEXT NOT NULL,
    "licenseExpiry" TIMESTAMP(3),
    "licenseVerified" BOOLEAN NOT NULL DEFAULT false,
    "licenseVerifiedAt" TIMESTAMP(3),
    "vehicleId" TEXT,
    "vehicleType" TEXT,
    "registrationNumber" TEXT,
    "status" TEXT NOT NULL DEFAULT 'offline',
    "acceptingRides" BOOLEAN NOT NULL DEFAULT true,
    "currentLatitude" DECIMAL(10,8),
    "currentLongitude" DECIMAL(11,8),
    "locationUpdatedAt" TIMESTAMP(3),
    "totalTrips" INTEGER NOT NULL DEFAULT 0,
    "cancelledTrips" INTEGER NOT NULL DEFAULT 0,
    "completedTrips" INTEGER NOT NULL DEFAULT 0,
    "averageRating" DECIMAL(3,2),
    "totalReviews" INTEGER NOT NULL DEFAULT 0,
    "backgroundCheckStatus" TEXT,
    "backgroundCheckDate" TIMESTAMP(3),
    "insuranceExpiry" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Driver_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."DriverAssignment" (
    "id" TEXT NOT NULL,
    "driverId" TEXT NOT NULL,
    "bookingId" TEXT NOT NULL,
    "assignmentStatus" TEXT NOT NULL DEFAULT 'assigned',
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "acceptedAt" TIMESTAMP(3),
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "pickupLatitude" DECIMAL(10,8),
    "pickupLongitude" DECIMAL(11,8),
    "estimatedArrival" TIMESTAMP(3),
    "actualArrival" TIMESTAMP(3),
    "rating" INTEGER,
    "ratingComment" TEXT,
    "cancellationReason" TEXT,
    "cancelledAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DriverAssignment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."DriverRating" (
    "id" TEXT NOT NULL,
    "driverId" TEXT NOT NULL,
    "ratedBy" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "comment" TEXT,
    "categories" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DriverRating_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ActivityLog_actorId_createdAt_idx" ON "public"."ActivityLog"("actorId", "createdAt");

-- CreateIndex
CREATE INDEX "ActivityLog_action_createdAt_idx" ON "public"."ActivityLog"("action", "createdAt");

-- CreateIndex
CREATE INDEX "ActivityLog_resourceType_resourceId_idx" ON "public"."ActivityLog"("resourceType", "resourceId");

-- CreateIndex
CREATE INDEX "ActivityLog_createdAt_idx" ON "public"."ActivityLog"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "Driver_userId_key" ON "public"."Driver"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Driver_licenseNumber_key" ON "public"."Driver"("licenseNumber");

-- CreateIndex
CREATE INDEX "Driver_userId_idx" ON "public"."Driver"("userId");

-- CreateIndex
CREATE INDEX "Driver_status_idx" ON "public"."Driver"("status");

-- CreateIndex
CREATE INDEX "Driver_acceptingRides_idx" ON "public"."Driver"("acceptingRides");

-- CreateIndex
CREATE INDEX "Driver_locationUpdatedAt_idx" ON "public"."Driver"("locationUpdatedAt");

-- CreateIndex
CREATE INDEX "DriverAssignment_driverId_idx" ON "public"."DriverAssignment"("driverId");

-- CreateIndex
CREATE INDEX "DriverAssignment_bookingId_idx" ON "public"."DriverAssignment"("bookingId");

-- CreateIndex
CREATE INDEX "DriverAssignment_assignmentStatus_idx" ON "public"."DriverAssignment"("assignmentStatus");

-- CreateIndex
CREATE UNIQUE INDEX "DriverAssignment_bookingId_key" ON "public"."DriverAssignment"("bookingId");

-- CreateIndex
CREATE INDEX "DriverRating_driverId_idx" ON "public"."DriverRating"("driverId");

-- CreateIndex
CREATE INDEX "DriverRating_rating_idx" ON "public"."DriverRating"("rating");

-- AddForeignKey
ALTER TABLE "public"."ActivityLog" ADD CONSTRAINT "ActivityLog_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Driver" ADD CONSTRAINT "Driver_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."DriverAssignment" ADD CONSTRAINT "DriverAssignment_driverId_fkey" FOREIGN KEY ("driverId") REFERENCES "public"."Driver"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."DriverRating" ADD CONSTRAINT "DriverRating_driverId_fkey" FOREIGN KEY ("driverId") REFERENCES "public"."Driver"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."SMSMessage" ADD CONSTRAINT "SMSMessage_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "public"."Booking"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."SMSMessage" ADD CONSTRAINT "SMSMessage_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."SMSSettings" ADD CONSTRAINT "SMSSettings_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
