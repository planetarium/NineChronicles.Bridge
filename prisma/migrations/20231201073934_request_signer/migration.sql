/*
  Warnings:

  - Added the required column `sender` to the `RequestTransaction` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "RequestTransaction" ADD COLUMN     "sender" TEXT NOT NULL;
