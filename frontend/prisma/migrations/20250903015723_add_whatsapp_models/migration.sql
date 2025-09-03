-- CreateTable
CREATE TABLE "public"."WhatsAppAccount" (
    "id" TEXT NOT NULL,
    "phoneNumber" TEXT NOT NULL,
    "userId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WhatsAppAccount_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."SpreadsheetConnection" (
    "id" TEXT NOT NULL,
    "waAccountId" TEXT NOT NULL,
    "spreadsheetId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SpreadsheetConnection_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "WhatsAppAccount_phoneNumber_key" ON "public"."WhatsAppAccount"("phoneNumber");

-- AddForeignKey
ALTER TABLE "public"."WhatsAppAccount" ADD CONSTRAINT "WhatsAppAccount_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."SpreadsheetConnection" ADD CONSTRAINT "SpreadsheetConnection_waAccountId_fkey" FOREIGN KEY ("waAccountId") REFERENCES "public"."WhatsAppAccount"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."SpreadsheetConnection" ADD CONSTRAINT "SpreadsheetConnection_spreadsheetId_fkey" FOREIGN KEY ("spreadsheetId") REFERENCES "public"."SpreadsheetList"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
