// import { Fetcher, Route, Token } from '@uniswap/sdk';
import { Fetcher as FetcherSpirit, Token as TokenSpirit } from '@spiritswap/sdk';
import { Fetcher, Route, Token } from '@spookyswap/sdk';
import { Configuration } from './config';
import { ContractName, TokenStat, AllocationTime, LPStat, Bank, PoolStats, MineralSwapperStat } from './types';
import { BigNumber, Contract, ethers, EventFilter } from 'ethers';
import { decimalToBalance } from './ether-utils';
import { TransactionResponse } from '@ethersproject/providers';
import ERC20 from './ERC20';
import { getFullDisplayBalance, getDisplayBalance } from '../utils/formatBalance';
import { getDefaultProvider } from '../utils/provider';
import IUniswapV2PairABI from './IUniswapV2Pair.abi.json';
import config, { bankDefinitions } from '../config';
import moment from 'moment';
import { parseUnits } from 'ethers/lib/utils';
import { NEAR_TICKER, SPOOKY_ROUTER_ADDR, TELO_TICKER } from '../utils/constants';
/**
 * An API module of Telesto Finance contracts.
 * All contract-interacting domain logic should be defined in here.
 */
export class TeloFinance {
  myAccount: string;
  provider: ethers.providers.Web3Provider;
  signer?: ethers.Signer;
  config: Configuration;
  contracts: { [name: string]: Contract };
  externalTokens: { [name: string]: ERC20 };
  loungeVersionOfUser?: string;

  TELOWNEAR_LP: Contract;
  TELO: ERC20;
  MINERAL: ERC20;
  SCRAP: ERC20;
  NEAR: ERC20;

  constructor(cfg: Configuration) {
    const { deployments, externalTokens } = cfg;
    const provider = getDefaultProvider();

    // loads contracts from deployments
    this.contracts = {};
    for (const [name, deployment] of Object.entries(deployments)) {
      this.contracts[name] = new Contract(deployment.address, deployment.abi, provider);
    }
    this.externalTokens = {};
    for (const [symbol, [address, decimal]] of Object.entries(externalTokens)) {
      this.externalTokens[symbol] = new ERC20(address, provider, symbol, decimal);
    }
    this.TELO = new ERC20(deployments.telo.address, provider, 'TELO');
    this.MINERAL = new ERC20(deployments.mineral.address, provider, 'MINERAL');
    this.SCRAP = new ERC20(deployments.tScrap.address, provider, 'SCRAP');
    this.NEAR = this.externalTokens['WNEAR'];

    // Uniswap V2 Pair
    this.TELOWNEAR_LP = new Contract(externalTokens['TELO-NEAR-LP'][0], IUniswapV2PairABI, provider);

    this.config = cfg;
    this.provider = provider;
  }

  /**
   * @param provider From an unlocked wallet. (e.g. Metamask)
   * @param account An address of unlocked wallet account.
   */
  unlockWallet(provider: any, account: string) {
    const newProvider = new ethers.providers.Web3Provider(provider, this.config.chainId);
    this.signer = newProvider.getSigner(0);
    this.myAccount = account;
    for (const [name, contract] of Object.entries(this.contracts)) {
      this.contracts[name] = contract.connect(this.signer);
    }
    const tokens = [this.TELO, this.MINERAL, this.SCRAP, ...Object.values(this.externalTokens)];
    for (const token of tokens) {
      token.connect(this.signer);
    }
    this.TELOWNEAR_LP = this.TELOWNEAR_LP.connect(this.signer);
    console.log(`🔓 Wallet is unlocked. Welcome, ${account}!`);
    this.fetchLoungeVersionOfUser()
      .then((version) => (this.loungeVersionOfUser = version))
      .catch((err) => {
        console.error(`Failed to fetch trident lounge version: ${err.stack}`);
        this.loungeVersionOfUser = 'latest';
      });
  }

  get isUnlocked(): boolean {
    return !!this.myAccount;
  }

  //===================================================================
  //===================== GET ASSET STATS =============================
  //===================FROM SPOOKY TO DISPLAY =========================
  //=========================IN HOME PAGE==============================
  //===================================================================

  async getTeloStat(): Promise<TokenStat> {
    const { TeloNearRewardPool, TeloNearLpTeloRewardPool, TeloNearLpTeloRewardPoolOld } = this.contracts;
    const supply = await this.TELO.totalSupply();
    const teloRewardPoolSupply = await this.TELO.balanceOf(TeloNearRewardPool.address);
    const teloRewardPoolSupply2 = await this.TELO.balanceOf(TeloNearLpTeloRewardPool.address);
    const teloRewardPoolSupplyOld = await this.TELO.balanceOf(TeloNearLpTeloRewardPoolOld.address);
    const teloCirculatingSupply = supply
      .sub(teloRewardPoolSupply)
      .sub(teloRewardPoolSupply2)
      .sub(teloRewardPoolSupplyOld);
    const priceInNEAR = await this.getTokenPriceFromPancakeswap(this.TELO);
    const priceOfOneNEAR = await this.getWNEARPriceFromPancakeswap();
    const priceOfTeloInDollars = (Number(priceInNEAR) * Number(priceOfOneNEAR)).toFixed(2);

    return {
      tokenInNear: priceInNEAR,
      priceInDollars: priceOfTeloInDollars,
      totalSupply: getDisplayBalance(supply, this.TELO.decimal, 0),
      circulatingSupply: getDisplayBalance(teloCirculatingSupply, this.TELO.decimal, 0),
    };
  }

