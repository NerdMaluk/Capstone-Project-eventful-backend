/*
  Warnings:

  - The values [PAID] on the enum `TicketStatus` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `checkedIn` on the `tickets` table. All the data in the column will be lost.
  - You are about to drop the column `paymentId` on the `tickets` table. All the data in the column will be lost.
  - You are about to drop the column `price` on the `tickets` table. All the data in the column will be lost.
  - You are about to drop the `payments` table. If the table is not empty, all the data it contains will be lost.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "TicketStatus_new" AS ENUM ('PENDING', 'ACTIVE', 'USED', 'CANCELLED');
ALTER TABLE "public"."tickets" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "tickets" ALTER COLUMN "status" TYPE "TicketStatus_new" USING ("status"::text::"TicketStatus_new");
ALTER TYPE "TicketStatus" RENAME TO "TicketStatus_old";
ALTER TYPE "TicketStatus_new" RENAME TO "TicketStatus";
DROP TYPE "public"."TicketStatus_old";
ALTER TABLE "tickets" ALTER COLUMN "status" SET DEFAULT 'ACTIVE';
COMMIT;

-- DropForeignKey
ALTER TABLE "payments" DROP CONSTRAINT "payments_eventId_fkey";

-- DropForeignKey
ALTER TABLE "payments" DROP CONSTRAINT "payments_userId_fkey";

-- DropForeignKey
ALTER TABLE "tickets" DROP CONSTRAINT "tickets_paymentId_fkey";

-- DropIndex
DROP INDEX "tickets_eventId_attendeeId_key";

-- DropIndex
DROP INDEX "tickets_paymentId_key";

-- AlterTable
ALTER TABLE "tickets" DROP COLUMN "checkedIn",
DROP COLUMN "paymentId",
DROP COLUMN "price";

-- DropTable
DROP TABLE "payments";

-- DropEnum
DROP TYPE "PaymentStatus";
