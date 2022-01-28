import { useEffect, useState } from 'react';
import useRefresh from '../useRefresh';
import useTeloFinance from '../useTeloFinance';

const useClaimRewardCheck = () => {
  const  { slowRefresh } = useRefresh();
  const [canClaimReward, setCanClaimReward] = useState(false);
  const teloFinance = useTeloFinance();
  const isUnlocked = teloFinance?.isUnlocked;

  useEffect(() => {
    async function canUserClaimReward() {
      try {
        setCanClaimReward(await teloFinance.canUserClaimRewardFromLounge());
      } catch(err){
        console.error(err);
      };
    }
    if (isUnlocked) {
      canUserClaimReward();
    }
  }, [isUnlocked, slowRefresh, teloFinance]);

  return canClaimReward;
};

export default useClaimRewardCheck;
