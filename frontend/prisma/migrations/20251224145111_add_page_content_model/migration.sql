-- CreateTable
CREATE TABLE "public"."PageContent" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title_en" TEXT NOT NULL,
    "title_th" TEXT NOT NULL,
    "description_en" TEXT,
    "description_th" TEXT,
    "content_en" TEXT NOT NULL,
    "content_th" TEXT NOT NULL,
    "contentType" TEXT NOT NULL DEFAULT 'page',
    "status" TEXT NOT NULL DEFAULT 'draft',
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "featuredImage" TEXT,
    "metaKeywords_en" TEXT,
    "metaKeywords_th" TEXT,
    "ogImage" TEXT,
    "category" TEXT NOT NULL DEFAULT 'general',
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "publishedAt" TIMESTAMP(3),
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PageContent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PageContent_slug_key" ON "public"."PageContent"("slug");

-- CreateIndex
CREATE INDEX "PageContent_slug_idx" ON "public"."PageContent"("slug");

-- CreateIndex
CREATE INDEX "PageContent_status_idx" ON "public"."PageContent"("status");

-- CreateIndex
CREATE INDEX "PageContent_contentType_idx" ON "public"."PageContent"("contentType");

-- CreateIndex
CREATE INDEX "PageContent_category_idx" ON "public"."PageContent"("category");

-- CreateIndex
CREATE INDEX "PageContent_featured_idx" ON "public"."PageContent"("featured");
