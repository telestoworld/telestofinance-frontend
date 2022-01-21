import { useCallback } from 'react';
import useTombFinance from '../useTombFinance';
import useHandleTransactionReceipt from '../useHandleTransactionReceipt';
// import { BigNumber } from "ethers";
import { parseUnits } from 'ethers/lib/utils';


const useSwapScrapToMineral = () => {
  const tombFinance = useTombFinance();
  const handleTransactionReceipt = useHandleTransactionReceipt();

  const handleSwapMineral = useCallback(
  	(scrapAmount: string) => {
	  	const scrapAmountBn = parseUnits(scrapAmount, 18);
	  	handleTransactionReceipt(
	  		tombFinance.swapScrapToMineral(scrapAmountBn),
	  		`Swap ${scrapAmount} Scrap to Mineral`
	  	);
  	},
  	[tombFinance, handleTransactionReceipt]
  );
  return { onSwapMineral: handleSwapMineral };
};

export default useSwapScrapToMineral;