  /**
   * Calculates various stats for the requested LP
   * @param name of the LP token to load stats for
   * @returns
   */
  async getLPStat(name: string): Promise<LPStat> {
    const lpToken = this.externalTokens[name];
    const lpTokenSupplyBN = await lpToken.totalSupply();
    const lpTokenSupply = getDisplayBalance(lpTokenSupplyBN, 18);
    const token0 = name.startsWith('TELO') ? this.TELO : this.MINERAL;
    const isTelo = name.startsWith('TELO');
    const tokenAmountBN = await token0.balanceOf(lpToken.address);
    const tokenAmount = getDisplayBalance(tokenAmountBN, 18);

    const nearAmountBN = await this.NEAR.balanceOf(lpToken.address);
    const nearAmount = getDisplayBalance(nearAmountBN, 18);
    const tokenAmountInOneLP = Number(tokenAmount) / Number(lpTokenSupply);
    const nearAmountInOneLP = Number(nearAmount) / Number(lpTokenSupply);
    const lpTokenPrice = await this.getLPTokenPrice(lpToken, token0, isTelo);
    const lpTokenPriceFixed = Number(lpTokenPrice).toFixed(2).toString();
    const liquidity = (Number(lpTokenSupply) * Number(lpTokenPrice)).toFixed(2).toString();
    return {
      tokenAmount: tokenAmountInOneLP.toFixed(2).toString(),
      nearAmount: nearAmountInOneLP.toFixed(2).toString(),
      priceOfOne: lpTokenPriceFixed,
      totalLiquidity: liquidity,
      totalSupply: Number(lpTokenSupply).toFixed(2).toString(),
    };
  }

  /**
   * Use this method to get price for Telo
   * @returns TokenStat for SCRAP
   * priceInNEAR
   * priceInDollars
   * TotalSupply
   * CirculatingSupply (always equal to total supply for scraps)
   */
  async getScrapStat(): Promise<TokenStat> {
    const { Treasury } = this.contracts;
    const teloStat = await this.getTeloStat();
    const scrapTeloRatioBN = await Treasury.getScrapPremiumRate();
    const modifier = scrapTeloRatioBN / 1e18 > 1 ? scrapTeloRatioBN / 1e18 : 1;
    const scrapPriceInNEAR = (Number(teloStat.tokenInNear) * modifier).toFixed(2);
    const priceOfScrapInDollars = (Number(teloStat.priceInDollars) * modifier).toFixed(2);
    const supply = await this.SCRAP.displayedTotalSupply();
    return {
      tokenInNear: scrapPriceInNEAR,
      priceInDollars: priceOfScrapInDollars,
      totalSupply: supply,
      circulatingSupply: supply,
    };
  }

  /**
   * @returns TokenStat for MINERAL
   * priceInNEAR
   * priceInDollars
   * TotalSupply
   * CirculatingSupply (always equal to total supply for scraps)
   */
  async getMineralStat(): Promise<TokenStat> {
    const { TeloNearLPMineralRewardPool } = this.contracts;

    const supply = await this.MINERAL.totalSupply();

    const priceInNEAR = await this.getTokenPriceFromPancakeswap(this.MINERAL);
    const teloRewardPoolSupply = await this.MINERAL.balanceOf(TeloNearLPMineralRewardPool.address);
    const mineralCirculatingSupply = supply.sub(teloRewardPoolSupply);
    const priceOfOneNEAR = await this.getWNEARPriceFromPancakeswap();
    const priceOfSharesInDollars = (Number(priceInNEAR) * Number(priceOfOneNEAR)).toFixed(2);

    return {
      tokenInNear: priceInNEAR,
      priceInDollars: priceOfSharesInDollars,
      totalSupply: getDisplayBalance(supply, this.MINERAL.decimal, 0),
      circulatingSupply: getDisplayBalance(mineralCirculatingSupply, this.MINERAL.decimal, 0),
    };
  }

  async getTeloStatInEstimatedTWAP(): Promise<TokenStat> {
    const { SeigniorageOracle, TeloNearRewardPool } = this.contracts;
    const expectedPrice = await SeigniorageOracle.twap(this.TELO.address, ethers.utils.parseEther('1'));

    const supply = await this.TELO.totalSupply();
    const teloRewardPoolSupply = await this.TELO.balanceOf(TeloNearRewardPool.address);
    const teloCirculatingSupply = supply.sub(teloRewardPoolSupply);
    return {
      tokenInNear: getDisplayBalance(expectedPrice),
      priceInDollars: getDisplayBalance(expectedPrice),
      totalSupply: getDisplayBalance(supply, this.TELO.decimal, 0),
      circulatingSupply: getDisplayBalance(teloCirculatingSupply, this.TELO.decimal, 0),
    };
  }

