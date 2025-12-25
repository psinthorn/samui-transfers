-- CreateTable
CREATE TABLE "public"."PaymentGatewayCredential" (
    "id" TEXT NOT NULL,
    "gatewayId" TEXT NOT NULL,
    "stripePublicKey" TEXT,
    "stripeSecretKey" TEXT,
    "stripeAccountId" TEXT,
    "paypalClientId" TEXT,
    "paypalSecret" TEXT,
    "paypalAccountId" TEXT,
    "paypalMode" TEXT,
    "bankAccountName" TEXT,
    "bankAccountNumber" TEXT,
    "bankRoutingNumber" TEXT,
    "bankIban" TEXT,
    "bankBankName" TEXT,
    "isConfigured" BOOLEAN NOT NULL DEFAULT false,
    "lastVerified" TIMESTAMP(3),
    "verificationStatus" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PaymentGatewayCredential_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."PaymentGatewayAuditLog" (
    "id" TEXT NOT NULL,
    "gatewayId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "changedFields" TEXT[],
    "adminId" TEXT,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PaymentGatewayAuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PaymentGatewayCredential_gatewayId_key" ON "public"."PaymentGatewayCredential"("gatewayId");

-- CreateIndex
CREATE INDEX "PaymentGatewayCredential_gatewayId_idx" ON "public"."PaymentGatewayCredential"("gatewayId");

-- CreateIndex
CREATE INDEX "PaymentGatewayCredential_isConfigured_idx" ON "public"."PaymentGatewayCredential"("isConfigured");

-- CreateIndex
CREATE INDEX "PaymentGatewayAuditLog_gatewayId_createdAt_idx" ON "public"."PaymentGatewayAuditLog"("gatewayId", "createdAt");

-- CreateIndex
CREATE INDEX "PaymentGatewayAuditLog_adminId_createdAt_idx" ON "public"."PaymentGatewayAuditLog"("adminId", "createdAt");

-- CreateIndex
CREATE INDEX "PaymentGatewayAuditLog_action_idx" ON "public"."PaymentGatewayAuditLog"("action");

-- AddForeignKey
ALTER TABLE "public"."PaymentGatewayCredential" ADD CONSTRAINT "PaymentGatewayCredential_gatewayId_fkey" FOREIGN KEY ("gatewayId") REFERENCES "public"."PaymentGateway"("id") ON DELETE CASCADE ON UPDATE CASCADE;
