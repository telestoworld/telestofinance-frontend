import React, { /*useCallback, useEffect, */useMemo, useState } from 'react';
import Page from '../../components/Page';
import ScrapsImage from '../../assets/img/scraps.png';
import { createGlobalStyle } from 'styled-components';
import { Route, Switch, useRouteMatch } from 'react-router-dom';
import { useWallet } from 'use-wallet';
import UnlockWallet from '../../components/UnlockWallet';
import PageHeader from '../../components/PageHeader';
import { Box,/* Paper, Typography,*/ Button, Grid } from '@material-ui/core';
import styled from 'styled-components';
import Spacer from '../../components/Spacer';
import useTeloFinance from '../../hooks/useTeloFinance';
import { getDisplayBalance/*, getBalance*/ } from '../../utils/formatBalance';
import { BigNumber/*, ethers*/ } from 'ethers';
import useSwapScrapToMineral from '../../hooks/MineralSwapper/useSwapScrapToMineral';
import useApprove, { ApprovalState } from '../../hooks/useApprove';
import useMineralSwapperStats from '../../hooks/MineralSwapper/useMineralSwapperStats';
import TokenInput from '../../components/TokenInput';
import Card from '../../components/Card';
import CardContent from '../../components/CardContent';
import TokenSymbol from '../../components/TokenSymbol';

const BackgroundImage = createGlobalStyle`
  body {
    background: url(${ScrapsImage}) no-repeat !important;
    background-size: cover !important;
  }
`;

function isNumeric(n: any) {
  return !isNaN(parseFloat(n)) && isFinite(n);
}