  async getTeloPriceInLastTWAP(): Promise<BigNumber> {
    const { Treasury } = this.contracts;
    return Treasury.getTeloUpdatedPrice();
  }

  async getScrapsPurchasable(): Promise<BigNumber> {
    const { Treasury } = this.contracts;
    return Treasury.getBurnableTeloLeft();
  }

  /**
   * Calculates the TVL, APR and daily APR of a provided pool/bank
   * @param bank
   * @returns
   */
  async getPoolAPRs(bank: Bank): Promise<PoolStats> {
    if (this.myAccount === undefined) return;
    const depositToken = bank.depositToken;
    const poolContract = this.contracts[bank.contract];
    const depositTokenPrice = await this.getDepositTokenPriceInDollars(bank.depositTokenName, depositToken);
    const stakeInPool = await depositToken.balanceOf(bank.address);
    const TVL = Number(depositTokenPrice) * Number(getDisplayBalance(stakeInPool, depositToken.decimal));
    const stat = bank.earnTokenName === 'TELO' ? await this.getTeloStat() : await this.getMineralStat();
    const tokenPerSecond = await this.getTokenPerSecond(
      bank.earnTokenName,
      bank.contract,
      poolContract,
      bank.depositTokenName,
    );

    const tokenPerHour = tokenPerSecond.mul(60).mul(60);
    const totalRewardPricePerYear =
      Number(stat.priceInDollars) * Number(getDisplayBalance(tokenPerHour.mul(24).mul(365)));
    const totalRewardPricePerDay = Number(stat.priceInDollars) * Number(getDisplayBalance(tokenPerHour.mul(24)));
    const totalStakingTokenInPool =
      Number(depositTokenPrice) * Number(getDisplayBalance(stakeInPool, depositToken.decimal));
    const dailyAPR = (totalRewardPricePerDay / totalStakingTokenInPool) * 100;
    const yearlyAPR = (totalRewardPricePerYear / totalStakingTokenInPool) * 100;
    return {
      dailyAPR: dailyAPR.toFixed(2).toString(),
      yearlyAPR: yearlyAPR.toFixed(2).toString(),
      TVL: TVL.toFixed(2).toString(),
    };
  }

  /**
   * Method to return the amount of tokens the pool yields per second
   * @param earnTokenName the name of the token that the pool is earning
   * @param contractName the contract of the pool/bank
   * @param poolContract the actual contract of the pool
   * @returns
   */
  async getTokenPerSecond(
    earnTokenName: string,
    contractName: string,
    poolContract: Contract,
    depositTokenName: string,
  ) {
    if (earnTokenName === 'TELO') {
      if (!contractName.endsWith('TeloRewardPool')) {
        const rewardPerSecond = await poolContract.teloPerSecond();
        if (depositTokenName === 'WNEAR') {
          return rewardPerSecond.mul(6000).div(11000).div(24);
        } else if (depositTokenName === 'BOO') {
          return rewardPerSecond.mul(2500).div(11000).div(24);
        } else if (depositTokenName === 'ZOO') {
          return rewardPerSecond.mul(1000).div(11000).div(24);
        } else if (depositTokenName === 'SHIBA') {
          return rewardPerSecond.mul(1500).div(11000).div(24);
        }
        return rewardPerSecond.div(24);
      }
      const poolStartTime = await poolContract.poolStartTime();
      const startDateTime = new Date(poolStartTime.toNumber() * 1000);
      const FOUR_DAYS = 4 * 24 * 60 * 60 * 1000;
      if (Date.now() - startDateTime.getTime() > FOUR_DAYS) {
        return await poolContract.epochTeloPerSecond(1);
      }
      return await poolContract.epochTeloPerSecond(0);
    }
    const rewardPerSecond = await poolContract.mineralPerSecond();
    if (depositTokenName.startsWith('TELO')) {
      return rewardPerSecond.mul(35500).div(59500);
    } else {
      return rewardPerSecond.mul(24000).div(59500);
    }
  }

  /**
   * Method to calculate the tokenPrice of the deposited asset in a pool/bank
   * If the deposited token is an LP it will find the price of its pieces
   * @param tokenName
   * @param pool
   * @param token
   * @returns
   */
  async getDepositTokenPriceInDollars(tokenName: string, token: ERC20) {
    let tokenPrice;
    const priceOfOneNearInDollars = await this.getWNEARPriceFromPancakeswap();
    if (tokenName === 'WNEAR') {
      tokenPrice = priceOfOneNearInDollars;
    } else {
      if (tokenName === 'TELO-NEAR-LP') {
        tokenPrice = await this.getLPTokenPrice(token, this.TELO, true);
      } else if (tokenName === 'MINERAL-NEAR-LP') {
        tokenPrice = await this.getLPTokenPrice(token, this.MINERAL, false);
      } else if (tokenName === 'SHIBA') {
        tokenPrice = await this.getTokenPriceFromSpiritswap(token);
      } else {
        tokenPrice = await this.getTokenPriceFromPancakeswap(token);
        tokenPrice = (Number(tokenPrice) * Number(priceOfOneNearInDollars)).toString();
      }
    }
    return tokenPrice;
  }

