-- CreateTable
CREATE TABLE "public"."ChatbotContext" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "locale" TEXT NOT NULL DEFAULT 'en',
    "content" TEXT NOT NULL,
    "title" TEXT,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ChatbotContext_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ChatbotContext_key_idx" ON "public"."ChatbotContext"("key");

-- CreateIndex
CREATE INDEX "ChatbotContext_locale_idx" ON "public"."ChatbotContext"("locale");

-- CreateIndex
CREATE INDEX "ChatbotContext_enabled_idx" ON "public"."ChatbotContext"("enabled");

-- CreateIndex
CREATE UNIQUE INDEX "ChatbotContext_key_locale_key" ON "public"."ChatbotContext"("key", "locale");
