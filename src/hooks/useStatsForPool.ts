import { useCallback, useState, useEffect } from 'react';
import useTeloFinance from './useTeloFinance';
import { Bank } from '../telo-finance';
import { PoolStats } from '../telo-finance/types';
import config from '../config';

const useStatsForPool = (bank: Bank) => {
  const teloFinance = useTeloFinance();

  const [poolAPRs, setPoolAPRs] = useState<PoolStats>();

  const fetchAPRsForPool = useCallback(async () => {
    setPoolAPRs(await teloFinance.getPoolAPRs(bank));
  }, [teloFinance, bank]);

  useEffect(() => {
    fetchAPRsForPool().catch((err) => console.error(`Failed to fetch SCRAP price: ${err.stack}`));
    const refreshInterval = setInterval(fetchAPRsForPool, config.refreshInterval);
    return () => clearInterval(refreshInterval);
  }, [setPoolAPRs, teloFinance, fetchAPRsForPool]);

  return poolAPRs;
};

export default useStatsForPool;
