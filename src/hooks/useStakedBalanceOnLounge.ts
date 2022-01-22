import { useEffect, useState } from 'react';
import { BigNumber } from 'ethers';
import useTeloFinance from './useTeloFinance';
import useRefresh from './useRefresh';

const useStakedBalanceOnLounge = () => {
  const { slowRefresh } = useRefresh();
  const [balance, setBalance] = useState(BigNumber.from(0));
  const teloFinance = useTeloFinance();
  const isUnlocked = teloFinance?.isUnlocked;
  useEffect(() => {
    async function fetchBalance() {
      try {
        setBalance(await teloFinance.getStakedSharesOnLounge());
      } catch (e) {
        console.error(e);
      }
    }
    if (isUnlocked) {
      fetchBalance();
    }
  }, [slowRefresh, isUnlocked, teloFinance]);
  return balance;
};

export default useStakedBalanceOnLounge;
