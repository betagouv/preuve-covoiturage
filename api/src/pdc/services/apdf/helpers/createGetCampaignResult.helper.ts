/* eslint-disable max-len */
import faker from '@faker-js/faker';
import { PolicyStatusEnum } from '@shared/policy/common/interfaces/PolicyInterface';
import { ResultInterface as GetCampaignResultInterface } from '@shared/policy/find.contract';

export const createGetCampaignResult = (
  status: PolicyStatusEnum,
  name?: string,
  start_date?: Date,
  end_date?: Date,
  operator_siret_list?: number[],
): GetCampaignResultInterface => {
  return {
    _id: faker.datatype.number(),
    name: name ? name : faker.random.word(),
    handler: '',
    params: operator_siret_list ? { operators: operator_siret_list.map((o) => o.toString()) } : {}, // FIXME : siret number here
    description: faker.random.words(8),
    territory_id: faker.datatype.number(),
    start_date: start_date ? start_date : faker.date.past(1),
    end_date: end_date ? end_date : faker.date.future(1),
    status,
    incentive_sum: faker.datatype.number(),
  };
};
