import React, { createContext, useEffect, useState } from 'react';
import { useWallet } from 'use-wallet';
import TelestoFinance from '../../telesto-finance';
import config from '../../config';

export interface TelestoFinanceContext {
  telestoFinance?: TelestoFinance;
}

export const Context = createContext<TelestoFinanceContext>({ telestoFinance: null });

export const TelestoFinanceProvider: React.FC = ({ children }) => {
  const { ethereum, account } = useWallet();
  const [telestoFinance, setTelestoFinance] = useState<TelestoFinance>();

  useEffect(() => {
    if (!telestoFinance) {
      const telesto = new TelestoFinance(config);
      if (account) {
        // wallet was unlocked at initialization
        telesto.unlockWallet(ethereum, account);
      }
      setTelestoFinance(telesto);
    } else if (account) {
      telestoFinance.unlockWallet(ethereum, account);
    }
  }, [account, ethereum, telestoFinance]);

  return <Context.Provider value={{ telestoFinance }}>{children}</Context.Provider>;
};
