/*
  Warnings:

  - You are about to alter the column `latitude` on the `TourLocation` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `Decimal(10,8)`.
  - You are about to alter the column `longitude` on the `TourLocation` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `Decimal(11,8)`.

*/
-- AlterTable
ALTER TABLE "public"."TourLocation" ADD COLUMN     "address" TEXT,
ADD COLUMN     "amenities" TEXT NOT NULL DEFAULT '[]',
ADD COLUMN     "approvedAt" TIMESTAMP(3),
ADD COLUMN     "approvedBy" TEXT,
ADD COLUMN     "bestTimeToVisit" TEXT,
ADD COLUMN     "contentApproved" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "departureTime" TEXT,
ADD COLUMN     "funFacts" TEXT NOT NULL DEFAULT '[]',
ADD COLUMN     "gallery" TEXT NOT NULL DEFAULT '[]',
ADD COLUMN     "highlights" TEXT NOT NULL DEFAULT '[]',
ADD COLUMN     "imageAlt" TEXT,
ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "keywords" TEXT NOT NULL DEFAULT '[]',
ADD COLUMN     "metaDescription" TEXT,
ADD COLUMN     "parkingAvailable" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "seoTags" TEXT NOT NULL DEFAULT '[]',
ADD COLUMN     "shortDescription" TEXT,
ADD COLUMN     "skillLevel" TEXT,
ADD COLUMN     "slug" TEXT,
ADD COLUMN     "tipsFacts" TEXT NOT NULL DEFAULT '[]',
ADD COLUMN     "title" TEXT,
ADD COLUMN     "toiletsAvailable" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "visibility" TEXT NOT NULL DEFAULT 'PUBLIC',
ADD COLUMN     "wheelchairAccessible" BOOLEAN NOT NULL DEFAULT false,
ALTER COLUMN "latitude" SET DATA TYPE DECIMAL(10,8),
ALTER COLUMN "longitude" SET DATA TYPE DECIMAL(11,8);

-- CreateIndex
CREATE INDEX "TourLocation_latitude_longitude_idx" ON "public"."TourLocation"("latitude", "longitude");

-- CreateIndex
CREATE INDEX "TourLocation_isFeatured_idx" ON "public"."TourLocation"("isFeatured");

-- CreateIndex
CREATE INDEX "TourLocation_visibility_idx" ON "public"."TourLocation"("visibility");

-- CreateIndex
CREATE INDEX "TourLocation_contentApproved_idx" ON "public"."TourLocation"("contentApproved");
