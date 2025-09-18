-- Align the User table with Prisma schema: add missing columns if they don't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'User' AND column_name = 'password'
  ) THEN
    ALTER TABLE "User" ADD COLUMN "password" TEXT;
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'User' AND column_name = 'name'
  ) THEN
    ALTER TABLE "User" ADD COLUMN "name" TEXT;
  END IF;
END $$;
