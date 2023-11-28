/*
  Warnings:

  - You are about to drop the column `genesisHash` on the `Network` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Network" DROP COLUMN "genesisHash";
