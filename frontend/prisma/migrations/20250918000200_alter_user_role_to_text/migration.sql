-- Ensure User.role is TEXT with default 'USER'
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'User' AND column_name = 'role'
  ) THEN
    -- Try to alter type to TEXT; if it's already TEXT this will be a no-op or succeed
    BEGIN
      ALTER TABLE "User" ALTER COLUMN "role" TYPE TEXT USING "role"::text;
    EXCEPTION WHEN others THEN
      -- In case of incompatible type (e.g., composite), drop and recreate the column (safe for fresh dev DBs)
      ALTER TABLE "User" DROP COLUMN "role";
      ALTER TABLE "User" ADD COLUMN "role" TEXT DEFAULT 'USER';
    END;
    ALTER TABLE "User" ALTER COLUMN "role" SET DEFAULT 'USER';
  ELSE
    ALTER TABLE "User" ADD COLUMN "role" TEXT DEFAULT 'USER';
  END IF;
END $$;
