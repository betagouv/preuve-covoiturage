import { UserGroupEnum } from '../../../src/app/core/enums/user/user-group.enum';
import { TripStatusEnum } from '../../../src/app/core/enums/trip/trip-status.enum';
import { TripRankEnum } from '../../../src/app/core/enums/trip/trip-rank.enum';

import { campaignStubs } from '../stubs/campaign/campaign.list';
import { operatorStubs } from '../stubs/operator/operator.list';
import { cypress_logging_users } from '../stubs/auth/login';

import { Address, Company, Territory } from '../../../src/app/core/entities/territory/territory';
import { territoryStub } from '../stubs/territory/territory.find';

export const expectedPatchedTerritory: Territory = {
  _id: territoryStub._id,
  name: 'AOM 1',
  acronym: 'Aom 1 acronym ',
  shortname: 'AOM 1 shortname',
  company: new Company({
    siren: '123456789',
    naf_entreprise: '1234A',
  }),
  address: new Address({
    street: '5 rue de brest',
    postcode: '69002',
    city: 'Lyon',
    country: 'France',
  }),
  contacts: {
    gdpr_controller: {
      firstname: 'Raymond',
      lastname: 'Breton',
      email: 'raymond.breton@aom.com',
    },
    gdpr_dpo: {
      firstname: 'André',
      lastname: 'Jacques',
      email: 'andre@aom.com',
    },
    technical: {
      firstname: 'Albert',
      lastname: 'Marcoeur',
      email: 'albert.marcoeur@aom.com',
      phone: '0673826458',
    },
  },
};
