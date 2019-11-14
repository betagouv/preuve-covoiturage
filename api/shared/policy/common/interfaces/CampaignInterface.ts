interface RuleInterface {
  slug: string;
  description?: string;
  parameters?: any;
  schema?: { [k: string]: any };

  formula?: string;
  index?: number;
}

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
