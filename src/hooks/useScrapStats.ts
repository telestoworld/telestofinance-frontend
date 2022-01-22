import { useEffect, useState } from 'react';
import useTeloFinance from './useTeloFinance';
import { TokenStat } from '../telo-finance/types';
import useRefresh from './useRefresh';

const useScrapStats = () => {
  const [stat, setStat] = useState<TokenStat>();
  const { slowRefresh } = useRefresh();
  const teloFinance = useTeloFinance();

  useEffect(() => {
    async function fetchScrapPrice() {
      try {
        setStat(await teloFinance.getScrapStat());
      }
      catch(err){
        console.error(err);
      }
    }
    fetchScrapPrice();
  }, [setStat, teloFinance, slowRefresh]);

  return stat;
};

export default useScrapStats;
