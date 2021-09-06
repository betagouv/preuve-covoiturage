import faker from 'faker';
import { RuleInterface } from '../shared/common/interfaces/RuleInterface';
import { ResultInterface as GetCampaignResultInterface } from '../shared/policy/find.contract';

export const createGetCampaignResultInterface = (
  status: string,
  name?: string,
  start_date?: Date,
  end_date?: Date,
  operator_ids?: number[],
): GetCampaignResultInterface => {
  const defaults: GetCampaignResultInterface = {
    _id: faker.random.number(),
    name: name ? name : faker.random.word(),
    unit: '',
    description: faker.random.words(8),
    rules: [],
    global_rules: [],
    territory_id: faker.random.number(),
    start_date: start_date ? start_date : faker.date.past(1),
    end_date: end_date ? end_date : faker.date.future(1),
    status,
    state: {
      amount: faker.random.number(),
      trip_excluded: faker.random.number(),
      trip_subsidized: faker.random.number(),
    },
  };

  let operator_ids__global_rules_slugs: RuleInterface[];
  if (operator_ids && operator_ids.length > 0) {
    operator_ids__global_rules_slugs = [{ slug: 'operator_whitelist_filter', parameters: operator_ids }];
  }

  return {
    ...defaults,
    start_date,
    end_date,
    name,
    global_rules: operator_ids__global_rules_slugs ? operator_ids__global_rules_slugs : [],
  };
};
