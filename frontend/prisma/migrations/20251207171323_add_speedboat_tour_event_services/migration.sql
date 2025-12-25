-- CreateEnum
CREATE TYPE "public"."ServiceType" AS ENUM ('TRANSFER', 'BOAT', 'TOUR', 'EVENT', 'PACKAGE');

-- AlterTable
ALTER TABLE "public"."Booking" ADD COLUMN     "isBundle" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "parentBookingId" TEXT,
ADD COLUMN     "serviceId" TEXT,
ADD COLUMN     "serviceType" "public"."ServiceType" NOT NULL DEFAULT 'TRANSFER';

-- AlterTable
ALTER TABLE "public"."Driver" ADD COLUMN     "certifications" JSONB,
ADD COLUMN     "isBoatOperator" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "isTourGuide" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "public"."ServiceRate" ADD COLUMN     "serviceType" "public"."ServiceType" NOT NULL DEFAULT 'TRANSFER';

-- CreateTable
CREATE TABLE "public"."Speedboat" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "boatType" TEXT NOT NULL,
    "capacity" INTEGER NOT NULL,
    "crewSize" INTEGER NOT NULL,
    "length" DECIMAL(65,30),
    "color" TEXT,
    "registrationNumber" TEXT,
    "homePort" TEXT NOT NULL,
    "currentLocation" TEXT,
    "status" TEXT NOT NULL DEFAULT 'AVAILABLE',
    "maintenanceUntil" TIMESTAMP(3),
    "manufacturerYear" INTEGER,
    "lastMaintenanceDate" TIMESTAMP(3),
    "nextMaintenanceDate" TIMESTAMP(3),
    "maintenanceNotes" TEXT,
    "safetyInspectionDate" TIMESTAMP(3),
    "safetyInspectionValid" BOOLEAN NOT NULL DEFAULT true,
    "safetyEquipmentList" JSONB,
    "insuranceExpiry" TIMESTAMP(3),
    "fuelType" TEXT NOT NULL,
    "fuelCapacity" DECIMAL(65,30) NOT NULL,
    "fuelConsumption" DECIMAL(65,30),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Speedboat_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."SpeedboatRate" (
    "id" TEXT NOT NULL,
    "speedboatId" TEXT NOT NULL,
    "serviceType" TEXT NOT NULL,
    "duration" INTEGER NOT NULL,
    "basePrice" DECIMAL(65,30) NOT NULL,
    "pricePerPerson" DECIMAL(65,30),
    "minCapacity" INTEGER NOT NULL,
    "maxCapacity" INTEGER NOT NULL,
    "capacityDiscount" DECIMAL(65,30),
    "fuelSurcharge" DECIMAL(65,30),
    "crewCost" DECIMAL(65,30),
    "isSeasonalRate" BOOLEAN NOT NULL DEFAULT false,
    "seasonStart" INTEGER,
    "seasonEnd" INTEGER,
    "seasonMultiplier" DECIMAL(65,30) NOT NULL DEFAULT 1.0,
    "validFrom" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "validUntil" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SpeedboatRate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."SpeedboatBooking" (
    "id" TEXT NOT NULL,
    "bookingId" TEXT NOT NULL,
    "speedboatId" TEXT NOT NULL,
    "tripType" TEXT NOT NULL,
    "departureTime" TIMESTAMP(3) NOT NULL,
    "returnTime" TIMESTAMP(3) NOT NULL,
    "departurePort" TEXT NOT NULL,
    "returnPort" TEXT NOT NULL,
    "estimatedDistance" DECIMAL(65,30),
    "passengerCount" INTEGER NOT NULL,
    "specialRequests" TEXT,
    "captainId" TEXT,
    "mealIncluded" BOOLEAN NOT NULL DEFAULT false,
    "mealType" TEXT,
    "equipmentRental" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "cancellationReason" TEXT,
    "cancellationTime" TIMESTAMP(3),
    "weatherCancelled" BOOLEAN NOT NULL DEFAULT false,
    "weatherNote" TEXT,
    "safetyChecklist" JSONB,
    "photoUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SpeedboatBooking_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."SpeedboatCaptainAssignment" (
    "id" TEXT NOT NULL,
    "speedboatId" TEXT NOT NULL,
    "captainId" TEXT NOT NULL,
    "assignedDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "boatOperatorLicense" BOOLEAN NOT NULL DEFAULT false,
    "licenseExpiry" TIMESTAMP(3),
    "safetyTraining" BOOLEAN NOT NULL DEFAULT false,
    "safetyTrainingExpiry" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SpeedboatCaptainAssignment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."TourPackage" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "summary" TEXT,
    "tourType" TEXT NOT NULL,
    "duration" INTEGER NOT NULL,
    "durationDays" INTEGER NOT NULL DEFAULT 1,
    "minGroupSize" INTEGER NOT NULL DEFAULT 1,
    "maxGroupSize" INTEGER NOT NULL,
    "defaultGroupSize" INTEGER NOT NULL,
    "islandsCovered" TEXT[],
    "departureLocation" TEXT NOT NULL,
    "returnLocation" TEXT,
    "availableDays" TEXT[],
    "departureTime" TEXT NOT NULL,
    "returnTime" TEXT NOT NULL,
    "seasonalAvailability" BOOLEAN NOT NULL DEFAULT true,
    "seasonStart" INTEGER,
    "seasonEnd" INTEGER,
    "offSeasonAvailable" BOOLEAN NOT NULL DEFAULT false,
    "includedServices" TEXT[],
    "excludedServices" TEXT NOT NULL DEFAULT '[]',
    "imageUrl" TEXT,
    "gallery" TEXT NOT NULL DEFAULT '[]',
    "isPublished" BOOLEAN NOT NULL DEFAULT true,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TourPackage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."TourLocation" (
    "id" TEXT NOT NULL,
    "tourPackageId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "type" TEXT NOT NULL,
    "sequenceNumber" INTEGER NOT NULL,
    "latitude" DECIMAL(65,30) NOT NULL,
    "longitude" DECIMAL(65,30) NOT NULL,
    "island" TEXT,
    "durationMinutes" INTEGER,
    "arrivalTime" TEXT,
    "activity" TEXT,
    "activityDuration" INTEGER,
    "imageUrl" TEXT,
    "notes" TEXT,
    "isFeatured" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TourLocation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."TourRate" (
    "id" TEXT NOT NULL,
    "tourPackageId" TEXT NOT NULL,
    "minGroupSize" INTEGER NOT NULL,
    "maxGroupSize" INTEGER NOT NULL,
    "pricePerPerson" DECIMAL(65,30) NOT NULL,
    "minimumGroupPrice" DECIMAL(65,30),
    "isSeasonalRate" BOOLEAN NOT NULL DEFAULT false,
    "seasonStart" INTEGER,
    "seasonEnd" INTEGER,
    "seasonMultiplier" DECIMAL(65,30) NOT NULL DEFAULT 1.0,
    "mealAddon" DECIMAL(65,30),
    "photographyAddon" DECIMAL(65,30),
    "transportAddon" DECIMAL(65,30),
    "validFrom" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "validUntil" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TourRate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."TourSchedule" (
    "id" TEXT NOT NULL,
    "tourPackageId" TEXT NOT NULL,
    "tourDate" TIMESTAMP(3) NOT NULL,
    "departureTime" TIMESTAMP(3) NOT NULL,
    "maxCapacity" INTEGER NOT NULL,
    "bookedCapacity" INTEGER NOT NULL DEFAULT 0,
    "overridePrice" DECIMAL(65,30),
    "isOpen" BOOLEAN NOT NULL DEFAULT true,
    "isCancelled" BOOLEAN NOT NULL DEFAULT false,
    "cancellationReason" TEXT,
    "notes" TEXT,
    "guideId" TEXT,
    "transportationType" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TourSchedule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."TourBooking" (
    "id" TEXT NOT NULL,
    "bookingId" TEXT NOT NULL,
    "tourPackageId" TEXT NOT NULL,
    "tourScheduleId" TEXT NOT NULL,
    "totalParticipants" INTEGER NOT NULL,
    "childrenCount" INTEGER NOT NULL DEFAULT 0,
    "adultsCount" INTEGER NOT NULL DEFAULT 0,
    "specialRequests" TEXT,
    "pickupLocation" TEXT,
    "guideId" TEXT,
    "addOnServices" TEXT NOT NULL DEFAULT '[]',
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "cancellationReason" TEXT,
    "cancellationTime" TIMESTAMP(3),
    "rating" INTEGER,
    "review" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TourBooking_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."SpecialEvent" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "summary" TEXT,
    "theme" TEXT,
    "venueType" TEXT NOT NULL,
    "venueLocation" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "isRecurring" BOOLEAN NOT NULL DEFAULT false,
    "recurringPattern" TEXT,
    "maxCapacity" INTEGER NOT NULL,
    "registrationFee" DECIMAL(65,30) NOT NULL,
    "includedItems" TEXT[],
    "entertainmentType" TEXT NOT NULL DEFAULT '[]',
    "performerDetails" TEXT,
    "mealOption" TEXT,
    "barOption" TEXT,
    "imageUrl" TEXT,
    "gallery" TEXT NOT NULL DEFAULT '[]',
    "isPublished" BOOLEAN NOT NULL DEFAULT true,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SpecialEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."EventRate" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "tierName" TEXT NOT NULL,
    "description" TEXT,
    "validFrom" TIMESTAMP(3) NOT NULL,
    "validUntil" TIMESTAMP(3) NOT NULL,
    "pricePerPerson" DECIMAL(65,30) NOT NULL,
    "minimumPartySize" INTEGER NOT NULL DEFAULT 1,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EventRate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."EventBooking" (
    "id" TEXT NOT NULL,
    "bookingId" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "totalGuests" INTEGER NOT NULL,
    "guestNames" TEXT NOT NULL DEFAULT '[]',
    "tierBooked" TEXT NOT NULL,
    "tableNumber" TEXT,
    "specialRequests" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "checkInTime" TIMESTAMP(3),
    "cancellationReason" TEXT,
    "rating" INTEGER,
    "review" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EventBooking_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Speedboat_registrationNumber_key" ON "public"."Speedboat"("registrationNumber");

-- CreateIndex
CREATE INDEX "Speedboat_status_idx" ON "public"."Speedboat"("status");

-- CreateIndex
CREATE INDEX "Speedboat_homePort_idx" ON "public"."Speedboat"("homePort");

-- CreateIndex
CREATE INDEX "Speedboat_boatType_idx" ON "public"."Speedboat"("boatType");

-- CreateIndex
CREATE INDEX "Speedboat_maintenanceUntil_idx" ON "public"."Speedboat"("maintenanceUntil");

-- CreateIndex
CREATE INDEX "SpeedboatRate_speedboatId_idx" ON "public"."SpeedboatRate"("speedboatId");

-- CreateIndex
CREATE INDEX "SpeedboatRate_serviceType_idx" ON "public"."SpeedboatRate"("serviceType");

-- CreateIndex
CREATE INDEX "SpeedboatRate_validFrom_idx" ON "public"."SpeedboatRate"("validFrom");

-- CreateIndex
CREATE UNIQUE INDEX "SpeedboatBooking_bookingId_key" ON "public"."SpeedboatBooking"("bookingId");

-- CreateIndex
CREATE INDEX "SpeedboatBooking_bookingId_idx" ON "public"."SpeedboatBooking"("bookingId");

-- CreateIndex
CREATE INDEX "SpeedboatBooking_speedboatId_idx" ON "public"."SpeedboatBooking"("speedboatId");

-- CreateIndex
CREATE INDEX "SpeedboatBooking_departureTime_idx" ON "public"."SpeedboatBooking"("departureTime");

-- CreateIndex
CREATE INDEX "SpeedboatBooking_status_idx" ON "public"."SpeedboatBooking"("status");

-- CreateIndex
CREATE INDEX "SpeedboatBooking_captainId_idx" ON "public"."SpeedboatBooking"("captainId");

-- CreateIndex
CREATE INDEX "SpeedboatCaptainAssignment_captainId_idx" ON "public"."SpeedboatCaptainAssignment"("captainId");

-- CreateIndex
CREATE INDEX "SpeedboatCaptainAssignment_status_idx" ON "public"."SpeedboatCaptainAssignment"("status");

-- CreateIndex
CREATE UNIQUE INDEX "SpeedboatCaptainAssignment_speedboatId_captainId_assignedDa_key" ON "public"."SpeedboatCaptainAssignment"("speedboatId", "captainId", "assignedDate");

-- CreateIndex
CREATE UNIQUE INDEX "TourPackage_slug_key" ON "public"."TourPackage"("slug");

-- CreateIndex
CREATE INDEX "TourPackage_tourType_idx" ON "public"."TourPackage"("tourType");

-- CreateIndex
CREATE INDEX "TourPackage_isPublished_idx" ON "public"."TourPackage"("isPublished");

-- CreateIndex
CREATE INDEX "TourPackage_departureTime_idx" ON "public"."TourPackage"("departureTime");

-- CreateIndex
CREATE INDEX "TourPackage_maxGroupSize_idx" ON "public"."TourPackage"("maxGroupSize");

-- CreateIndex
CREATE INDEX "TourLocation_tourPackageId_idx" ON "public"."TourLocation"("tourPackageId");

-- CreateIndex
CREATE INDEX "TourLocation_type_idx" ON "public"."TourLocation"("type");

-- CreateIndex
CREATE UNIQUE INDEX "TourLocation_tourPackageId_sequenceNumber_key" ON "public"."TourLocation"("tourPackageId", "sequenceNumber");

-- CreateIndex
CREATE INDEX "TourRate_tourPackageId_idx" ON "public"."TourRate"("tourPackageId");

-- CreateIndex
CREATE INDEX "TourRate_minGroupSize_maxGroupSize_idx" ON "public"."TourRate"("minGroupSize", "maxGroupSize");

-- CreateIndex
CREATE INDEX "TourRate_validFrom_idx" ON "public"."TourRate"("validFrom");

-- CreateIndex
CREATE INDEX "TourSchedule_tourPackageId_idx" ON "public"."TourSchedule"("tourPackageId");

-- CreateIndex
CREATE INDEX "TourSchedule_tourDate_idx" ON "public"."TourSchedule"("tourDate");

-- CreateIndex
CREATE INDEX "TourSchedule_isOpen_idx" ON "public"."TourSchedule"("isOpen");

-- CreateIndex
CREATE UNIQUE INDEX "TourSchedule_tourPackageId_tourDate_key" ON "public"."TourSchedule"("tourPackageId", "tourDate");

-- CreateIndex
CREATE UNIQUE INDEX "TourBooking_bookingId_key" ON "public"."TourBooking"("bookingId");

-- CreateIndex
CREATE INDEX "TourBooking_bookingId_idx" ON "public"."TourBooking"("bookingId");

-- CreateIndex
CREATE INDEX "TourBooking_tourPackageId_idx" ON "public"."TourBooking"("tourPackageId");

-- CreateIndex
CREATE INDEX "TourBooking_tourScheduleId_idx" ON "public"."TourBooking"("tourScheduleId");

-- CreateIndex
CREATE INDEX "TourBooking_status_idx" ON "public"."TourBooking"("status");

-- CreateIndex
CREATE INDEX "TourBooking_guideId_idx" ON "public"."TourBooking"("guideId");

-- CreateIndex
CREATE UNIQUE INDEX "SpecialEvent_slug_key" ON "public"."SpecialEvent"("slug");

-- CreateIndex
CREATE INDEX "SpecialEvent_venueType_idx" ON "public"."SpecialEvent"("venueType");

-- CreateIndex
CREATE INDEX "SpecialEvent_startDate_idx" ON "public"."SpecialEvent"("startDate");

-- CreateIndex
CREATE INDEX "SpecialEvent_isPublished_idx" ON "public"."SpecialEvent"("isPublished");

-- CreateIndex
CREATE INDEX "SpecialEvent_recurringPattern_idx" ON "public"."SpecialEvent"("recurringPattern");

-- CreateIndex
CREATE INDEX "EventRate_eventId_idx" ON "public"."EventRate"("eventId");

-- CreateIndex
CREATE INDEX "EventRate_validFrom_validUntil_idx" ON "public"."EventRate"("validFrom", "validUntil");

-- CreateIndex
CREATE UNIQUE INDEX "EventBooking_bookingId_key" ON "public"."EventBooking"("bookingId");

-- CreateIndex
CREATE INDEX "EventBooking_bookingId_idx" ON "public"."EventBooking"("bookingId");

-- CreateIndex
CREATE INDEX "EventBooking_eventId_idx" ON "public"."EventBooking"("eventId");

-- CreateIndex
CREATE INDEX "EventBooking_status_idx" ON "public"."EventBooking"("status");

-- CreateIndex
CREATE INDEX "Booking_serviceType_idx" ON "public"."Booking"("serviceType");

-- CreateIndex
CREATE INDEX "Booking_parentBookingId_idx" ON "public"."Booking"("parentBookingId");

-- CreateIndex
CREATE INDEX "ServiceRate_serviceType_idx" ON "public"."ServiceRate"("serviceType");

-- AddForeignKey
ALTER TABLE "public"."Booking" ADD CONSTRAINT "Booking_parentBookingId_fkey" FOREIGN KEY ("parentBookingId") REFERENCES "public"."Booking"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."SpeedboatRate" ADD CONSTRAINT "SpeedboatRate_speedboatId_fkey" FOREIGN KEY ("speedboatId") REFERENCES "public"."Speedboat"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."SpeedboatBooking" ADD CONSTRAINT "SpeedboatBooking_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "public"."Booking"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."SpeedboatBooking" ADD CONSTRAINT "SpeedboatBooking_speedboatId_fkey" FOREIGN KEY ("speedboatId") REFERENCES "public"."Speedboat"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."SpeedboatBooking" ADD CONSTRAINT "SpeedboatBooking_captainId_fkey" FOREIGN KEY ("captainId") REFERENCES "public"."Driver"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."SpeedboatCaptainAssignment" ADD CONSTRAINT "SpeedboatCaptainAssignment_speedboatId_fkey" FOREIGN KEY ("speedboatId") REFERENCES "public"."Speedboat"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."SpeedboatCaptainAssignment" ADD CONSTRAINT "SpeedboatCaptainAssignment_captainId_fkey" FOREIGN KEY ("captainId") REFERENCES "public"."Driver"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."TourLocation" ADD CONSTRAINT "TourLocation_tourPackageId_fkey" FOREIGN KEY ("tourPackageId") REFERENCES "public"."TourPackage"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."TourRate" ADD CONSTRAINT "TourRate_tourPackageId_fkey" FOREIGN KEY ("tourPackageId") REFERENCES "public"."TourPackage"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."TourSchedule" ADD CONSTRAINT "TourSchedule_tourPackageId_fkey" FOREIGN KEY ("tourPackageId") REFERENCES "public"."TourPackage"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."TourSchedule" ADD CONSTRAINT "TourSchedule_guideId_fkey" FOREIGN KEY ("guideId") REFERENCES "public"."Driver"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."TourBooking" ADD CONSTRAINT "TourBooking_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "public"."Booking"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."TourBooking" ADD CONSTRAINT "TourBooking_tourPackageId_fkey" FOREIGN KEY ("tourPackageId") REFERENCES "public"."TourPackage"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."TourBooking" ADD CONSTRAINT "TourBooking_tourScheduleId_fkey" FOREIGN KEY ("tourScheduleId") REFERENCES "public"."TourSchedule"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."TourBooking" ADD CONSTRAINT "TourBooking_guideId_fkey" FOREIGN KEY ("guideId") REFERENCES "public"."Driver"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."EventRate" ADD CONSTRAINT "EventRate_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "public"."SpecialEvent"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."EventBooking" ADD CONSTRAINT "EventBooking_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "public"."Booking"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."EventBooking" ADD CONSTRAINT "EventBooking_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "public"."SpecialEvent"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