  //===================================================================
  //===================== GET ASSET STATS =============================
  //=========================== END ===================================
  //===================================================================

  async getCurrentEpoch(): Promise<BigNumber> {
    const { Treasury } = this.contracts;
    return Treasury.epoch();
  }

  async getScrapOraclePriceInLastTWAP(): Promise<BigNumber> {
    const { Treasury } = this.contracts;
    return Treasury.getScrapPremiumRate();
  }

  /**
   * Buy scraps with cash.
   * @param amount amount of cash to purchase scraps with.
   */
  async buyScraps(amount: string | number): Promise<TransactionResponse> {
    const { Treasury } = this.contracts;
    const treasuryTeloPrice = await Treasury.getTeloPrice();
    return await Treasury.buyScraps(decimalToBalance(amount), treasuryTeloPrice);
  }

  /**
   * Redeem scraps for cash.
   * @param amount amount of scraps to redeem.
   */
  async redeemScraps(amount: string): Promise<TransactionResponse> {
    const { Treasury } = this.contracts;
    const priceForTelo = await Treasury.getTeloPrice();
    return await Treasury.redeemScraps(decimalToBalance(amount), priceForTelo);
  }

  async getTotalValueLocked(): Promise<Number> {
    let totalValue = 0;
    for (const bankInfo of Object.values(bankDefinitions)) {
      const pool = this.contracts[bankInfo.contract];
      const token = this.externalTokens[bankInfo.depositTokenName];
      const tokenPrice = await this.getDepositTokenPriceInDollars(bankInfo.depositTokenName, token);
      const tokenAmountInPool = await token.balanceOf(pool.address);
      const value = Number(getDisplayBalance(tokenAmountInPool, token.decimal)) * Number(tokenPrice);
      const poolValue = Number.isNaN(value) ? 0 : value;
      totalValue += poolValue;
    }

    const MINERALPrice = (await this.getMineralStat()).priceInDollars;
    const loungeGetMineralBalanceOf = await this.MINERAL.balanceOf(this.currentLounge().address);
    const loungeTVL = Number(getDisplayBalance(loungeGetMineralBalanceOf, this.MINERAL.decimal)) * Number(MINERALPrice);

    return totalValue + loungeTVL;
  }

  /**
   * Calculates the price of an LP token
   * Reference https://github.com/DefiDebauchery/discordpricebot/blob/4da3cdb57016df108ad2d0bb0c91cd8dd5f9d834/pricebot/pricebot.py#L150
   * @param lpToken the token under calculation
   * @param token the token pair used as reference (the other one would be NEAR in most cases)
   * @param isTelo sanity check for usage of telo token or MINERAL
   * @returns price of the LP token
   */
  async getLPTokenPrice(lpToken: ERC20, token: ERC20, isTelo: boolean): Promise<string> {
    const totalSupply = getFullDisplayBalance(await lpToken.totalSupply(), lpToken.decimal);
    //Get amount of tokenA
    const tokenSupply = getFullDisplayBalance(await token.balanceOf(lpToken.address), token.decimal);
    const stat = isTelo === true ? await this.getTeloStat() : await this.getMineralStat();
    const priceOfToken = stat.priceInDollars;
    const tokenInLP = Number(tokenSupply) / Number(totalSupply);
    const tokenPrice = (Number(priceOfToken) * tokenInLP * 2) //We multiply by 2 since half the price of the lp token is the price of each piece of the pair. So twice gives the total
      .toString();
    return tokenPrice;
  }

  async earnedFromBank(
    poolName: ContractName,
    earnTokenName: String,
    poolId: Number,
    account = this.myAccount,
  ): Promise<BigNumber> {
    const pool = this.contracts[poolName];
    try {
      if (earnTokenName === 'TELO') {
        return await pool.pendingTELO(poolId, account);
      } else {
        return await pool.pendingShare(poolId, account);
      }
    } catch (err) {
      console.error(`Failed to call earned() on pool ${pool.address}: ${err}`);
      return BigNumber.from(0);
    }
  }

  async stakedBalanceOnBank(poolName: ContractName, poolId: Number, account = this.myAccount): Promise<BigNumber> {
    const pool = this.contracts[poolName];
    try {
      let userInfo = await pool.userInfo(poolId, account);
      return await userInfo.amount;
    } catch (err) {
      console.error(`Failed to call balanceOf() on pool ${pool.address}: ${err}`);
      return BigNumber.from(0);
    }
  }

  /**
   * Deposits token to given pool.
   * @param poolName A name of pool contract.
   * @param amount Number of tokens with decimals applied. (e.g. 1.45 DAI * 10^18)
   * @returns {string} Transaction hash
   */
  async stake(poolName: ContractName, poolId: Number, amount: BigNumber): Promise<TransactionResponse> {
    const pool = this.contracts[poolName];
    return await pool.deposit(poolId, amount);
  }

