import React, { useMemo } from 'react';
import styled from 'styled-components';

import { Box, Button, Card, CardContent, Typography } from '@material-ui/core';

import TokenSymbol from '../../../components/TokenSymbol';
import Label from '../../../components/Label';
import Value from '../../../components/Value';
import CardIcon from '../../../components/CardIcon';
import useClaimRewardTimerLounge from '../../../hooks/masonry/useClaimRewardTimerLounge';
import useClaimRewardCheck from '../../../hooks/masonry/useClaimRewardCheck';
import ProgressCountdown from './ProgressCountdown';
import useCollectFromLounge from '../../../hooks/useCollectFromLounge';
import useEarningsOnLounge from '../../../hooks/useEarningsOnLounge';
import useTeloStats from '../../../hooks/useTeloStats';
import { getDisplayBalance } from '../../../utils/formatBalance';

const Collect: React.FC = () => {
  const teloStats = useTeloStats();
  const { onReward } = useCollectFromLounge();
  const earnings = useEarningsOnLounge();
  const canClaimReward = useClaimRewardCheck();

  const tokenPriceInDollars = useMemo(
    () => (teloStats ? Number(teloStats.priceInDollars).toFixed(2) : null),
    [teloStats],
  );

  const earnedInDollars = (Number(tokenPriceInDollars) * Number(getDisplayBalance(earnings))).toFixed(2);

  const { from, to } = useClaimRewardTimerLounge();

  return (
    <Box>
      <Card>
        <CardContent>
          <StyledCardContentInner>
            <StyledCardHeader>
              <CardIcon>
                <TokenSymbol symbol="TELO" />
              </CardIcon>
              <Value value={getDisplayBalance(earnings)} />
              <Label text={`≈ $${earnedInDollars}`} />
              <Label text="TELO Earned" />
            </StyledCardHeader>
            <StyledCardActions>
              <Button
                onClick={onReward}
                color="primary"
                variant="contained"
                disabled={earnings.eq(0) || !canClaimReward}
              >
                Claim Reward
              </Button>
            </StyledCardActions>
          </StyledCardContentInner>
        </CardContent>
      </Card>
      <Box mt={2} style={{ color: '#FFF' }}>
        {canClaimReward ? (
          ''
        ) : (
          <Card>
            <CardContent>
              <Typography style={{ textAlign: 'center' }}>Claim possible in</Typography>
              <ProgressCountdown hideBar={true} base={from} deadline={to} description="Claim available in" />
            </CardContent>
          </Card>
        )}
      </Box>
    </Box>
  );
};

const StyledCardHeader = styled.div`
  align-items: center;
  display: flex;
  flex-direction: column;
`;
const StyledCardActions = styled.div`
  display: flex;
  justify-content: center;
  margin-top: ${(props) => props.theme.spacing[6]}px;
  width: 100%;
`;

const StyledCardContentInner = styled.div`
  align-items: center;
  display: flex;
  flex: 1;
  flex-direction: column;
  justify-content: space-between;
`;

export default Collect;
