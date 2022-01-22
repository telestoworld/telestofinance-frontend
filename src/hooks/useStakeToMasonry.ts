import { useCallback } from 'react';
import useTeloFinance from './useTeloFinance';
import useHandleTransactionReceipt from './useHandleTransactionReceipt';

const useStakeToLounge = () => {
  const teloFinance = useTeloFinance();
  const handleTransactionReceipt = useHandleTransactionReceipt();

  const handleStake = useCallback(
    (amount: string) => {
      handleTransactionReceipt(teloFinance.stakeShareToLounge(amount), `Stake ${amount} MINERAL to the lounge`);
    },
    [teloFinance, handleTransactionReceipt],
  );
  return { onStake: handleStake };
};

export default useStakeToLounge;
