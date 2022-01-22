import { useCallback } from 'react';
import useTeloFinance from './useTeloFinance';
import useHandleTransactionReceipt from './useHandleTransactionReceipt';

const useRedeemOnLounge = (description?: string) => {
  const teloFinance = useTeloFinance();
  const handleTransactionReceipt = useHandleTransactionReceipt();

  const handleRedeem = useCallback(() => {
    const alertDesc = description || 'Redeem MINERAL from Trident Lounge';
    handleTransactionReceipt(teloFinance.exitFromLounge(), alertDesc);
  }, [teloFinance, description, handleTransactionReceipt]);
  return { onRedeem: handleRedeem };
};

export default useRedeemOnLounge;
