-- CreateEnum
CREATE TYPE "RequestType" AS ENUM ('UNLOAD_FROM_MY_GARAGES', 'TRANSFER_ASSET');

-- CreateEnum
CREATE TYPE "RequestCategory" AS ENUM ('PROCESS', 'REFUND', 'IGNORE');

-- CreateEnum
CREATE TYPE "ResponseType" AS ENUM ('MINT_ASSETS', 'TRANSFER_ASSET', 'BURN_ASSET');

-- CreateEnum
CREATE TYPE "TxResult" AS ENUM ('INVALID', 'STAGING', 'SUCCESS', 'FAILURE');

-- CreateTable
CREATE TABLE "Network" (
    "id" TEXT NOT NULL,
    "genesisHash" TEXT NOT NULL,

    CONSTRAINT "Network_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RequestTransaction" (
    "id" TEXT NOT NULL,
    "category" "RequestCategory" NOT NULL,
    "type" "RequestType" NOT NULL,
    "networkId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RequestTransaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ResponseTransaction" (
    "id" TEXT NOT NULL,
    "nonce" BIGINT NOT NULL,
    "raw" BYTEA NOT NULL,
    "lastStatus" "TxResult",
    "statusUpdatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "networkId" TEXT NOT NULL,
    "requestTransactionId" TEXT NOT NULL,

    CONSTRAINT "ResponseTransaction_pkey" PRIMARY KEY ("nonce","networkId")
);

-- CreateIndex
CREATE UNIQUE INDEX "ResponseTransaction_id_key" ON "ResponseTransaction"("id");

-- AddForeignKey
ALTER TABLE "RequestTransaction" ADD CONSTRAINT "RequestTransaction_networkId_fkey" FOREIGN KEY ("networkId") REFERENCES "Network"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ResponseTransaction" ADD CONSTRAINT "ResponseTransaction_networkId_fkey" FOREIGN KEY ("networkId") REFERENCES "Network"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ResponseTransaction" ADD CONSTRAINT "ResponseTransaction_requestTransactionId_fkey" FOREIGN KEY ("requestTransactionId") REFERENCES "RequestTransaction"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
