import { useEffect, useState } from 'react';
import useTeloFinance from './useTeloFinance';
import useRefresh from './useRefresh';

const useFetchLoungeAPR = () => {
  const [apr, setApr] = useState<number>(0);
  const teloFinance = useTeloFinance();
  const { slowRefresh } = useRefresh(); 

  useEffect(() => {
    async function fetchLoungeAPR() {
      try {
        setApr(await teloFinance.getLoungeAPR());
      } catch(err){
        console.error(err);
      }
    }
   fetchLoungeAPR();
  }, [setApr, teloFinance, slowRefresh]);

  return apr;
};

export default useFetchLoungeAPR;
