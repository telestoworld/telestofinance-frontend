import { useEffect, useState } from 'react';
import useTeloFinance from './useTeloFinance';
import { TokenStat } from '../telo-finance/types';
import useRefresh from './useRefresh';

const useCashPriceInEstimatedTWAP = () => {
  const [stat, setStat] = useState<TokenStat>();
  const teloFinance = useTeloFinance();
  const { slowRefresh } = useRefresh(); 

  useEffect(() => {
    async function fetchCashPrice() {
      try {
        setStat(await teloFinance.getTeloStatInEstimatedTWAP());
      }catch(err) {
        console.error(err);
      }
    }
    fetchCashPrice();
  }, [setStat, teloFinance, slowRefresh]);

  return stat;
};

export default useCashPriceInEstimatedTWAP;
