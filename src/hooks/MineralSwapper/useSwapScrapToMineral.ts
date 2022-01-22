import { useCallback } from 'react';
import useTeloFinance from '../useTeloFinance';
import useHandleTransactionReceipt from '../useHandleTransactionReceipt';
// import { BigNumber } from "ethers";
import { parseUnits } from 'ethers/lib/utils';


const useSwapScrapToMineral = () => {
  const teloFinance = useTeloFinance();
  const handleTransactionReceipt = useHandleTransactionReceipt();

  const handleSwapMineral = useCallback(
  	(scrapAmount: string) => {
	  	const scrapAmountBn = parseUnits(scrapAmount, 18);
	  	handleTransactionReceipt(
	  		teloFinance.swapScrapToMineral(scrapAmountBn),
	  		`Swap ${scrapAmount} Scrap to Mineral`
	  	);
  	},
  	[teloFinance, handleTransactionReceipt]
  );
  return { onSwapMineral: handleSwapMineral };
};

export default useSwapScrapToMineral;