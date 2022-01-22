import { useContext } from 'react';
import { Context } from '../contexts/TeloFinanceProvider';

const useTeloFinance = () => {
  const { teloFinance } = useContext(Context);
  return teloFinance;
};

export default useTeloFinance;
