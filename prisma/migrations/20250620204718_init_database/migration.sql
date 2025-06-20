-- CreateEnum
CREATE TYPE "invoice_status_enum" AS ENUM ('EMITIDO', 'ANULADO', 'PAGADO', 'DEVUELTO');

-- CreateEnum
CREATE TYPE "reconciliation_status_enum" AS ENUM ('PENDIENTE', 'CUADRADO', 'NO CUADRADO', 'RECHAZADO');

-- CreateEnum
CREATE TYPE "register_status_enum" AS ENUM ('ABIERTO', 'CERRADO', 'SUSPENDIDO');

-- CreateEnum
CREATE TYPE "transaction_status_enum" AS ENUM ('COMPLETADO', 'PENDIENTE', 'CANCELADO', 'DEVUELTO');

-- CreateEnum
CREATE TYPE "payment_status" AS ENUM ('PAGADO', 'ANULADO');

-- CreateTable
CREATE TABLE "invoice" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "custumer_nid" VARCHAR(50),
    "invoice_number" VARCHAR(50),
    "total_amount" INTEGER,
    "tax_amount" INTEGER,
    "notes" TEXT,
    "status" "invoice_status_enum" NOT NULL DEFAULT 'EMITIDO',
    "payment_status" "payment_status" NOT NULL DEFAULT 'PAGADO',
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "invoice_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "invoice_items" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "invoice_id" UUID NOT NULL,
    "description" VARCHAR(255),
    "item_code" VARCHAR(50),
    "professional_uuid" UUID,
    "quantity" INTEGER,
    "total_price" INTEGER,
    "discount_amount" INTEGER,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "invoice_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "open_register" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "shift_init" TIMESTAMP(6),
    "shift_end" TIMESTAMP(6),
    "initial_cash" INTEGER,
    "status" "register_status_enum" NOT NULL DEFAULT 'ABIERTO',
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "created_by" UUID,

    CONSTRAINT "open_register_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payment_method" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "method_name" VARCHAR(255),
    "description" TEXT,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "status" BOOLEAN DEFAULT true,

    CONSTRAINT "payment_method_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reconciliation" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "open_register_id" UUID NOT NULL,
    "opening_balance" INTEGER,
    "closing_balance" INTEGER,
    "expected_balance" INTEGER,
    "sales_summary" JSONB NOT NULL,
    "total_sales" INTEGER,
    "cash_deposits" INTEGER,
    "cash_withdrawals" INTEGER,
    "discrepancy" INTEGER,
    "notes" TEXT,
    "status" "reconciliation_status_enum" NOT NULL DEFAULT 'PENDIENTE',
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "approved_by" UUID,

    CONSTRAINT "reconciliation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "permmisions" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" VARCHAR(255),
    "description" VARCHAR(255),
    "status" BOOLEAN DEFAULT true,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "permmisions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "role_permissions" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "role_id" UUID NOT NULL,
    "permission_id" UUID NOT NULL,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "status" BOOLEAN DEFAULT true,

    CONSTRAINT "role_permissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "roles" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "role_name" VARCHAR(255),
    "description" VARCHAR(255),
    "status" BOOLEAN DEFAULT true,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "roles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_roles" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "role_id" UUID NOT NULL,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "status" BOOLEAN DEFAULT true,

    CONSTRAINT "user_roles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "transaction_type" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "transaction_name" VARCHAR(255),
    "description" TEXT,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "status" BOOLEAN DEFAULT true,

    CONSTRAINT "transaction_type_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "transactions" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "open_register_id" UUID NOT NULL,
    "invoice_id" UUID NOT NULL,
    "transaction_type_id" UUID NOT NULL,
    "payment_method_id" UUID NOT NULL,
    "original_transaction_id" UUID,
    "amount" INTEGER NOT NULL,
    "description" TEXT,
    "reference_number" VARCHAR(255),
    "status" "transaction_status_enum" NOT NULL DEFAULT 'COMPLETADO',
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "transactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "email" VARCHAR(255) NOT NULL,
    "password" VARCHAR(255),
    "forenames" VARCHAR(255),
    "surnames" VARCHAR(255),
    "nid" VARCHAR(100) NOT NULL,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "status" BOOLEAN DEFAULT true,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users_tokens" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "token" VARCHAR(255),
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "is_revoked" BOOLEAN DEFAULT false,
    "updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "users_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "entity" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
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
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "entity_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "status" BOOLEAN DEFAULT true,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "entity_users_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "idx_invoice_items_invoice_id" ON "invoice_items"("invoice_id");

