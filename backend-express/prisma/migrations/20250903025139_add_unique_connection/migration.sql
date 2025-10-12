/*
  Warnings:

  - A unique constraint covering the columns `[waAccountId,spreadsheetId]` on the table `SpreadsheetConnection` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "SpreadsheetConnection_waAccountId_spreadsheetId_key" ON "public"."SpreadsheetConnection"("waAccountId", "spreadsheetId");