  /**
   * Withdraws token from given pool.
   * @param poolName A name of pool contract.
   * @param amount Number of tokens with decimals applied. (e.g. 1.45 DAI * 10^18)
   * @returns {string} Transaction hash
   */
  async unstake(poolName: ContractName, poolId: Number, amount: BigNumber): Promise<TransactionResponse> {
    const pool = this.contracts[poolName];
    return await pool.withdraw(poolId, amount);
  }

  /**
   * Transfers earned token reward from given pool to my account.
   */
  async collect(poolName: ContractName, poolId: Number): Promise<TransactionResponse> {
    const pool = this.contracts[poolName];
    //By passing 0 as the amount, we are asking the contract to only redeem the reward and not the currently staked token
    return await pool.withdraw(poolId, 0);
  }

  /**
   * Collects and withdraws deposited tokens from the pool.
   */
  async exit(poolName: ContractName, poolId: Number, account = this.myAccount): Promise<TransactionResponse> {
    const pool = this.contracts[poolName];
    let userInfo = await pool.userInfo(poolId, account);
    return await pool.withdraw(poolId, userInfo.amount);
  }

  async fetchLoungeVersionOfUser(): Promise<string> {
    return 'latest';
  }

  currentLounge(): Contract {
    if (!this.loungeVersionOfUser) {
      //throw new Error('you must unlock the wallet to continue.');
    }
    return this.contracts.Lounge;
  }

  isOldLoungeMember(): boolean {
    return this.loungeVersionOfUser !== 'latest';
  }

  async getTokenPriceFromPancakeswap(tokenContract: ERC20): Promise<string> {
    const ready = await this.provider.ready;
    if (!ready) return;
    const { chainId } = this.config;
    const { WNEAR } = this.config.externalTokens;

    const wnear = new Token(chainId, WNEAR[0], WNEAR[1]);
    const token = new Token(chainId, tokenContract.address, tokenContract.decimal, tokenContract.symbol);
    try {
      const wnearToToken = await Fetcher.fetchPairData(wnear, token, this.provider);
      const priceInBUSD = new Route([wnearToToken], token);

      return priceInBUSD.midPrice.toFixed(4);
    } catch (err) {
      console.error(`Failed to fetch token price of ${tokenContract.symbol}: ${err}`);
    }
  }

  async getTokenPriceFromSpiritswap(tokenContract: ERC20): Promise<string> {
    const ready = await this.provider.ready;
    if (!ready) return;
    const { chainId } = this.config;

    const { WNEAR } = this.externalTokens;

    const wnear = new TokenSpirit(chainId, WNEAR.address, WNEAR.decimal);
    const token = new TokenSpirit(chainId, tokenContract.address, tokenContract.decimal, tokenContract.symbol);
    try {
      const wnearToToken = await FetcherSpirit.fetchPairData(wnear, token, this.provider);
      const liquidityToken = wnearToToken.liquidityToken;
      let nearBalanceInLP = await WNEAR.balanceOf(liquidityToken.address);
      let nearAmount = Number(getFullDisplayBalance(nearBalanceInLP, WNEAR.decimal));
      let shibaBalanceInLP = await tokenContract.balanceOf(liquidityToken.address);
      let shibaAmount = Number(getFullDisplayBalance(shibaBalanceInLP, tokenContract.decimal));
      const priceOfOneNearInDollars = await this.getWNEARPriceFromPancakeswap();
      let priceOfShiba = (nearAmount / shibaAmount) * Number(priceOfOneNearInDollars);
      return priceOfShiba.toString();
    } catch (err) {
      console.error(`Failed to fetch token price of ${tokenContract.symbol}: ${err}`);
    }
  }

  async getWNEARPriceFromPancakeswap(): Promise<string> {
    const ready = await this.provider.ready;
    if (!ready) return;
    const { WNEAR, FUSDT } = this.externalTokens;
    try {
      const fusdt_wnear_lp_pair = this.externalTokens['USDT-NEAR-LP'];
      let near_amount_BN = await WNEAR.balanceOf(fusdt_wnear_lp_pair.address);
      let near_amount = Number(getFullDisplayBalance(near_amount_BN, WNEAR.decimal));
      let fusdt_amount_BN = await FUSDT.balanceOf(fusdt_wnear_lp_pair.address);
      let fusdt_amount = Number(getFullDisplayBalance(fusdt_amount_BN, FUSDT.decimal));
      return (fusdt_amount / near_amount).toString();
    } catch (err) {
      console.error(`Failed to fetch token price of WNEAR: ${err}`);
    }
  }

  //===================================================================
  //===================================================================
  //===================== MASONRY METHODS =============================
  //===================================================================
  //===================================================================

