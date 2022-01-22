import { useCallback } from 'react';
import useTeloFinance from './useTeloFinance';
import useHandleTransactionReceipt from './useHandleTransactionReceipt';
import { Bank } from '../telo-finance';

const useCollect = (bank: Bank) => {
  const teloFinance = useTeloFinance();
  const handleTransactionReceipt = useHandleTransactionReceipt();

  const handleReward = useCallback(() => {
    handleTransactionReceipt(
      teloFinance.collect(bank.contract, bank.poolId),
      `Claim ${bank.earnTokenName} from ${bank.contract}`,
    );
  }, [bank, teloFinance, handleTransactionReceipt]);

  return { onReward: handleReward };
};

export default useCollect;
