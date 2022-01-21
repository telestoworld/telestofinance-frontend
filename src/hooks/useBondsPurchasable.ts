import { useCallback, useEffect, useState } from 'react';
import { BigNumber } from 'ethers';
import ERC20 from '../telesto-finance/ERC20';
import useTombFinance from './useTombFinance';
import config from '../config';

const useScrapPurchasable = () => {
  const [balance, setBalance] = useState(BigNumber.from(0));
  const tombFinance = useTombFinance();

  useEffect(() => {
    async function fetchScrapPurchasable() {
        try {
            setBalance(await tombFinance.getScrapPurchasable());
        }
        catch(err) {
            console.error(err);
        }
      }
    fetchScrapPurchasable();
  }, [setBalance, tombFinance]);

  return balance;
};

export default useScrapPurchasable;
