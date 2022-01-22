import { useCallback, useEffect, useState } from 'react';
import { BigNumber } from 'ethers';
import useTeloFinance from './useTeloFinance';
import { ContractName } from '../telo-finance';
import config from '../config';

const useEarnings = (poolName: ContractName, earnTokenName: String, poolId: Number) => {
  const [balance, setBalance] = useState(BigNumber.from(0));
  const teloFinance = useTeloFinance();
  const isUnlocked = teloFinance?.isUnlocked;

  const fetchBalance = useCallback(async () => {
    const balance = await teloFinance.earnedFromBank(poolName, earnTokenName, poolId, teloFinance.myAccount);
    setBalance(balance);
  }, [poolName, earnTokenName, poolId, teloFinance]);

  useEffect(() => {
    if (isUnlocked) {
      fetchBalance().catch((err) => console.error(err.stack));

      const refreshBalance = setInterval(fetchBalance, config.refreshInterval);
      return () => clearInterval(refreshBalance);
    }
  }, [isUnlocked, poolName, teloFinance, fetchBalance]);

  return balance;
};

export default useEarnings;
