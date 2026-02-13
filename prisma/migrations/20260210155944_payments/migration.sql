/*
  Warnings:

  - Added the required column `price` to the `events` table without a default value. This is not possible if the table is not empty.
  - Added the required column `price` to the `tickets` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "events" ADD COLUMN     "price" DOUBLE PRECISION NOT NULL;

-- AlterTable
ALTER TABLE "tickets" ADD COLUMN     "price" DOUBLE PRECISION NOT NULL;
