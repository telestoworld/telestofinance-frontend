import React, { useMemo } from 'react';
import Page from '../../components/Page';
import HomeImage from '../../assets/img/home.png';
import CashImage from '../../assets/img/crypto_telo_cash.svg';
import Image from 'material-ui-image';
import styled from 'styled-components';
import { Alert } from '@material-ui/lab';
import { createGlobalStyle } from 'styled-components';
import CountUp from 'react-countup';
import CardIcon from '../../components/CardIcon';
import TokenSymbol from '../../components/TokenSymbol';
import useTeloStats from '../../hooks/useTStats';
import useLpStats from '../../hooks/useLpStats';
import useModal from '../../hooks/useModal';
import useZap from '../../hooks/useZap';
import useBondStats from '../../hooks/useBondStats';
import useMineralStats from '../../hooks/useMineralStats';
import useTotalValueLocked from '../../hooks/useTotalValueLocked';
import { telo as teloTesting, mineral as mineralTesting } from '../../telesto-finance/deployments/deployments.testing.json';
import { telo as teloProd, mineral as mineralProd } from '../../telesto-finance/deployments/deployments.mainnet.json';

import MetamaskFox from '../../assets/img/metamask-fox.svg';

import { Box, Button, Card, CardContent, Grid, Paper } from '@material-ui/core';
import ZapModal from '../Bank/components/ZapModal';

import { makeStyles } from '@material-ui/core/styles';
import useTeloFinance from '../../hooks/useTeloFinance';

const BackgroundImage = createGlobalStyle`
  body {
    background: url(${HomeImage}) no-repeat !important;
    background-size: cover !important;
  }
`;

const useStyles = makeStyles((theme) => ({
  button: {
    [theme.breakpoints.down('415')]: {
      marginTop: '10px',
    },
  },
}));

