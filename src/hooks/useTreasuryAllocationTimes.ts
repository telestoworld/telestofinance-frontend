import { useEffect, useState } from 'react';
import useTeloFinance from './useTeloFinance';
import { AllocationTime } from '../telo-finance/types';
import useRefresh from './useRefresh';


const useTreasuryAllocationTimes = () => {
  const { slowRefresh } = useRefresh();
  const [time, setTime] = useState<AllocationTime>({
    from: new Date(),
    to: new Date(),
  });
  const teloFinance = useTeloFinance();
  useEffect(() => {
    if (teloFinance) {
      teloFinance.getTreasuryNextAllocationTime().then(setTime);
    }
  }, [teloFinance, slowRefresh]);
  return time;
};

export default useTreasuryAllocationTimes;
