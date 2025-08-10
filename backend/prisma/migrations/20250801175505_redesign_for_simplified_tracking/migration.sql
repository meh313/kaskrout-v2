/*
  Warnings:

  - You are about to drop the column `current_stock` on the `consumables` table. All the data in the column will be lost.
  - You are about to drop the column `unit_of_measure` on the `consumables` table. All the data in the column will be lost.
  - You are about to drop the `daily_leftovers` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `expenses` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `purchases` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `sales` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `price` to the `consumables` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "purchases" DROP CONSTRAINT "purchases_consumable_id_fkey";

-- DropForeignKey
ALTER TABLE "sales" DROP CONSTRAINT "sales_product_id_fkey";

-- AlterTable
ALTER TABLE "consumables" DROP COLUMN "current_stock",
DROP COLUMN "unit_of_measure",
ADD COLUMN     "price" DECIMAL(10,2) NOT NULL;

-- DropTable
DROP TABLE "daily_leftovers";

-- DropTable
DROP TABLE "expenses";

-- DropTable
DROP TABLE "purchases";

-- DropTable
DROP TABLE "sales";

-- CreateTable
CREATE TABLE "daily_consumable_usage" (
    "id" SERIAL NOT NULL,
    "record_date" DATE NOT NULL,
    "consumable_id" INTEGER NOT NULL,
    "start_count" INTEGER NOT NULL DEFAULT 0,
    "end_count" INTEGER NOT NULL DEFAULT 0,
    "used_count" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "daily_consumable_usage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "daily_baguettes" (
    "record_date" DATE NOT NULL,
    "start_count" INTEGER NOT NULL DEFAULT 0,
    "end_count" INTEGER NOT NULL DEFAULT 0,
    "used_count" INTEGER NOT NULL DEFAULT 0,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "daily_baguettes_pkey" PRIMARY KEY ("record_date")
);

-- CreateTable
CREATE TABLE "daily_earnings" (
    "record_date" DATE NOT NULL,
    "total_earnings" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "consumables_cost" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "net_profit" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "notes" TEXT,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "daily_earnings_pkey" PRIMARY KEY ("record_date")
);

-- CreateIndex
CREATE UNIQUE INDEX "daily_consumable_usage_record_date_consumable_id_key" ON "daily_consumable_usage"("record_date", "consumable_id");

-- AddForeignKey
ALTER TABLE "daily_consumable_usage" ADD CONSTRAINT "daily_consumable_usage_consumable_id_fkey" FOREIGN KEY ("consumable_id") REFERENCES "consumables"("id") ON DELETE CASCADE ON UPDATE CASCADE;
