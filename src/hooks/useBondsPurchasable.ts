import { useCallback, useEffect, useState } from 'react';
import { BigNumber } from 'ethers';
import ERC20 from '../telo-finance/ERC20';
import useTeloFinance from './useTeloFinance';
import config from '../config';

const useScrapPurchasable = () => {
  const [balance, setBalance] = useState(BigNumber.from(0));
  const teloFinance = useTeloFinance();

  useEffect(() => {
    async function fetchScrapPurchasable() {
        try {
            setBalance(await teloFinance.getScrapPurchasable());
        }
        catch(err) {
            console.error(err);
        }
      }
    fetchScrapPurchasable();
  }, [setBalance, teloFinance]);

  return balance;
};

export default useScrapPurchasable;
