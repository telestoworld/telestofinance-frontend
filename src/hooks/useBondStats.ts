import { useEffect, useState } from 'react';
import useTombFinance from './useTombFinance';
import { TokenStat } from '../telesto-finance/types';
import useRefresh from './useRefresh';

const useScrapStats = () => {
  const [stat, setStat] = useState<TokenStat>();
  const { slowRefresh } = useRefresh();
  const tombFinance = useTombFinance();

  useEffect(() => {
    async function fetchScrapPrice() {
      try {
        setStat(await tombFinance.getScrapStat());
      }
      catch(err){
        console.error(err);
      }
    }
    fetchScrapPrice();
  }, [setStat, tombFinance, slowRefresh]);

  return stat;
};

export default useScrapStats;
