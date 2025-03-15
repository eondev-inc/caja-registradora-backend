/*
  Warnings:

  - You are about to drop the column `user_id` on the `users` table. All the data in the column will be lost.
  - You are about to drop the `cash_register` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `cashiers` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[email]` on the table `users` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[nid]` on the table `users` will be added. If there are existing duplicate values, this will fail.
  - Made the column `email` on table `users` required. This step will fail if there are existing NULL values in that column.
  - Made the column `nid` on table `users` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "cashiers" DROP CONSTRAINT "fk_user";

-- DropForeignKey
ALTER TABLE "open_register" DROP CONSTRAINT "fk_cash_register";

-- DropForeignKey
ALTER TABLE "open_register" DROP CONSTRAINT "fk_cashiers";

-- AlterTable
ALTER TABLE "users" DROP COLUMN "user_id",
ALTER COLUMN "email" SET NOT NULL,
ALTER COLUMN "nid" SET NOT NULL;

-- DropTable
DROP TABLE "cash_register";

-- DropTable
DROP TABLE "cashiers";

-- DropEnum
DROP TYPE "cashier_status_enum";

-- CreateTable
CREATE TABLE "entity" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "nid" VARCHAR(50),
    "entity_name" VARCHAR(255),
    "address" VARCHAR(255),
    "contact_phone" VARCHAR(50),
    "contact_email" VARCHAR(255),
    "description" VARCHAR(255),
    "status" BOOLEAN DEFAULT true,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_by" UUID,

    CONSTRAINT "entity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "entity_users" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "entity_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "status" BOOLEAN DEFAULT true,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "entity_users_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "idx_entity_id" ON "entity"("id");

-- CreateIndex
CREATE INDEX "idx_entity_nid" ON "entity"("nid");

-- CreateIndex
CREATE INDEX "idx_entity_name" ON "entity"("entity_name");

-- CreateIndex
CREATE INDEX "idx_entity_users_entity_id" ON "entity_users"("entity_id");

-- CreateIndex
CREATE INDEX "idx_entity_users_user_id" ON "entity_users"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_nid_key" ON "users"("nid");

-- CreateIndex
CREATE INDEX "idx_users_id" ON "users"("id");

-- CreateIndex
CREATE INDEX "idx_users_email" ON "users"("email");

-- CreateIndex
CREATE INDEX "idx_users_nid" ON "users"("nid");

-- AddForeignKey
ALTER TABLE "entity_users" ADD CONSTRAINT "fk_entity" FOREIGN KEY ("entity_id") REFERENCES "entity"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "entity_users" ADD CONSTRAINT "fk_user" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;
