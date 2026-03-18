-- AlterTable
ALTER TABLE "invoice_items" ADD COLUMN     "prevision_id" UUID;

-- AlterTable
ALTER TABLE "transactions" ADD COLUMN     "folio" VARCHAR(255);

-- CreateTable
CREATE TABLE "professionals" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "professional_name" VARCHAR(255),
    "specialty" VARCHAR(255),
    "rut" VARCHAR(20),
    "entity_id" UUID,
    "status" BOOLEAN DEFAULT true,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "professionals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "previsions" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" VARCHAR(255) NOT NULL,
    "code" VARCHAR(50) NOT NULL,
    "description" TEXT,
    "status" BOOLEAN DEFAULT true,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "previsions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "idx_professionals_id" ON "professionals"("id");

-- CreateIndex
CREATE INDEX "idx_professionals_entity_id" ON "professionals"("entity_id");

-- CreateIndex
CREATE INDEX "idx_previsions_id" ON "previsions"("id");

-- CreateIndex
CREATE INDEX "idx_previsions_code" ON "previsions"("code");

-- CreateIndex
CREATE INDEX "idx_invoice_items_professional_uuid" ON "invoice_items"("professional_uuid");

-- CreateIndex
CREATE INDEX "idx_invoice_items_prevision_id" ON "invoice_items"("prevision_id");

-- AddForeignKey
ALTER TABLE "invoice_items" ADD CONSTRAINT "fk_invoice_item_professional" FOREIGN KEY ("professional_uuid") REFERENCES "professionals"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "invoice_items" ADD CONSTRAINT "fk_invoice_item_prevision" FOREIGN KEY ("prevision_id") REFERENCES "previsions"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "professionals" ADD CONSTRAINT "fk_professional_entity" FOREIGN KEY ("entity_id") REFERENCES "entity"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;
