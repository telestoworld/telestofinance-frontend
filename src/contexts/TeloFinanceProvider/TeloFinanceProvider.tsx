import React, { createContext, useEffect, useState } from 'react';
import { useWallet } from 'use-wallet';
import TeloFinance from '../../telo-finance';
import config from '../../config';

export interface TeloFinanceContext {
  teloFinance?: TeloFinance;
}

export const Context = createContext<TeloFinanceContext>({ teloFinance: null });

export const TeloFinanceProvider: React.FC = ({ children }) => {
  const { ethereum, account } = useWallet();
  const [teloFinance, setTeloFinance] = useState<TeloFinance>();

  useEffect(() => {
    if (!teloFinance) {
      const telo = new TeloFinance(config);
      if (account) {
        // wallet was unlocked at initialization
        telo.unlockWallet(ethereum, account);
      }
      setTeloFinance(telo);
    } else if (account) {
      teloFinance.unlockWallet(ethereum, account);
    }
  }, [account, ethereum, teloFinance]);

  return <Context.Provider value={{ teloFinance }}>{children}</Context.Provider>;
};
