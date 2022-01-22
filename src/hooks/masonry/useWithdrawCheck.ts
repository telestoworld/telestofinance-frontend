import { useEffect, useState } from 'react';
import useTeloFinance from './../useTeloFinance';
import useRefresh from '../useRefresh';

const useWithdrawCheck = () => {
  const [canWithdraw, setCanWithdraw] = useState(false);
  const teloFinance = useTeloFinance();
  const { slowRefresh } = useRefresh();
  const isUnlocked = teloFinance?.isUnlocked;

  useEffect(() => {
    async function canUserWithdraw() {
      try {
        setCanWithdraw(await teloFinance.canUserUnstakeFromLounge());
      } catch (err) {
        console.error(err);
      }
    }
    if (isUnlocked) {
      canUserWithdraw();
    }
  }, [isUnlocked, teloFinance, slowRefresh]);

  return canWithdraw;
};

export default useWithdrawCheck;
