import { Transactions } from '@/generated/prisma/transactions/entities/transactions.entity';
import { transaction_status_enum } from '@prisma/client';

const filteredTransations = (transactions: Transactions[]) => {
  transactions.filter((transaction) => {
    if (transaction.original_transaction_id) {
      return transaction.status !== transaction_status_enum.COMPLETADO;
    }
    return true;
  });
};

export { filteredTransations };
