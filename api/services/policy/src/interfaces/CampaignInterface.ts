import { RuleInterface } from '../engine/interfaces/RuleInterface';

export interface CampaignInterface {
  _id?: number;
  parent_id?: number;
  ui_status?: any;
  territory_id: number;
  name: string;
  description: string;
  start_date: Date;
  end_date: Date;
  unit: string;
  status: string;
  global_rules: RuleInterface[];
  rules: RuleInterface[][];
}

export interface CampaignStateInterface {
  amount: number;
  trip_subsidized: number;
  trip_excluded: number;
}
