-- Add preferredLanguage and marketingEmails columns to User
ALTER TABLE "User"
ADD COLUMN IF NOT EXISTS "preferredLanguage" TEXT NOT NULL DEFAULT 'en',
ADD COLUMN IF NOT EXISTS "marketingEmails" BOOLEAN NOT NULL DEFAULT false;