import { useEffect, useState } from 'react';
import useTeloFinance from '../useTeloFinance';
import { AllocationTime } from '../../telo-finance/types';

const useClaimRewardTimerLounge = () => {
  const [time, setTime] = useState<AllocationTime>({
    from: new Date(),
    to: new Date(),
  });
  const teloFinance = useTeloFinance();

  useEffect(() => {
    if (teloFinance) {
      teloFinance.getUserClaimRewardTime().then(setTime);
    }
  }, [teloFinance]);
  return time;
};

export default useClaimRewardTimerLounge;
