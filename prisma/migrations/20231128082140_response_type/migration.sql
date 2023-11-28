/*
  Warnings:

  - Added the required column `type` to the `ResponseTransaction` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "ResponseTransaction" ADD COLUMN     "type" "ResponseType" NOT NULL;
