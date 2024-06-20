import { CampaignReducedStats } from './CampaignReducedStats.ts';
import { RuleInterface } from './RuleInterface.ts';

export interface CampaignInterface {
  _id?: number;
  parent_id?: number;
  ui_status?: any;
  territory_id: number;
  name: string;
  description: string;
  start_date: Date;
  state?: CampaignReducedStats;
  end_date: Date;
  unit: string;
  status: string;
  global_rules: RuleInterface[];
  rules: RuleInterface[][];
}
