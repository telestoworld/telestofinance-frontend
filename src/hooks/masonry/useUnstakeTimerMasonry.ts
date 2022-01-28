import { useEffect, useState } from 'react';
import useTeloFinance from '../useTeloFinance';
import { AllocationTime } from '../../telo-finance/types';

const useUnstakeTimerLounge = () => {
  const [time, setTime] = useState<AllocationTime>({
    from: new Date(),
    to: new Date(),
  });
  const teloFinance = useTeloFinance();

  useEffect(() => {
    if (teloFinance) {
      teloFinance.getUserUnstakeTime().then(setTime);
    }
  }, [teloFinance]);
  return time;
};

export default useUnstakeTimerLounge;
