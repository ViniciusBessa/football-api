/*
  Warnings:

  - You are about to drop the column `trasnferFee` on the `transfer` table. All the data in the column will be lost.
  - Added the required column `transferFee` to the `transfer` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "transfer" DROP COLUMN "trasnferFee",
ADD COLUMN     "transferFee" DECIMAL(12,2) NOT NULL;
