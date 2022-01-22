import React from 'react';

//Graveyard ecosystem logos
import teloLogo from '../../assets/img/crypto_tomb_cash.svg';
import mineralLogo from '../../assets/img/crypto_tomb_share.svg';
import teloLogoPNG from '../../assets/img/crypto_tomb_cash.f2b44ef4.png';
import mineralLogoPNG from '../../assets/img/crypto_tomb_share.bf1a6c52.png';
import scrapLogo from '../../assets/img/crypto_tomb_bond.svg';

import teloNearLpLogo from '../../assets/img/telo_near_lp.png';
import mineralNearLpLogo from '../../assets/img/mineral_near_lp.png';

import wnearLogo from '../../assets/img/near_logo_blue.svg';
import booLogo from '../../assets/img/spooky.png';
import zooLogo from '../../assets/img/zoo_logo.svg';
import shibaLogo from '../../assets/img/shiba_logo.svg';

const logosBySymbol: { [title: string]: string } = {
  //Real tokens
  //=====================
  TELO: teloLogo,
  TELOPNG: teloLogoPNG,
  MINERALPNG: mineralLogoPNG,
  MINERAL: mineralLogo,
  SCRAP: scrapLogo,
  WNEAR: wnearLogo,
  BOO: booLogo,
  SHIBA: shibaLogo,
  ZOO: zooLogo,
  'TELO-NEAR-LP': teloNearLpLogo,
  'MINERAL-NEAR-LP': mineralNearLpLogo,
};

type LogoProps = {
  symbol: string;
  size?: number;
};

const TokenSymbol: React.FC<LogoProps> = ({ symbol, size = 64 }) => {
  if (!logosBySymbol[symbol]) {
    throw new Error(`Invalid Token Logo symbol: ${symbol}`);
  }
  return <img src={logosBySymbol[symbol]} alt={`${symbol} Logo`} width={size} height={size} />;
};

export default TokenSymbol;
