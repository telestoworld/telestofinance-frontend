import { useCallback } from 'react';
import useTeloFinance from './useTeloFinance';
import useHandleTransactionReceipt from './useHandleTransactionReceipt';

const useCollectFromLounge = () => {
  const teloFinance = useTeloFinance();
  const handleTransactionReceipt = useHandleTransactionReceipt();

  const handleReward = useCallback(() => {
    handleTransactionReceipt(teloFinance.collectCashFromLounge(), 'Claim TELO from Trident Lounge');
  }, [teloFinance, handleTransactionReceipt]);

  return { onReward: handleReward };
};

export default useCollectFromLounge;
