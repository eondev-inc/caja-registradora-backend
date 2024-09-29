CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
-- CreateEnum
CREATE TYPE "cashier_status_enum" AS ENUM ('ACTIVO', 'INACTIVO', 'SUSPENDIDO');

-- CreateEnum
CREATE TYPE "invoice_status_enum" AS ENUM ('EMITIDO', 'ANULADO', 'PAGADO', 'DEVUELTO');

-- CreateEnum
CREATE TYPE "reconciliation_status_enum" AS ENUM ('PENDIENTE', 'CUADRADO', 'NO CUADRADO', 'RECHAZADO');

-- CreateEnum
CREATE TYPE "register_status_enum" AS ENUM ('ABIERTO', 'CERRADO', 'SUSPENDIDO');

-- CreateEnum
CREATE TYPE "transaction_status_enum" AS ENUM ('COMPLETADO', 'PENDIENTE', 'CANCELADO');

-- CreateTable
CREATE TABLE "cash_register" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "branch_code" VARCHAR(50),
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "status" BOOLEAN DEFAULT true,

    CONSTRAINT "cash_register_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cashiers" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "user_id" UUID,
    "status" BOOLEAN DEFAULT true,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "cashiers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "invoice" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "custumer_nid" VARCHAR(50),
    "invoice_number" VARCHAR(50),
    "total_amount" DECIMAL(10,2),
    "tax_amount" DECIMAL(10,2),
    "notes" TEXT,
    "status" "invoice_status_enum" NOT NULL DEFAULT 'EMITIDO',
    "payment_status_id" UUID,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "invoice_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payment_status" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "status_name" VARCHAR(255),
    "description" TEXT,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "status" BOOLEAN DEFAULT true,

    CONSTRAINT "payment_status_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "invoice_items" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "invoice_id" UUID NOT NULL,
    "description" TEXT,
    "specialty_code" VARCHAR(50),
    "professional_uuid" UUID,
    "quantity" INTEGER,
    "total_price" DECIMAL(10,2),
    "discount_amount" DECIMAL(10,2),
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "prevision_id" UUID,

    CONSTRAINT "invoice_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "open_register" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "shift_init" TIMESTAMP(6),
    "shift_end" TIMESTAMP(6),
    "initial_cash" DECIMAL(10,2),
    "status" "register_status_enum" NOT NULL DEFAULT 'ABIERTO',
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "created_by" UUID,  
    "cash_register_id" UUID,
    "cashiers_id" UUID,

    CONSTRAINT "open_register_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payment_method" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "method_name" VARCHAR(255),
    "description" TEXT,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "status" BOOLEAN DEFAULT true,

    CONSTRAINT "payment_method_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "previsions" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "code" VARCHAR(50),
    "name" VARCHAR(255),
    "status" BOOLEAN DEFAULT true,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "previsions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reconciliation" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "open_register_id" UUID NOT NULL,
    "opening_balance" DECIMAL(10,2),
    "closing_balance" DECIMAL(10,2),
    "expected_balance" DECIMAL(10,2),
    "sales_summary" JSONB NOT NULL,
    "total_sales" DECIMAL(10,2),
    "cash_deposits" DECIMAL(10,2),
    "cash_withdrawals" DECIMAL(10,2),
    "discrepancy" DECIMAL(10,2),
    "notes" TEXT,
    "status" "reconciliation_status_enum" NOT NULL DEFAULT 'PENDIENTE',
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "approved_by" UUID,

    CONSTRAINT "reconciliation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "roles" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "role_name" VARCHAR(255),
    "description" TEXT,
    "status" BOOLEAN DEFAULT true,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "roles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "transaction_type" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "transaction_name" VARCHAR(255),
    "description" TEXT,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "status" BOOLEAN DEFAULT true,

    CONSTRAINT "transaction_type_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "transactions" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "open_register_id" UUID NOT NULL,
    "invoice_id" UUID NOT NULL,
    "transaction_type_id" UUID NOT NULL,
    "payment_method_id" UUID NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "description" TEXT,
    "reference_number" VARCHAR(255),
    "status" "transaction_status_enum" NOT NULL DEFAULT 'COMPLETADO',
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "transactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "user_id" UUID NOT NULL,
    "email" VARCHAR(255),
    "password" VARCHAR(255),
    "forenames" VARCHAR(255),
    "surnames" VARCHAR(255),
    "nid_type" VARCHAR(50),
    "nid" VARCHAR(100),
    "role_id" UUID,
    "branch_code" VARCHAR(50),
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "status" BOOLEAN DEFAULT true,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users_tokens" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "user_id" UUID NOT NULL,
    "token" VARCHAR(255),
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "is_revoked" BOOLEAN DEFAULT false,
    "updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "users_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "idx_cashiers_user_id" ON "cashiers"("user_id");

-- CreateIndex
CREATE INDEX "idx_invoice_items_invoice_id" ON "invoice_items"("invoice_id");

-- CreateIndex
CREATE INDEX "idx_invoice_items_prevision_id" ON "invoice_items"("prevision_id");

-- CreateIndex
CREATE INDEX "idx_open_register_cash_register_id" ON "open_register"("cash_register_id");

-- CreateIndex
CREATE INDEX "idx_open_register_cashiers_id" ON "open_register"("cashiers_id");

-- CreateIndex
CREATE INDEX "idx_open_register_created_by" ON "open_register"("created_by");

-- CreateIndex
CREATE INDEX "idx_reconciliation_open_register_id" ON "reconciliation"("open_register_id");

-- CreateIndex
CREATE INDEX "idx_transactions_invoice_id" ON "transactions"("invoice_id");

-- CreateIndex
CREATE INDEX "idx_transactions_open_register_id" ON "transactions"("open_register_id");

-- CreateIndex
CREATE INDEX "idx_transactions_payment_method_id" ON "transactions"("payment_method_id");

-- CreateIndex
CREATE INDEX "idx_transactions_transaction_type_id" ON "transactions"("transaction_type_id");

-- CreateIndex
CREATE INDEX "idx_users_role_id" ON "users"("role_id");

-- CreateIndex
CREATE INDEX "idx_users_tokens_user_id" ON "users_tokens"("user_id");

-- CreateIndex
CREATE INDEX "idx_payment_status_id" ON "payment_status"("id");

-- AddForeignKey
ALTER TABLE "cashiers" ADD CONSTRAINT "fk_user" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "invoice_items" ADD CONSTRAINT "fk_invoice" FOREIGN KEY ("invoice_id") REFERENCES "invoice"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "invoice_items" ADD CONSTRAINT "fk_prevision" FOREIGN KEY ("prevision_id") REFERENCES "previsions"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "open_register" ADD CONSTRAINT "fk_cash_register" FOREIGN KEY ("cash_register_id") REFERENCES "cash_register"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "open_register" ADD CONSTRAINT "fk_cashiers" FOREIGN KEY ("cashiers_id") REFERENCES "cashiers"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "open_register" ADD CONSTRAINT "fk_created_by" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "reconciliation" ADD CONSTRAINT "fk_open_register" FOREIGN KEY ("open_register_id") REFERENCES "open_register"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "fk_invoice" FOREIGN KEY ("invoice_id") REFERENCES "invoice"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "fk_open_register" FOREIGN KEY ("open_register_id") REFERENCES "open_register"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "fk_payment_method" FOREIGN KEY ("payment_method_id") REFERENCES "payment_method"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "fk_transaction_type" FOREIGN KEY ("transaction_type_id") REFERENCES "transaction_type"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "fk_role" FOREIGN KEY ("role_id") REFERENCES "roles"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "users_tokens" ADD CONSTRAINT "fk_user" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;
