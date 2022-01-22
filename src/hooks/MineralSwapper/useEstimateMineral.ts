import { useCallback, useEffect, useState } from 'react';
import useTeloFinance from '../useTeloFinance';
import { useWallet } from 'use-wallet';
import { BigNumber } from 'ethers';
import { parseUnits } from 'ethers/lib/utils';

const useEstimateMineral = (scrapAmount: string) => {
  const [estimateAmount, setEstimateAmount] = useState<string>('');
  const { account } = useWallet();
  const teloFinance = useTeloFinance();

  const estimateAmountOfMineral = useCallback(async () => {
    const scrapAmountBn = parseUnits(scrapAmount);
    const amount = await teloFinance.estimateAmountOfMineral(scrapAmountBn.toString());
    setEstimateAmount(amount);
  }, [account]);

  useEffect(() => {
    if (account) {
      estimateAmountOfMineral().catch((err) => console.error(`Failed to get estimateAmountOfTShare: ${err.stack}`));
    }
  }, [account, estimateAmountOfMineral]);

  return estimateAmount;
};

export default useEstimateMineral;