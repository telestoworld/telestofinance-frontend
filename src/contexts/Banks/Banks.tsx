import React, { useCallback, useEffect, useState } from 'react';
import Context from './context';
import useTeloFinance from '../../hooks/useTeloFinance';
import { Bank } from '../../telo-finance';
import config, { bankDefinitions } from '../../config';

const Banks: React.FC = ({ children }) => {
  const [banks, setBanks] = useState<Bank[]>([]);
  const teloFinance = useTeloFinance();
  const isUnlocked = teloFinance?.isUnlocked;

  const fetchPools = useCallback(async () => {
    const banks: Bank[] = [];

    for (const bankInfo of Object.values(bankDefinitions)) {
      if (bankInfo.finished) {
        if (!teloFinance.isUnlocked) continue;

        // only show pools staked by user
        const balance = await teloFinance.stakedBalanceOnBank(
          bankInfo.contract,
          bankInfo.poolId,
          teloFinance.myAccount,
        );
        if (balance.lte(0)) {
          continue;
        }
      }
      banks.push({
        ...bankInfo,
        address: config.deployments[bankInfo.contract].address,
        depositToken: teloFinance.externalTokens[bankInfo.depositTokenName],
        earnToken: bankInfo.earnTokenName === 'TELO' ? teloFinance.TELO : teloFinance.MINERAL,
      });
    }
    banks.sort((a, b) => (a.sort > b.sort ? 1 : -1));
    setBanks(banks);
  }, [teloFinance, setBanks]);

  useEffect(() => {
    if (teloFinance) {
      fetchPools().catch((err) => console.error(`Failed to fetch pools: ${err.stack}`));
    }
  }, [isUnlocked, teloFinance, fetchPools]);

  return <Context.Provider value={{ banks }}>{children}</Context.Provider>;
};

export default Banks;
