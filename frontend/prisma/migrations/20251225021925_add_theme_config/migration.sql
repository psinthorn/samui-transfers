-- CreateTable
CREATE TABLE "public"."ThemeConfig" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT false,
    "colors" JSONB NOT NULL,
    "typography" JSONB NOT NULL,
    "spacing" JSONB NOT NULL,
    "borderRadius" JSONB NOT NULL,
    "shadows" JSONB NOT NULL,
    "components" JSONB NOT NULL,
    "description" TEXT,
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ThemeConfig_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ThemeConfig_name_key" ON "public"."ThemeConfig"("name");

-- CreateIndex
CREATE INDEX "ThemeConfig_isActive_idx" ON "public"."ThemeConfig"("isActive");

-- CreateIndex
CREATE INDEX "ThemeConfig_name_idx" ON "public"."ThemeConfig"("name");
