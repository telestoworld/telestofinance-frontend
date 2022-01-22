import { useEffect, useState } from 'react';
import { BigNumber } from 'ethers';
import useTeloFinance from './useTeloFinance';
import useRefresh from './useRefresh';

const useTotalStakedOnLounge = () => {
  const [totalStaked, setTotalStaked] = useState(BigNumber.from(0));
  const teloFinance = useTeloFinance();
  const { slowRefresh } = useRefresh();
  const isUnlocked = teloFinance?.isUnlocked;

  useEffect(() => {
    async function fetchTotalStaked() {
      try {
        setTotalStaked(await teloFinance.getTotalStakedInLounge());
      } catch(err) {
        console.error(err);
      }
    }
    if (isUnlocked) {
     fetchTotalStaked();
    }
  }, [isUnlocked, slowRefresh, teloFinance]);

  return totalStaked;
};

export default useTotalStakedOnLounge;
