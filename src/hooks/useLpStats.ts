import { useEffect, useState } from 'react';
import useTeloFinance from './useTeloFinance';
import { LPStat } from '../telo-finance/types';
import useRefresh from './useRefresh';

const useLpStats = (lpTicker: string) => {
  const [stat, setStat] = useState<LPStat>();
  const { slowRefresh } = useRefresh();
  const teloFinance = useTeloFinance();

  useEffect(() => {
    async function fetchLpPrice() {
      try{
        setStat(await teloFinance.getLPStat(lpTicker));
      }
      catch(err){
        console.error(err);
      }
    }
    fetchLpPrice();
  }, [setStat, teloFinance, slowRefresh, lpTicker]);

  return stat;
};

export default useLpStats;
