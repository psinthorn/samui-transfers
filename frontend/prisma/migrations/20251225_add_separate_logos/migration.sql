-- Add separate header and footer logo fields to ThemeConfig
ALTER TABLE "ThemeConfig" ADD COLUMN "headerLogoUrl" TEXT,
ADD COLUMN "footerLogoUrl" TEXT;

-- Migrate existing logoUrl to headerLogoUrl if logoUrl exists
UPDATE "ThemeConfig" SET "headerLogoUrl" = "logoUrl" WHERE "logoUrl" IS NOT NULL;
