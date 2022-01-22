import { useCallback, useEffect, useState } from 'react';

import useTeloFinance from './useTeloFinance';
import config from '../config';
import ERC20 from '../telo-finance/ERC20';
import { TeloFinanceProvider } from '../contexts/TeloFinanceProvider/TeloFinanceProvider';


const useStakedTokenPriceInDollars = (stakedTokenName: string, stakedToken: ERC20) => {
  const [stakedTokenPriceInDollars, setStakedTokenPriceInDollars] = useState('0');
  const teloFinance = useTeloFinance();
  const isUnlocked = teloFinance?.isUnlocked;

  const fetchBalance = useCallback(async () => {
    const balance = await TeloFinanceProvider.getDepositTokenPriceInDollars(stakedTokenName, stakedToken);
    setStakedTokenPriceInDollars(balance);
  }, [stakedToken, stakedTokenName, teloFinance]);

  useEffect(() => {
    if (isUnlocked) {
      fetchBalance().catch((err) => console.error(err.stack));

      const refreshStakedTokenPriceInDollars = setInterval(fetchBalance, config.refreshInterval);
      return () => clearInterval(refreshStakedTokenPriceInDollars);
    }
  }, [isUnlocked, setStakedTokenPriceInDollars, teloFinance, fetchBalance]);

  return stakedTokenPriceInDollars;
};

export default useStakedTokenPriceInDollars;
