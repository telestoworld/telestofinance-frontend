import { useEffect, useState } from 'react';
import useTeloFinance from './useTeloFinance';
import useRefresh from './useRefresh';

const useTotalValueLocked = () => {
  const [totalValueLocked, setTotalValueLocked] = useState<Number>(0);
  const { slowRefresh } = useRefresh();
  const teloFinance = useTeloFinance();

  useEffect(() => {
    async function fetchTVL() {
      try {
        setTotalValueLocked(await teloFinance.getTotalValueLocked());
      }
      catch(err){
        console.error(err);
      }
    }
    fetchTVL();
  }, [setTotalValueLocked, teloFinance, slowRefresh]);

  return totalValueLocked;
};

export default useTotalValueLocked;
