import React, { useMemo } from 'react';
import styled from 'styled-components';
import useTokenBalance from '../../hooks/useTokenBalance';
import { getDisplayBalance } from '../../utils/formatBalance';

import Label from '../Label';
import Modal, { ModalProps } from '../Modal';
import ModalTitle from '../ModalTitle';
import useTombFinance from '../../hooks/useTombFinance';
import TokenSymbol from '../TokenSymbol';

const AccountModal: React.FC<ModalProps> = ({ onDismiss }) => {
  const teloFinance = useTombFinance();

  const teloBalance = useTokenBalance(tombFinance.TELO);
  const displayTeloBalance = useMemo(() => getDisplayBalance(teloBalance), [teloBalance]);

  const mineralBalance = useTokenBalance(teloFinance.MINERAL);
  const displayMineralBalance = useMemo(() => getDisplayBalance(mineralBalance), [mineralBalance]);

  const scrapBalance = useTokenBalance(tombFinance.SCRAP);
  const displayScrapBalance = useMemo(() => getDisplayBalance(scrapBalance), [scrapBalance]);

  return (
    <Modal>
      <ModalTitle text="My Wallet" />

      <Balances>
        <StyledBalanceWrapper>
          <TokenSymbol symbol="TELO" />
          <StyledBalance>
            <StyledValue>{displayTeloBalance}</StyledValue>
            <Label text="TELO Available" />
          </StyledBalance>
        </StyledBalanceWrapper>

        <StyledBalanceWrapper>
          <TokenSymbol symbol="MINERAL" />
          <StyledBalance>
            <StyledValue>{displayMineralBalance}</StyledValue>
            <Label text="MINERAL Available" />
          </StyledBalance>
        </StyledBalanceWrapper>

        <StyledBalanceWrapper>
          <TokenSymbol symbol="SCRAP" />
          <StyledBalance>
            <StyledValue>{displayScrapBalance}</StyledValue>
            <Label text="SCRAP Available" />
          </StyledBalance>
        </StyledBalanceWrapper>
      </Balances>
    </Modal>
  );
};

const StyledValue = styled.div`
  //color: ${(props) => props.theme.color.grey[300]};
  font-size: 30px;
  font-weight: 700;
`;

const StyledBalance = styled.div`
  align-items: center;
  display: flex;
  flex-direction: column;
`;

const Balances = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: center;
  margin-bottom: ${(props) => props.theme.spacing[4]}px;
`;

const StyledBalanceWrapper = styled.div`
  align-items: center;
  display: flex;
  flex-direction: column;
  margin: 0 ${(props) => props.theme.spacing[3]}px;
`;

export default AccountModal;
