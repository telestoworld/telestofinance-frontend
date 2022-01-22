import React, { useMemo, useState } from 'react';
import Page from '../../components/Page';
import { createGlobalStyle } from 'styled-components';
import HomeImage from '../../assets/img/home.png';
import useLpStats from '../../hooks/useLpStats';
import { Box, Button, Grid, Paper, Typography } from '@material-ui/core';
import useTeloStats from '../../hooks/useTeloStats';
import TokenInput from '../../components/TokenInput';
import useTeloFinance from '../../hooks/useTeloFinance';
import { useWallet } from 'use-wallet';
import useTokenBalance from '../../hooks/useTokenBalance';
import { getDisplayBalance } from '../../utils/formatBalance';
import useApproveTaxOffice from '../../hooks/useApproveTaxOffice';
import { ApprovalState } from '../../hooks/useApprove';
import useProvideTeloNearLP from '../../hooks/useProvideTeloNearLP';
import { Alert } from '@material-ui/lab';

const BackgroundImage = createGlobalStyle`
  body {
    background: url(${HomeImage}) no-repeat !important;
    background-size: cover !important;
  }
`;
function isNumeric(n) {
  return !isNaN(parseFloat(n)) && isFinite(n);
}

const ProvideLiquidity = () => {
  const [teloAmount, setTeloAmount] = useState(0);
  const [nearAmount, setNearAmount] = useState(0);
  const [lpTokensAmount, setLpTokensAmount] = useState(0);
  const { balance } = useWallet();
  const teloStats = useTeloStats();
  const teloFinance = useTeloFinance();
  const [approveTaxOfficeStatus, approveTaxOffice] = useApproveTaxOffice();
  const teloBalance = useTokenBalance(teloFinance.TELO);
  const nearBalance = (balance / 1e18).toFixed(4);
  const { onProvideTeloNearLP } = useProvideTeloNearLP();
  const teloNearLpStats = useLpStats('TELO-NEAR-LP');

  const teloLPStats = useMemo(() => (teloNearLpStats ? teloNearLpStats : null), [teloNearLpStats]);
  const teloPriceInNEAR = useMemo(() => (teloStats ? Number(teloStats.tokenInNear).toFixed(2) : null), [teloStats]);
  const nearPriceInTELO = useMemo(() => (teloStats ? Number(1 / teloStats.tokenInNear).toFixed(2) : null), [teloStats]);
  // const classes = useStyles();

  const handleTeloChange = async (e) => {
    if (e.currentTarget.value === '' || e.currentTarget.value === 0) {
      setTeloAmount(e.currentTarget.value);
    }
    if (!isNumeric(e.currentTarget.value)) return;
    setTeloAmount(e.currentTarget.value);
    const quoteFromSpooky = await teloFinance.quoteFromSpooky(e.currentTarget.value, 'TELO');
    setNearAmount(quoteFromSpooky);
    setLpTokensAmount(quoteFromSpooky / teloLPStats.nearAmount);
  };

  const handleNearChange = async (e) => {
    if (e.currentTarget.value === '' || e.currentTarget.value === 0) {
      setNearAmount(e.currentTarget.value);
    }
    if (!isNumeric(e.currentTarget.value)) return;
    setNearAmount(e.currentTarget.value);
    const quoteFromSpooky = await teloFinance.quoteFromSpooky(e.currentTarget.value, 'NEAR');
    setTeloAmount(quoteFromSpooky);

    setLpTokensAmount(quoteFromSpooky / teloLPStats.tokenAmount);
  };
  const handleTeloSelectMax = async () => {
    const quoteFromSpooky = await teloFinance.quoteFromSpooky(getDisplayBalance(teloBalance), 'TELO');
    setTeloAmount(getDisplayBalance(teloBalance));
    setNearAmount(quoteFromSpooky);
    setLpTokensAmount(quoteFromSpooky / teloLPStats.nearAmount);
  };
  const handleNearSelectMax = async () => {
    const quoteFromSpooky = await teloFinance.quoteFromSpooky(nearBalance, 'NEAR');
    setNearAmount(nearBalance);
    setTeloAmount(quoteFromSpooky);
    setLpTokensAmount(nearBalance / teloLPStats.nearAmount);
  };
  return (
    <Page>
      <BackgroundImage />
      <Typography color="textPrimary" align="center" variant="h3" gutterBottom>
        Provide Liquidity
      </Typography>

      <Grid container justify="center">
        <Box style={{ width: '600px' }}>
          <Alert variant="filled" severity="warning" style={{ marginBottom: '10px' }}>
            <b>This and <a href="https://spookyswap.finance/"  rel="noopener noreferrer" target="_blank">Spookyswap</a> are the only ways to provide Liquidity on TELO-FTM pair without paying tax.</b>
          </Alert>
          <Grid item xs={12} sm={12}>
            <Paper>
              <Box mt={4}>
                <Grid item xs={12} sm={12} style={{ borderRadius: 15 }}>
                  <Box p={4}>
                    <Grid container>
                      <Grid item xs={12}>
                        <TokenInput
                          onSelectMax={handleTeloSelectMax}
                          onChange={handleTeloChange}
                          value={teloAmount}
                          max={getDisplayBalance(teloBalance)}
                          symbol={'TELO'}
                        ></TokenInput>
                      </Grid>
                      <Grid item xs={12}>
                        <TokenInput
                          onSelectMax={handleNearSelectMax}
                          onChange={handleNearChange}
                          value={nearAmount}
                          max={nearBalance}
                          symbol={'NEAR'}
                        ></TokenInput>
                      </Grid>
                      <Grid item xs={12}>
                        <p>1 TELO = {teloPriceInNEAR} NEAR</p>
                        <p>1 NEAR = {nearPriceInTELO} TELO</p>
                        <p>LP tokens ≈ {lpTokensAmount.toFixed(2)}</p>
                      </Grid>
                      <Grid xs={12} justifyContent="center" style={{ textAlign: 'center' }}>
                        {approveTaxOfficeStatus === ApprovalState.APPROVED ? (
                          <Button
                            variant="contained"
                            onClick={() => onProvideTeloNearLP(nearAmount.toString(), teloAmount.toString())}
                            color="primary"
                            style={{ margin: '0 10px', color: '#fff' }}
                          >
                            Supply
                          </Button>
                        ) : (
                          <Button
                            variant="contained"
                            onClick={() => approveTaxOffice()}
                            color="secondary"
                            style={{ margin: '0 10px' }}
                          >
                            Approve
                          </Button>
                        )}
                      </Grid>
                    </Grid>
                  </Box>
                </Grid>
              </Box>
            </Paper>
          </Grid>
        </Box>
      </Grid>
    </Page>
  );
};

export default ProvideLiquidity;
