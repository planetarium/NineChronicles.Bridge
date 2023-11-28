/*
  Warnings:

  - Added the required column `blockIndex` to the `RequestTransaction` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "RequestTransaction" ADD COLUMN     "blockIndex" BIGINT NOT NULL;

-- CreateTable
CREATE TABLE "Block" (
    "index" BIGINT NOT NULL,
    "networkId" TEXT NOT NULL,

    CONSTRAINT "Block_pkey" PRIMARY KEY ("index","networkId")
);

-- AddForeignKey
ALTER TABLE "Block" ADD CONSTRAINT "Block_networkId_fkey" FOREIGN KEY ("networkId") REFERENCES "Network"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RequestTransaction" ADD CONSTRAINT "RequestTransaction_blockIndex_networkId_fkey" FOREIGN KEY ("blockIndex", "networkId") REFERENCES "Block"("index", "networkId") ON DELETE RESTRICT ON UPDATE CASCADE;