  async getLoungeAPR() {
    const Lounge = this.currentLounge();
    const latestSnapshotIndex = await Lounge.latestSnapshotIndex();
    const lastHistory = await Lounge.loungeHistory(latestSnapshotIndex);

    const lastRewardsReceived = lastHistory[1];

    const MINERALPrice = (await this.getMineralStat()).priceInDollars;
    const TELOPrice = (await this.getTeloStat()).priceInDollars;
    const epochRewardsPerShare = lastRewardsReceived / 1e18;

    //Mgod formula
    const amountOfRewardsPerDay = epochRewardsPerShare * Number(TELOPrice) * 4;
    const loungeMineralBalanceOf = await this.MINERAL.balanceOf(Lounge.address);
    const loungeTVL = Number(getDisplayBalance(loungeMineralBalanceOf, this.MINERAL.decimal)) * Number(MINERALPrice);
    const realAPR = ((amountOfRewardsPerDay * 100) / loungeTVL) * 365;
    return realAPR;
  }

  /**
   * Checks if the user is allowed to retrieve their reward from the Lounge
   * @returns true if user can withdraw reward, false if they can't
   */
  async canUserClaimRewardFromLounge(): Promise<boolean> {
    const Lounge = this.currentLounge();
    return await Lounge.canClaimReward(this.myAccount);
  }

  /**
   * Checks if the user is allowed to retrieve their reward from the Lounge
   * @returns true if user can withdraw reward, false if they can't
   */
  async canUserUnstakeFromLounge(): Promise<boolean> {
    const Lounge = this.currentLounge();
    const canWithdraw = await Lounge.canWithdraw(this.myAccount);
    const stakedAmount = await this.getStakedMineralOnLounge();
    const notStaked = Number(getDisplayBalance(stakedAmount, this.MINERAL.decimal)) === 0;
    const result = notStaked ? true : canWithdraw;
    return result;
  }

  async timeUntilClaimRewardFromLounge(): Promise<BigNumber> {
    // const Lounge = this.currentLounge();
    // const mason = await Lounge.masons(this.myAccount);
    return BigNumber.from(0);
  }

  async getTotalStakedInLounge(): Promise<BigNumber> {
    const Lounge = this.currentLounge();
    return await Lounge.totalSupply();
  }

  async stakeShareToLounge(amount: string): Promise<TransactionResponse> {
    if (this.isOldLoungeMember()) {
      throw new Error("you're using old trident lounge. please withdraw and deposit the MINERAL again.");
    }
    const Lounge = this.currentLounge();
    return await Lounge.stake(decimalToBalance(amount));
  }

  async getStakedMineralOnLounge(): Promise<BigNumber> {
    const Lounge = this.currentLounge();
    if (this.loungeVersionOfUser === 'v1') {
      return await Lounge.getMineralOf(this.myAccount);
    }
    return await Lounge.balanceOf(this.myAccount);
  }

  async getEarningsOnLounge(): Promise<BigNumber> {
    const Lounge = this.currentLounge();
    if (this.loungeVersionOfUser === 'v1') {
      return await Lounge.getCashEarningsOf(this.myAccount);
    }
    return await Lounge.earned(this.myAccount);
  }

  async withdrawMineralFromLounge(amount: string): Promise<TransactionResponse> {
    const Lounge = this.currentLounge();
    return await Lounge.withdraw(decimalToBalance(amount));
  }

  async collectCashFromLounge(): Promise<TransactionResponse> {
    const Lounge = this.currentLounge();
    if (this.loungeVersionOfUser === 'v1') {
      return await Lounge.claimDividends();
    }
    return await Lounge.claimReward();
  }

  async exitFromLounge(): Promise<TransactionResponse> {
    const Lounge = this.currentLounge();
    return await Lounge.exit();
  }

  async getTreasuryNextAllocationTime(): Promise<AllocationTime> {
    const { Treasury } = this.contracts;
    const nextEpochTimestamp: BigNumber = await Treasury.nextEpochPoint();
    const nextAllocation = new Date(nextEpochTimestamp.mul(1000).toNumber());
    const prevAllocation = new Date(Date.now());

    return { from: prevAllocation, to: nextAllocation };
  }
  /**
   * This method calculates and returns in a from to to format
   * the period the user needs to wait before being allowed to claim
   * their reward from the masonry
   * @returns Promise<AllocationTime>
   */
  async getUserClaimRewardTime(): Promise<AllocationTime> {
    const { Lounge, Treasury } = this.contracts;
    const nextEpochTimestamp = await Lounge.nextEpochPoint(); //in unix timestamp
    const currentEpoch = await Lounge.epoch();
    const mason = await Lounge.masons(this.myAccount);
    const startTimeEpoch = mason.epochTimerStart;
    const period = await Treasury.PERIOD();
    const periodInHours = period / 60 / 60; // 6 hours, period is displayed in seconds which is 21600
    const rewardLockupEpochs = await Lounge.rewardLockupEpochs();
    const targetEpochForClaimUnlock = Number(startTimeEpoch) + Number(rewardLockupEpochs);

    const fromDate = new Date(Date.now());
    if (targetEpochForClaimUnlock - currentEpoch <= 0) {
      return { from: fromDate, to: fromDate };
    } else if (targetEpochForClaimUnlock - currentEpoch === 1) {
      const toDate = new Date(nextEpochTimestamp * 1000);
      return { from: fromDate, to: toDate };
    } else {
      const toDate = new Date(nextEpochTimestamp * 1000);
      const delta = targetEpochForClaimUnlock - currentEpoch - 1;
      const endDate = moment(toDate)
        .add(delta * periodInHours, 'hours')
        .toDate();
      return { from: fromDate, to: endDate };
    }
  }

