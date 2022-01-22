import { useEffect, useState } from 'react';
import { BigNumber } from 'ethers';
import useTeloFinance from './useTeloFinance';

const useTreasuryAmount = () => {
  const [amount, setAmount] = useState(BigNumber.from(0));
  const teloFinance = useTeloFinance();

  useEffect(() => {
    if (teloFinance) {
      const { Treasury } = teloFinance.contracts;
      teloFinance.TELO.balanceOf(Treasury.address).then(setAmount);
    }
  }, [teloFinance]);
  return amount;
};

export default useTreasuryAmount;
