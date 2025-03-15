/*
  Warnings:

  - You are about to drop the column `cash_register_id` on the `open_register` table. All the data in the column will be lost.
  - You are about to drop the column `cashiers_id` on the `open_register` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "idx_open_register_cash_register_id";

-- DropIndex
DROP INDEX "idx_open_register_cashiers_id";

-- DropIndex
DROP INDEX "idx_open_register_created_by";

-- AlterTable
ALTER TABLE "open_register" DROP COLUMN "cash_register_id",
DROP COLUMN "cashiers_id",
ADD COLUMN     "cash_entity_id" UUID;

-- CreateIndex
CREATE INDEX "idx_open_register_cash_register_id" ON "open_register"("cash_entity_id", "created_by");

-- AddForeignKey
ALTER TABLE "open_register" ADD CONSTRAINT "fk_cash_register" FOREIGN KEY ("cash_entity_id") REFERENCES "entity"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;