  /**
   * This method calculates and returns in a from to to format
   * the period the user needs to wait before being allowed to unstake
   * from the masonry
   * @returns Promise<AllocationTime>
   */
  async getUserUnstakeTime(): Promise<AllocationTime> {
    const { Lounge, Treasury } = this.contracts;
    const nextEpochTimestamp = await Lounge.nextEpochPoint();
    const currentEpoch = await Lounge.epoch();
    const mason = await Lounge.masons(this.myAccount);
    const startTimeEpoch = mason.epochTimerStart;
    const period = await Treasury.PERIOD();
    const PeriodInHours = period / 60 / 60;
    const withdrawLockupEpochs = await Lounge.withdrawLockupEpochs();
    const fromDate = new Date(Date.now());
    const targetEpochForClaimUnlock = Number(startTimeEpoch) + Number(withdrawLockupEpochs);
    const stakedAmount = await this.getStakedMineralOnLounge();
    if (currentEpoch <= targetEpochForClaimUnlock && Number(stakedAmount) === 0) {
      return { from: fromDate, to: fromDate };
    } else if (targetEpochForClaimUnlock - currentEpoch === 1) {
      const toDate = new Date(nextEpochTimestamp * 1000);
      return { from: fromDate, to: toDate };
    } else {
      const toDate = new Date(nextEpochTimestamp * 1000);
      const delta = targetEpochForClaimUnlock - Number(currentEpoch) - 1;
      const endDate = moment(toDate)
        .add(delta * PeriodInHours, 'hours')
        .toDate();
      return { from: fromDate, to: endDate };
    }
  }

  async watchAssetInMetamask(assetName: string): Promise<boolean> {
    const { ethereum } = window as any;
    if (ethereum && ethereum.networkVersion === config.chainId.toString()) {
      let asset;
      let assetUrl;
      if (assetName === 'TELO') {
        asset = this.TELO;
        assetUrl = 'https://telo.finance/presskit/telo_icon_noBG.png';
      } else if (assetName === 'MINERAL') {
        asset = this.MINERAL;
        assetUrl = 'https://telo.finance/presskit/tshare_icon_noBG.png';
      } else if (assetName === 'SCRAP') {
        asset = this.MINERAL;
        assetUrl = 'https://telo.finance/presskit/tscrap_icon_noBG.png';
      }
      await ethereum.request({
        method: 'wallet_watchAsset',
        params: {
          type: 'ERC20',
          options: {
            address: asset.address,
            symbol: asset.symbol,
            decimals: 18,
            image: assetUrl,
          },
        },
      });
    }
    return true;
  }

  async provideTeloNearLP(nearAmount: string, teloAmount: BigNumber): Promise<TransactionResponse> {
    const { TaxOffice } = this.contracts;
    let overrides = {
      value: parseUnits(nearAmount, 18),
    };
    return await TaxOffice.addLiquidityETHTaxFree(teloAmount, teloAmount.mul(992).div(1000), parseUnits(nearAmount, 18).mul(992).div(1000), overrides);
  }

  async quoteFromSpooky(tokenAmount: string, tokenName: string): Promise<string> {
    const { SpookyRouter } = this.contracts;
    const { _reserve0, _reserve1 } = await this.TELOWNEAR_LP.getReserves();
    let quote;
    if (tokenName === 'TELO') {
      quote = await SpookyRouter.quote(parseUnits(tokenAmount), _reserve1, _reserve0);
    } else {
      quote = await SpookyRouter.quote(parseUnits(tokenAmount), _reserve0, _reserve1);
    }
    return (quote / 1e18).toString();
  }

