import { transaction_status_enum, transactions } from '@prisma/client';

const filteredTransations = (transactions: transactions[]) => {
  transactions.filter((transaction) => {
    if (transaction.original_transaction_id) {
      return transaction.status !== transaction_status_enum.COMPLETADO;
    }
    return true;
  });
};

export { filteredTransations };
