import { useCallback, useEffect, useState } from 'react';
import useTeloFinance from './useTeloFinance';
import config from '../config';
import { BigNumber } from 'ethers';

const useCashPriceInLastTWAP = () => {
  const [price, setPrice] = useState<BigNumber>(BigNumber.from(0));
  const teloFinance = useTeloFinance();

  const fetchCashPrice = useCallback(async () => {
    setPrice(await teloFinance.getTeloPriceInLastTWAP());
  }, [teloFinance]);

  useEffect(() => {
    fetchCashPrice().catch((err) => console.error(`Failed to fetch TELO price: ${err.stack}`));
    const refreshInterval = setInterval(fetchCashPrice, config.refreshInterval);
    return () => clearInterval(refreshInterval);
  }, [setPrice, teloFinance, fetchCashPrice]);

  return price;
};

export default useCashPriceInLastTWAP;
