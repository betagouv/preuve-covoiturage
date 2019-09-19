export interface RetributionRuleInterface {
  slug: string;
  description?: string;
  parameters?: any;
  schema?: { [k: string]: any };

  formula?: string;
  index?: number;
}
