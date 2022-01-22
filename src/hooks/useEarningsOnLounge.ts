import { useEffect, useState } from 'react';
import { BigNumber } from 'ethers';
import useTeloFinance from './useTeloFinance';
import useRefresh from './useRefresh';

const useEarningsOnLounge = () => {
  const { slowRefresh } = useRefresh();
  const [balance, setBalance] = useState(BigNumber.from(0));
  const teloFinance = useTeloFinance();
  const isUnlocked = teloFinance?.isUnlocked;

  useEffect(() => {
    async function fetchBalance() {
      try {
        setBalance(await teloFinance.getEarningsOnLounge());
      } catch (e) {
        console.error(e);
      }
    }
    if (isUnlocked) {
      fetchBalance();
    }
  }, [isUnlocked, teloFinance, slowRefresh]);

  return balance;
};

export default useEarningsOnLounge;
