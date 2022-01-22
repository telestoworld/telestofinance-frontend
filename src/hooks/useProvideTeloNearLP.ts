import { useCallback } from 'react';
import useTeloFinance from './useTeloFinance';
import useHandleTransactionReceipt from './useHandleTransactionReceipt';
import { parseUnits } from 'ethers/lib/utils';
import { TAX_OFFICE_ADDR } from '../utils/constants'

const useProvideTeloNearLP = () => {
  const teloFinance = useTeloFinance();
  const handleTransactionReceipt = useHandleTransactionReceipt();

  const handleProvideTeloNearLP = useCallback(
    (nearAmount: string, teloAmount: string) => {
      const teloAmountBn = parseUnits(teloAmount);
      handleTransactionReceipt(
        teloFinance.provideTeloNearLP(nearAmount, teloAmountBn),
        `Provide Telo-NEAR LP ${teloAmount} ${nearAmount} using ${TAX_OFFICE_ADDR}`,
      );
    },
    [teloFinance, handleTransactionReceipt],
  );
  return { onProvideTeloNearLP: handleProvideTeloNearLP };
};

export default useProvideTeloNearLP;
