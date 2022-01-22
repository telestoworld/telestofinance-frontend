import { useEffect, useState } from 'react';
import useTeloFinance from '../useTeloFinance';
import { MineralSwapperStat } from '../../telo-finance/types';
import useRefresh from '../useRefresh';

const useMineralSwapperStats = (account: string) => {
  const [stat, setStat] = useState<MineralSwapperStat>();
  const { fastRefresh/*, slowRefresh*/ } = useRefresh();
  const teloFinance = useTeloFinance();

  useEffect(() => {
    async function fetchMineralSwapperStat() {
      try{
        if(teloFinance.myAccount) {
          setStat(await teloFinance.getMineralSwapperStat(account));
        }
      }
      catch(err){
        console.error(err);
      }
    }
    fetchMineralSwapperStat();
  }, [setStat, teloFinance, fastRefresh, account]);

  return stat;
};

export default useMineralSwapperStats;