-- CreateIndex
CREATE INDEX "idx_open_register_cash_register_id" ON "open_register"("created_by");

-- CreateIndex
CREATE INDEX "idx_reconciliation_open_register_id" ON "reconciliation"("open_register_id");

-- CreateIndex
CREATE INDEX "idx_permmisions_id" ON "permmisions"("id");

-- CreateIndex
CREATE INDEX "idx_permmisions_perm_name" ON "permmisions"("name");

-- CreateIndex
CREATE INDEX "idx_role_permissions_role_id" ON "role_permissions"("role_id");

-- CreateIndex
CREATE INDEX "idx_role_permissions_permission_id" ON "role_permissions"("permission_id");

-- CreateIndex
CREATE INDEX "idx_roles_id" ON "roles"("id");

-- CreateIndex
CREATE INDEX "idx_roles_role_name" ON "roles"("role_name");

-- CreateIndex
CREATE INDEX "idx_user_roles_user_id" ON "user_roles"("user_id");

-- CreateIndex
CREATE INDEX "idx_user_roles_role_id" ON "user_roles"("role_id");

-- CreateIndex
CREATE INDEX "idx_transactions_invoice_id" ON "transactions"("invoice_id");

-- CreateIndex
CREATE INDEX "idx_transactions_open_register_id" ON "transactions"("open_register_id");

-- CreateIndex
CREATE INDEX "idx_transactions_payment_method_id" ON "transactions"("payment_method_id");

-- CreateIndex
CREATE INDEX "idx_transactions_transaction_type_id" ON "transactions"("transaction_type_id");

-- CreateIndex
CREATE UNIQUE INDEX "users_id_key" ON "users"("id");

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

-- CreateIndex
CREATE INDEX "idx_users_tokens_user_id" ON "users_tokens"("user_id");

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

-- AddForeignKey
ALTER TABLE "invoice_items" ADD CONSTRAINT "fk_invoice" FOREIGN KEY ("invoice_id") REFERENCES "invoice"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "open_register" ADD CONSTRAINT "fk_created_by" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "reconciliation" ADD CONSTRAINT "fk_open_register" FOREIGN KEY ("open_register_id") REFERENCES "open_register"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "role_permissions" ADD CONSTRAINT "fk_role" FOREIGN KEY ("role_id") REFERENCES "roles"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "role_permissions" ADD CONSTRAINT "fk_permission" FOREIGN KEY ("permission_id") REFERENCES "permmisions"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "user_roles" ADD CONSTRAINT "fk_user" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "user_roles" ADD CONSTRAINT "fk_role" FOREIGN KEY ("role_id") REFERENCES "roles"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "fk_invoice" FOREIGN KEY ("invoice_id") REFERENCES "invoice"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "fk_open_register" FOREIGN KEY ("open_register_id") REFERENCES "open_register"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "fk_payment_method" FOREIGN KEY ("payment_method_id") REFERENCES "payment_method"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "fk_transaction_type" FOREIGN KEY ("transaction_type_id") REFERENCES "transaction_type"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "users_tokens" ADD CONSTRAINT "fk_user" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "entity_users" ADD CONSTRAINT "fk_entity" FOREIGN KEY ("entity_id") REFERENCES "entity"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "entity_users" ADD CONSTRAINT "fk_user" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;