  /**
   * @returns an array of the regulation events till the most up to date epoch
   */
  async listenForRegulationsEvents(): Promise<any> {
    const { Treasury } = this.contracts;

    const treasuryDaoFundedFilter = Treasury.filters.DaoFundFunded();
    const treasuryDevFundedFilter = Treasury.filters.DevFundFunded();
    const treasuryLoungeFundedFilter = Treasury.filters.LoungeFunded();
    const boughtScrapsFilter = Treasury.filters.BoughtScraps();
    const redeemScrapsFilter = Treasury.filters.RedeemedScraps();

    let epochBlocksRanges: any[] = [];
    let masonryFundEvents = await Treasury.queryFilter(treasuryLoungeFundedFilter);
    var events: any[] = [];
    masonryFundEvents.forEach(function callback(value, index) {
      events.push({ epoch: index + 1 });
      events[index].masonryFund = getDisplayBalance(value.args[1]);
      if (index === 0) {
        epochBlocksRanges.push({
          index: index,
          startBlock: value.blockNumber,
          boughScraps: 0,
          redeemedScraps: 0,
        });
      }
      if (index > 0) {
        epochBlocksRanges.push({
          index: index,
          startBlock: value.blockNumber,
          boughScraps: 0,
          redeemedScraps: 0,
        });
        epochBlocksRanges[index - 1].endBlock = value.blockNumber;
      }
    });

    epochBlocksRanges.forEach(async (value, index) => {
      events[index].scrapsBought = await this.getScrapsWithFilterForPeriod(
        boughtScrapsFilter,
        value.startBlock,
        value.endBlock,
      );
      events[index].scrapsRedeemed = await this.getScrapsWithFilterForPeriod(
        redeemScrapsFilter,
        value.startBlock,
        value.endBlock,
      );
    });
    let DEVFundEvents = await Treasury.queryFilter(treasuryDevFundedFilter);
    DEVFundEvents.forEach(function callback(value, index) {
      events[index].devFund = getDisplayBalance(value.args[1]);
    });
    let DAOFundEvents = await Treasury.queryFilter(treasuryDaoFundedFilter);
    DAOFundEvents.forEach(function callback(value, index) {
      events[index].daoFund = getDisplayBalance(value.args[1]);
    });
    return events;
  }

  /**
   * Helper method
   * @param filter applied on the query to the treasury events
   * @param from block number
   * @param to block number
   * @returns the amount of scraps events emitted based on the filter provided during a specific period
   */
  async getScrapsWithFilterForPeriod(filter: EventFilter, from: number, to: number): Promise<number> {
    const { Treasury } = this.contracts;
    const scrapsAmount = await Treasury.queryFilter(filter, from, to);
    return scrapsAmount.length;
  }

  async estimateZapIn(tokenName: string, lpName: string, amount: string): Promise<number[]> {
    const { zapper } = this.contracts;
    const lpToken = this.externalTokens[lpName];
    let estimate;
    if (tokenName === NEAR_TICKER) {
      estimate = await zapper.estimateZapIn(lpToken.address, SPOOKY_ROUTER_ADDR, parseUnits(amount, 18));
    } else {
      const token = tokenName === TELO_TICKER ? this.TELO : this.MINERAL;
      estimate = await zapper.estimateZapInToken(
        token.address,
        lpToken.address,
        SPOOKY_ROUTER_ADDR,
        parseUnits(amount, 18),
      );
    }
    return [estimate[0] / 1e18, estimate[1] / 1e18];
  }
  async zapIn(tokenName: string, lpName: string, amount: string): Promise<TransactionResponse> {
    const { zapper } = this.contracts;
    const lpToken = this.externalTokens[lpName];
    if (tokenName === NEAR_TICKER) {
      let overrides = {
        value: parseUnits(amount, 18),
      };
      return await zapper.zapIn(lpToken.address, SPOOKY_ROUTER_ADDR, this.myAccount, overrides);
    } else {
      const token = tokenName === TELO_TICKER ? this.TELO : this.MINERAL;
      return await zapper.zapInToken(
        token.address,
        parseUnits(amount, 18),
        lpToken.address,
        SPOOKY_ROUTER_ADDR,
        this.myAccount,
      );
    }
  }
  async swapScrapToMineral(scrapAmount: BigNumber): Promise<TransactionResponse> {
    const { MineralSwapper } = this.contracts;
    return await MineralSwapper.swapScrapToMineral(scrapAmount);
  }
  async estimateAmountOfMineral(scrapAmount: string): Promise<string> {
    const { MineralSwapper } = this.contracts;
    try {
      const estimateBN = await MineralSwapper.estimateAmountOfMineral(parseUnits(scrapAmount, 18));
      return getDisplayBalance(estimateBN, 18, 6);
    } catch (err) {
      console.error(`Failed to fetch estimate mineral amount: ${err}`);
    }
  }

  async getMineralSwapperStat(address: string): Promise<MineralSwapperStat> {
    const { MineralSwapper } = this.contracts;
    const mineralBalanceBN = await MineralSwapper.getMineralBalance();
    const scrapBalanceBN = await MineralSwapper.getMineralBalance(address);
    // const teloPriceBN = await MineralSwapper.getTeloPrice();
    // const mineralPriceBN = await MineralSwapper.getMineralPrice();
    const rateMineralPerTeloBN = await MineralSwapper.getMineralAmountPerTelo();
    const mineralBalance = getDisplayBalance(mineralBalanceBN, 18, 5);
    const scrapBalance = getDisplayBalance(scrapBalanceBN, 18, 5);
    return {
      mineralBalance: mineralBalance.toString(),
      scrapBalance: scrapBalance.toString(),
      // teloPrice: teloPriceBN.toString(),
      // mineralPrice: mineralPriceBN.toString(),
      rateMineralPerTelo: rateMineralPerTeloBN.toString(),
    };
  }
}
