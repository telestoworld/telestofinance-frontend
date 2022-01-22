import React, { useCallback, useMemo } from 'react';
import Page from '../../components/Page';
import ScrapsImage from '../../assets/img/bonds.png';
import { createGlobalStyle } from 'styled-components';
import { Route, Switch, useRouteMatch } from 'react-router-dom';
import { useWallet } from 'use-wallet';
import UnlockWallet from '../../components/UnlockWallet';
import PageHeader from '../../components/PageHeader';
import ExchangeCard from './components/ExchangeCard';
import styled from 'styled-components';
import Spacer from '../../components/Spacer';
import useScrapStats from '../../hooks/useScrapStats';
import useTeloFinance from '../../hooks/useTeloFinance';
import useCashPriceInLastTWAP from '../../hooks/useCashPriceInLastTWAP';
import { useTransactionAdder } from '../../state/transactions/hooks';
import ExchangeStat from './components/ExchangeStat';
import useTokenBalance from '../../hooks/useTokenBalance';
import useScrapsPurchasable from '../../hooks/useScrapsPurchasable';
import { getDisplayBalance } from '../../utils/formatBalance';
import { BOND_REDEEM_PRICE, BOND_REDEEM_PRICE_BN } from '../../telo-finance/constants';

const BackgroundImage = createGlobalStyle`
  body {
    background: url(${ScrapsImage}) no-repeat !important;
    background-size: cover !important;
  }
`;

const Scraps: React.FC = () => {
  const { path } = useRouteMatch();
  const { account } = useWallet();
  const teloFinance = useTeloFinance();
  const addTransaction = useTransactionAdder();
  const scrapStat = useScrapStats();
  const cashPrice = useCashPriceInLastTWAP();
  const scrapsPurchasable = useScrapsPurchasable();

  const bondBalance = useTokenBalance(teloFinance?.SCRAP);

  const handleBuyScraps = useCallback(
    async (amount: string) => {
      const tx = await teloFinance.buyScraps(amount);
      addTransaction(tx, {
        summary: `Buy ${Number(amount).toFixed(2)} SCRAP with ${amount} TELO`,
      });
    },
    [teloFinance, addTransaction],
  );

  const handleRedeemScraps = useCallback(
    async (amount: string) => {
      const tx = await teloFinance.redeemScraps(amount);
      addTransaction(tx, { summary: `Redeem ${amount} SCRAP` });
    },
    [teloFinance, addTransaction],
  );
  const isScrapRedeemable = useMemo(() => cashPrice.gt(BOND_REDEEM_PRICE_BN), [cashPrice]);
  const isScrapPurchasable = useMemo(() => Number(bondStat?.tokenInNear) < 1.01, [bondStat]);

  return (
    <Switch>
      <Page>
        <BackgroundImage />
        {!!account ? (
          <>
            <Route exact path={path}>
              <PageHeader icon={'🏦'} title="Buy & Redeem Scraps" subtitle="Earn premiums upon redemption" />
            </Route>
            <StyledScrap>
              <StyledCardWrapper>
                <ExchangeCard
                  action="Purchase"
                  fromToken={teloFinance.TELO}
                  fromTokenName="TELO"
                  toToken={teloFinance.SCRAP}
                  toTokenName="SCRAP"
                  priceDesc={
                    !isScrapPurchasable
                      ? 'TELO is over peg'
                      : getDisplayBalance(bondsPurchasable, 18, 4) + ' SCRAP available for purchase'
                  }
                  onExchange={handleBuyScraps}
                  disabled={!bondStat || isScrapRedeemable}
                />
              </StyledCardWrapper>
              <StyledStatsWrapper>
                <ExchangeStat
                  tokenName="TELO"
                  description="Last-Hour TWAP Price"
                  price={getDisplayBalance(cashPrice, 18, 4)}
                />
                <Spacer size="md" />
                <ExchangeStat
                  tokenName="SCRAP"
                  description="Current Price: (TELO)^2"
                  price={Number(bondStat?.tokenInNear).toFixed(2) || '-'}
                />
              </StyledStatsWrapper>
              <StyledCardWrapper>
                <ExchangeCard
                  action="Redeem"
                  fromToken={teloFinance.SCRAP}
                  fromTokenName="SCRAP"
                  toToken={teloFinance.TELO}
                  toTokenName="TELO"
                  priceDesc={`${getDisplayBalance(bondBalance)} SCRAP Available in wallet`}
                  onExchange={handleRedeemScraps}
                  disabled={!bondStat || bondBalance.eq(0) || !isScrapRedeemable}
                  disabledDescription={!isScrapRedeemable ? `Enabled when TELO > ${BOND_REDEEM_PRICE}NEAR` : null}
                />
              </StyledCardWrapper>
            </StyledScrap>
          </>
        ) : (
          <UnlockWallet />
        )}
      </Page>
    </Switch>
  );
};

const StyledScrap = styled.div`
  display: flex;
  @media (max-width: 768px) {
    width: 100%;
    flex-flow: column nowrap;
    align-items: center;
  }
`;

const StyledCardWrapper = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  @media (max-width: 768px) {
    width: 80%;
  }
`;

const StyledStatsWrapper = styled.div`
  display: flex;
  flex: 0.8;
  margin: 0 20px;
  flex-direction: column;

  @media (max-width: 768px) {
    width: 80%;
    margin: 16px 0;
  }
`;

export default Scraps;
