import { useCallback, useEffect, useState } from 'react';
import useTeloFinance from './useTeloFinance';
import useStakedBalanceOnLounge from './useStakedBalanceOnLounge';

const useMasonryVersion = () => {
  const [loungeVersion, setLoungeVersion] = useState('latest');
  const teloFinance = useTeloFinance();
  const stakedBalance = useStakedBalanceOnLounge();

  const updateState = useCallback(async () => {
    setLoungeVersion(await teloFinance.fetchLoungeVersionOfUser());
  }, [teloFinance?.isUnlocked, stakedBalance]);

  useEffect(() => {
    if (teloFinance?.isUnlocked) {
      updateState().catch((err) => console.error(err.stack));
    }
  }, [teloFinance?.isUnlocked, stakedBalance]);

  return loungeVersion;
};

export default useMasonryVersion;
