import { TokenStat } from '../../telo-finance/types';

export interface OverviewData {
  cash?: TokenStat;
  bond?: TokenStat;
  share?: TokenStat;
}