const Sbs: React.FC = () => {
  const { path } = useRouteMatch();
  const { account } = useWallet();
  const teloFinance = useTeloFinance();
  const [scrapAmount, setScrapAmount] = useState('');
  const [mineralAmount, setMineralAmount] = useState('');

  const [approveStatus, approve] = useApprove(teloFinance.SCRAP, teloFinance.contracts.MineralSwapper.address);
  const { onSwapMineral } = useSwapScrapToMineral();
  const mineralSwapperStat = useMineralSwapperStats(account);

  const mineralBalance = useMemo(() => (mineralSwapperStat ? Number(mineralSwapperStat.mineralBalance) : 0), [mineralSwapperStat]);
  const scrapBalance = useMemo(() => (mineralSwapperStat ? Number(mineralSwapperStat.scrapBalance) : 0), [mineralSwapperStat]);

  const handleScrapChange = async (e: any) => {
    if (e.currentTarget.value === '') {
      setScrapAmount('');
      setMineralAmount('');
      return
    }
    if (!isNumeric(e.currentTarget.value)) return;
    setScrapAmount(e.currentTarget.value);
    const updateMineralAmount = await teloFinance.estimateAmountOfMineral(e.currentTarget.value);
    setMineralAmount(updateMineralAmount);  
  };

  const handleScrapSelectMax = async () => {
    setScrapAmount(String(scrapBalance));
    const updateMineralAmount = await teloFinance.estimateAmountOfMineral(String(scrapBalance));
    setMineralAmount(updateMineralAmount); 
  };

  const handleMineralSelectMax = async () => {
    setMineralAmount(String(mineralBalance));
    const rateMineralPerTelo = (await teloFinance.getMineralSwapperStat(account)).rateMineralPerTelo;
    const updateScrapAmount = ((BigNumber.from(10).pow(30)).div(BigNumber.from(rateMineralPerTelo))).mul(Number(mineralBalance) * 1e6);
    setScrapAmount(getDisplayBalance(updateScrapAmount, 18, 6));
  };

  const handleMineralChange = async (e: any) => {
    const inputData = e.currentTarget.value;
    if (inputData === '') {
      setMineralAmount('');
      setScrapAmount('');
      return
    }
    if (!isNumeric(inputData)) return;
    setMineralAmount(inputData);
    const rateMineralPerTelo = (await teloFinance.getMineralSwapperStat(account)).rateMineralPerTelo;
    const updateScrapAmount = ((BigNumber.from(10).pow(30)).div(BigNumber.from(rateMineralPerTelo))).mul(Number(inputData) * 1e6);
    setScrapAmount(getDisplayBalance(updateScrapAmount, 18, 6));
  }

  return (
    <Switch>
      <Page>
        <BackgroundImage />
        {!!account ? (
          <>
            <Route exact path={path}>
              <PageHeader icon={'🏦'} title="Scrap -> Mineral Swap" subtitle="Swap Scrap to Mineral" />
            </Route>
            <Box mt={5}>
              <Grid container justify="center" spacing={6}>
                <StyledBoardroom>
                  <StyledCardsWrapper>
                    <StyledCardWrapper>
                      <Card>
                        <CardContent>
                          <StyledCardContentInner>
                            <StyledCardTitle>Scraps</StyledCardTitle>
                            <StyledExchanger>
                              <StyledToken>
                                <StyledCardIcon>
                                  <TokenSymbol symbol={teloFinance.SCRAP.symbol} size={54} />
                                </StyledCardIcon>
                              </StyledToken>
                            </StyledExchanger>
                            <Grid item xs={12}>
                              <TokenInput
                                onSelectMax={handleScrapSelectMax}
                                onChange={handleScrapChange}
                                value={scrapAmount}
                                max={scrapBalance}
                                symbol="SCRAP"
                              ></TokenInput>
                            </Grid>
                            <StyledDesc>{`${scrapBalance} SCRAP Available in Wallet`}</StyledDesc>
                          </StyledCardContentInner>
                        </CardContent>
                      </Card>
                    </StyledCardWrapper>
                    <Spacer size="lg"/>
                    <StyledCardWrapper>
                      <Card>
                        <CardContent>
                          <StyledCardContentInner>
                            <StyledCardTitle>MINERAL</StyledCardTitle>
                            <StyledExchanger>
                              <StyledToken>
                                <StyledCardIcon>
                                  <TokenSymbol symbol={teloFinance.MINERAL.symbol} size={54} />
                                </StyledCardIcon>
                              </StyledToken>
                            </StyledExchanger>
                            <Grid item xs={12}>
                              <TokenInput
                                onSelectMax={handleMineralSelectMax}
                                onChange={handleMineralChange}
                                value={mineralAmount}
                                max={mineralBalance}
                                symbol="MINERAL"
                              ></TokenInput>
                            </Grid>
                            <StyledDesc>{`${mineralBalance} MINERAL Available in Swapper`}</StyledDesc>
                          </StyledCardContentInner>
                        </CardContent>
                      </Card>
              
                    </StyledCardWrapper>
                  </StyledCardsWrapper>
                </StyledBoardroom>
              </Grid>
            </Box>

            <Box mt={5}>
              <Grid container justify="center">
                <Grid item xs={8}>
                  <Card>
                    <CardContent>
                      <StyledApproveWrapper>
                      {approveStatus !== ApprovalState.APPROVED ? (
                        <Button
                          disabled={approveStatus !== ApprovalState.NOT_APPROVED}
                          color="primary"
                          variant="contained"
                          onClick={approve}
                          size="medium"
                        >
                          Approve SCRAP
                        </Button>
                      ) : (
                        <Button
                          color="primary"
                          variant="contained"
                          onClick={() => onSwapMineral(scrapAmount.toString())}
                          size="medium"
                        >
                          Swap
                        </Button>
                      )}
                      </StyledApproveWrapper>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </Box>
          </>
        ) : (
          <UnlockWallet />
        )}
      </Page>
    </Switch>
  );
};

const StyledBoardroom = styled.div`
  align-items: center;
  display: flex;
  flex-direction: column;
  @media (max-width: 768px) {
    width: 100%;
  }
`;

const StyledCardsWrapper = styled.div`
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
    width: 100%;
  }
`;

const StyledApproveWrapper = styled.div`
  margin-left: auto;
  margin-right: auto;
`;
const StyledCardTitle = styled.div`
  align-items: center;
  display: flex;
  font-size: 20px;
  font-weight: 700;
  height: 64px;
  justify-content: center;
  margin-top: ${(props) => -props.theme.spacing[3]}px;
`;

const StyledCardIcon = styled.div`
  background-color: ${(props) => props.theme.color.grey[900]};
  width: 72px;
  height: 72px;
  border-radius: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: ${(props) => props.theme.spacing[2]}px;
`;

const StyledExchanger = styled.div`
  align-items: center;
  display: flex;
  margin-bottom: ${(props) => props.theme.spacing[5]}px;
`;

const StyledToken = styled.div`
  align-items: center;
  display: flex;
  flex-direction: column;
  font-weight: 600;
`;

const StyledCardContentInner = styled.div`
  align-items: center;
  display: flex;
  flex: 1;
  flex-direction: column;
  justify-content: space-between;
`;

const StyledDesc = styled.span``;

export default Sbs;
