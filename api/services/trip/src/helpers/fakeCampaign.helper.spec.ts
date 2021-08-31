import faker from 'faker';
import { ResultInterface as GetCampaignResultInterface } from '../shared/policy/find.contract';

export const createGetCampaignResultInterface = (
  status: string,
  name?: string,
  start_date?: Date,
  end_date?: Date,
): GetCampaignResultInterface => {
  return {
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
};
