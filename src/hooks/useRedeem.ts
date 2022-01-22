import { useCallback } from 'react';
import useTeloFinance from './useTeloFinance';
import { Bank } from '../telo-finance';
import useHandleTransactionReceipt from './useHandleTransactionReceipt';

const useRedeem = (bank: Bank) => {
  const teloFinance = useTeloFinance();
  const handleTransactionReceipt = useHandleTransactionReceipt();

  const handleRedeem = useCallback(() => {
    handleTransactionReceipt(teloFinance.exit(bank.contract, bank.poolId), `Redeem ${bank.contract}`);
  }, [bank, teloFinance, handleTransactionReceipt]);

  return { onRedeem: handleRedeem };
};

export default useRedeem;
