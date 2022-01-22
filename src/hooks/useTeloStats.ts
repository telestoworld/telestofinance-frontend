import { useEffect, useState } from 'react';
import useTeloFinance from './useTeloFinance';
import { TokenStat } from '../telo-finance/types';
import useRefresh from './useRefresh';

const useTeloStats = () => {
  const [stat, setStat] = useState<TokenStat>();
  const { fastRefresh } = useRefresh();
  const teloFinance = useTeloFinance();

  useEffect(() => {
    async function fetchTeloPrice(){
      try {
        setStat(await teloFinance.getTeloStat());
      }
      catch(err){
        console.error(err)
      }
    }
    fetchTeloPrice();
  }, [setStat, teloFinance, fastRefresh]);

  return stat;
};

export default useTeloStats;