const Home = () => {
  const classes = useStyles();
  const TVL = useTotalValueLocked();
  const teloNearLpStats = useLpStats('TELO-NEAR-LP');
  const mineralNearLpStats = useLpStats('MINERAL-NEAR-LP');
  const teloStats = useTeloStats();
  const mineralStats = useMineralStats();
  const bondStats = useBondStats();
  const teloFinance = useTeloFinance();

  let telo;
  let mineral;
  if (!process.env.NODE_ENV || process.env.NODE_ENV === 'development') {
    telo = terloTesting;
    mineral = mineralTesting;
  } else {
    telo = teloProd;
    mineral = mineralProd;
  }

  //Buy TELO

  const buyTeloAddress = 'https://spookyswap.finance/swap?outputCurrency=' + telo.address;
  const buyMineralAddress = 'https://spookyswap.finance/swap?outputCurrency=' + mineral.address;

  const teloLPStats = useMemo(() => (teloNearLpStats ? teloNearLpStats : null), [teloNearLpStats]);
  const mineralLPStats = useMemo(() => (mineralNearLpStats ? mineralNearLpStats : null), [mineralNearLpStats]);
  const teloPriceInDollars = useMemo(
    () => (teloStats ? Number(teloStats.priceInDollars).toFixed(2) : null),
    [teloStats],
  );
  const teloPriceInFTM = useMemo(() => (teloStats ? Number(teloStats.tokenInFtm).toFixed(4) : null), [teloStats]);
  const teloCirculatingSupply = useMemo(() => (teloStats ? String(teloStats.circulatingSupply) : null), [teloStats]);
  const teloTotalSupply = useMemo(() => (teloStats ? String(teloStats.totalSupply) : null), [teloStats]);

  const mineralPriceInDollars = useMemo(
    () => (mineralStats ? Number(mineralStats.priceInDollars).toFixed(2) : null),
    [mineralStats],
  );
  const mineralPriceInNEAR = useMemo(
    () => (mineralStats ? Number(mineralStats.tokenInNear).toFixed(4) : null),
    [mineralStats],
  );
  const mineralCirculatingSupply = useMemo(
    () => (mineralStats ? String(mineralStats.circulatingSupply) : null),
    [mineralStats],
  );
  const mineralTotalSupply = useMemo(() => (mineralStats ? String(mineralStats.totalSupply) : null), [mineralStats]);

  const bondPriceInDollars = useMemo(
    () => (bondStats ? Number(bondStats.priceInDollars).toFixed(2) : null),
    [bondStats],
  );
  const bondPriceInNEAR = useMemo(() => (bondStats ? Number(bondStats.tokenInNear).toFixed(4) : null), [bondStats]);
  const bondCirculatingSupply = useMemo(
    () => (bondStats ? String(bondStats.circulatingSupply) : null),
    [bondStats],
  );
  const bondTotalSupply = useMemo(() => (bondStats ? String(bondStats.totalSupply) : null), [bondStats]);

  const teloLpZap = useZap({ depositTokenName: 'TELO-NEAR-LP' });
  const mineralLpZap = useZap({ depositTokenName: 'MINERAL-NEAR-LP' });

  const StyledLink = styled.a`
    font-weight: 700;
    text-decoration: none;
  `;

  const [onPresentTeloZap, onDissmissTeloZap] = useModal(
    <ZapModal
      decimals={18}
      onConfirm={(zappingToken, tokenName, amount) => {
        if (Number(amount) <= 0 || isNaN(Number(amount))) return;
        teloLpZap.onZap(zappingToken, tokenName, amount);
        onDissmissTeloZap();
      }}
      tokenName={'TELO-NEAR-LP'}
    />,
  );

  const [onPresentMineralZap, onDissmissMineralZap] = useModal(
    <ZapModal
      decimals={18}
      onConfirm={(zappingToken, tokenName, amount) => {
        if (Number(amount) <= 0 || isNaN(Number(amount))) return;
        mineralLpZap.onZap(zappingToken, tokenName, amount);
        onDissmissMineralZap();
      }}
      tokenName={'MINERAL-NEAR-LP'}
    />,
  );

  return (
    <Page>
      <BackgroundImage />
      <Grid container spacing={3}>
        {/* Logo */}
        <Grid container item xs={12} sm={4} justify="center">
          {/* <Paper>xs=6 sm=3</Paper> */}
          <Image color="none" style={{ width: '300px', paddingTop: '0px' }} src={CashImage} />
        </Grid>
        {/* Explanation text */}
        <Grid item xs={12} sm={8}>
          <Paper>
            <Box p={4}>
              <h2>Welcome to Telesto Finance</h2>
              <p>The first algorithmic stablecoin on Aurora, pegged to the price of 1 Near at a 10:1 via seigniorage.</p>
              <p>
                Stake your TELO-NEAR LP in the Vapor Pools to earn COIN.
                Then stake your earned COIN in the Trident Lounge to earn more TELO!
              </p>
            </Box>
          </Paper>



        </Grid>

        <Grid container spacing={3}>
    <Grid item  xs={12} sm={12} justify="center"  style={{ margin: '12px', display: 'flex' }}>
            <Alert variant="filled" severity="warning">
              <b>
              Please visit our <StyledLink target="_blank" href="https://telesto.gitbook.io/telesto/">documentation</StyledLink> before purchasing TELO or MINERAL!</b>
            </Alert>
        </Grid>
        </Grid>

        {/* TVL */}
        <Grid item xs={12} sm={4}>
          <Card>
            <CardContent align="center">
              <h2>Total Value Locked</h2>
              <CountUp style={{ fontSize: '25px' }} end={TVL} separator="," prefix="$" />
            </CardContent>
          </Card>
        </Grid>

        {/* Wallet */}
        <Grid item xs={12} sm={8}>
          <Card style={{ height: '100%' }}>
            <CardContent align="center" style={{ marginTop: '2.5%' }}>
              {/* <h2 style={{ marginBottom: '20px' }}>Wallet Balance</h2> */}
              <Button color="primary" href="/masonry" variant="contained" style={{ marginRight: '10px' }}>
                Stake Now
              </Button>
              <Button href="/vaporpools" variant="contained" style={{ marginRight: '10px' }}>
                Farm Now
              </Button>
              <Button
                color="primary"
                target="_blank"
                href={buyTeloAddress}
                variant="contained"
                style={{ marginRight: '10px' }}
                className={classes.button}
              >
                Buy TELO
              </Button>
              <Button variant="contained" target="_blank" href={buyMineralAddress} className={classes.button}>
                Buy MINERAL
              </Button>
            </CardContent>
          </Card>
        </Grid>

        {/* TELO */}
        <Grid item xs={12} sm={4}>
          <Card>
            <CardContent align="center" style={{ position: 'relative' }}>
              <h2>TELO</h2>
              <Button
                onClick={() => {
                  teloFinance.watchAssetInMetamask('TELO');
                }}
                color="primary"
                variant="outlined"
                style={{ position: 'absolute', top: '10px', right: '10px' }}
              >
                +&nbsp;
                <img alt="metamask fox" style={{ width: '20px' }} src={MetamaskFox} />
              </Button>
              <Box mt={2}>
                <CardIcon>
                  <TokenSymbol symbol="TELO" />
                </CardIcon>
              </Box>
              Current Price
              <Box>
                <span style={{ fontSize: '30px' }}>{teloPriceInFTM ? teloPriceInFTM : '-.----'} TELO</span>
              </Box>
              <Box>
                <span style={{ fontSize: '16px', alignContent: 'flex-start' }}>
                  ${teloPriceInDollars ? teloPriceInDollars : '-.--'}
                </span>
              </Box>
              <span style={{ fontSize: '12px' }}>
                Market Cap: ${(teloCirculatingSupply * teloPriceInDollars).toFixed(2)} <br />
                Circulating Supply: {teloCirculatingSupply} <br />
                Total Supply: {teloTotalSupply}
              </span>
            </CardContent>
          </Card>
        </Grid>

        {/* MINERAL */}
        <Grid item xs={12} sm={4}>
          <Card>
            <CardContent align="center" style={{ position: 'relative' }}>
              <h2>MINERAL</h2>
              <Button
                onClick={() => {
                  teloFinance.watchAssetInMetamask('MINERAL');
                }}
                color="primary"
                variant="outlined"
                style={{ position: 'absolute', top: '10px', right: '10px' }}
              >
                +&nbsp;
                <img alt="metamask fox" style={{ width: '20px' }} src={MetamaskFox} />
              </Button>
              <Box mt={2}>
                <CardIcon>
                  <TokenSymbol symbol="MINERAL" />
                </CardIcon>
              </Box>
              Current Price
              <Box>
                <span style={{ fontSize: '30px' }}>{mineralPriceInFTM ? mineralPriceInFTM : '-.----'} FTM</span>
              </Box>
              <Box>
                <span style={{ fontSize: '16px' }}>${mineralPriceInDollars ? mineralPriceInDollars : '-.--'}</span>
              </Box>
              <span style={{ fontSize: '12px' }}>
                Market Cap: ${(mineralCirculatingSupply * mineralPriceInDollars).toFixed(2)} <br />
                Circulating Supply: {mineralCirculatingSupply} <br />
                Total Supply: {mineralTotalSupply}
              </span>
            </CardContent>
          </Card>
        </Grid>

        {/* BOND */}
        <Grid item xs={12} sm={4}>
          <Card>
            <CardContent align="center" style={{ position: 'relative' }}>
              <h2>BOND</h2>
              <Button
                onClick={() => {
                  teloFinance.watchAssetInMetamask('BOND');
                }}
                color="primary"
                variant="outlined"
                style={{ position: 'absolute', top: '10px', right: '10px' }}
              >
                +&nbsp;
                <img alt="metamask fox" style={{ width: '20px' }} src={MetamaskFox} />
              </Button>
              <Box mt={2}>
                <CardIcon>
                  <TokenSymbol symbol="BOND" />
                </CardIcon>
              </Box>
              Current Price
              <Box>
                <span style={{ fontSize: '30px' }}>{bondPriceInFTM ? bondPriceInFTM : '-.----'} NEAR</span>
              </Box>
              <Box>
                <span style={{ fontSize: '16px' }}>${bondPriceInDollars ? bondPriceInDollars : '-.--'}</span>
              </Box>
              <span style={{ fontSize: '12px' }}>
                Market Cap: ${(bondCirculatingSupply * bondPriceInDollars).toFixed(2)} <br />
                Circulating Supply: {bondCirculatingSupply} <br />
                Total Supply: {bondTotalSupply}
              </span>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6}>
          <Card>
            <CardContent align="center">
              <h2>TELO-NEAR LP</h2>
              <Box mt={2}>
                <CardIcon>
                  <TokenSymbol symbol="TELO-NEAR-LP" />
                </CardIcon>
              </Box>
              <Box mt={2}>
                <Button color="primary" disabled={true} onClick={onPresentTeloZap} variant="contained">
                  Zap In
                </Button>
              </Box>
              <Box mt={2}>
                <span style={{ fontSize: '26px' }}>
                  {teloLPStats?.tokenAmount ? teloLPStats?.tokenAmount : '-.--'} TELO /{' '}
                  {teloLPStats?.ftmAmount ? teloLPStats?.ftmAmount : '-.--'} NEAR
                </span>
              </Box>
              <Box>${teloLPStats?.priceOfOne ? teloLPStats.priceOfOne : '-.--'}</Box>
              <span style={{ fontSize: '12px' }}>
                Liquidity: ${teloLPStats?.totalLiquidity ? teloLPStats.totalLiquidity : '-.--'} <br />
                Total supply: {teloLPStats?.totalSupply ? teloLPStats.totalSupply : '-.--'}
              </span>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6}>
          <Card>
            <CardContent align="center">
              <h2>MINERAL- NEAR LP</h2>
              <Box mt={2}>
                <CardIcon>
                  <TokenSymbol symbol="MINERAL-NEAR-LP" />
                </CardIcon>
              </Box>
              <Box mt={2}>
                <Button color="primary" onClick={onPresentMineralZap} variant="contained">
                  Zap In
                </Button>
              </Box>
              <Box mt={2}>
                <span style={{ fontSize: '26px' }}>
                  {mineralLPStats?.tokenAmount ? mineralLPStats?.tokenAmount : '-.--'} MINERAL /{' '}
                  {mineralLPStats?.nearAmount ? mineralLPStats?.nearAmount : '-.--'} NEAR
                </span>
              </Box>
              <Box>${mineralLPStats?.priceOfOne ? mineralLPStats.priceOfOne : '-.--'}</Box>
              <span style={{ fontSize: '12px' }}>
                Liquidity: ${mineralLPStats?.totalLiquidity ? mineralLPStats.totalLiquidity : '-.--'}
                <br />
                Total supply: {mineralLPStats?.totalSupply ? mineralLPStats.totalSupply : '-.--'}
              </span>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Page>
  );
};

export default Home;
