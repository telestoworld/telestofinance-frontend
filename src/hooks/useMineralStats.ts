import { useEffect, useState } from 'react';
import useTeloFinance from './useTeloFinance';
import { TokenStat } from '../telo-finance/types';
import useRefresh from './useRefresh';

const useShareStats = () => {
  const [stat, setStat] = useState<TokenStat>();
  const { slowRefresh } = useRefresh();
  const teloFinance = useTeloFinance();

  useEffect(() => {
    async function fetchSharePrice() {
      try {
        setStat(await teloFinance.getMineralStat());
      } catch(err){
        console.error(err)
      }
    }
    fetchSharePrice();
  }, [setStat, teloFinance, slowRefresh]);

  return stat;
};

export default useShareStats;
