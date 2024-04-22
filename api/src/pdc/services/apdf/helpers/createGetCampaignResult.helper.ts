/* eslint-disable max-len */
import { faker } from '@faker-js/faker';
import { PolicyStatusEnum } from '@shared/policy/common/interfaces/PolicyInterface';
import { ResultInterface as GetCampaignResultInterface } from '@shared/policy/find.contract';

export const createGetCampaignResult = (
  status: PolicyStatusEnum,
  name?: string,
  start_date?: Date,
  end_date?: Date,
  operator_uuid_list?: number[],
): GetCampaignResultInterface => {
  return {
    _id: faker.number.int(),
    name: name ? name : faker.word.noun(),
    handler: '',
    params: operator_uuid_list ? { operators: operator_uuid_list.map((o) => o.toString()) } : {}, // FIXME : siret number here
    description: faker.lorem.text(),
    territory_id: faker.number.int(),
    start_date: start_date ? start_date : faker.date.past({ years: 1 }),
    end_date: end_date ? end_date : faker.date.future({ years: 1 }),
    status,
    incentive_sum: faker.number.int(),
  };
};
