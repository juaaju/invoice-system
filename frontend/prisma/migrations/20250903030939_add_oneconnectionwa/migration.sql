/*
  Warnings:

  - A unique constraint covering the columns `[waAccountId]` on the table `SpreadsheetConnection` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "public"."SpreadsheetConnection_waAccountId_spreadsheetId_key";

-- CreateIndex
CREATE UNIQUE INDEX "SpreadsheetConnection_waAccountId_key" ON "public"."SpreadsheetConnection"("waAccountId");
