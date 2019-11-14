import { Operator } from '~/core/entities/operator/operator';
import { JsonRPCResponse } from '~/core/entities/api/jsonRPCResponse';

export const operatorStub: Operator = {
  _id: 1,
  name: 'Opérateur',
  legal_name: 'Opérateur SAS',
  company: {
    siren: '123456789',
    naf_entreprise: '1234A',
  },
  address: {
    street: '5 rue de brest',
    postcode: '69002',
    city: 'Lyon',
    country: 'France',
  },
  contacts: {
    gdpr_controller: {
      firstname: 'Raymond',
      lastname: 'Breton',
      email: 'raymond.breton@aom.com',
    },
    gdpr_dpo: {
      firstname: 'Michelle',
      lastname: 'Planche',
      email: 'michelle.planche@aom.com',
    },
    technical: {
      firstname: 'Albert',
      lastname: 'Marcoeur',
      email: 'albert.marcoeur@aom.com',
      phone: '0673826458',
    },
  },
};

export function stubOperatorFind() {
  cy.route({
    method: 'POST',
    url: '/rpc?methods=operator:find',
    response: (data) =>
      <JsonRPCResponse[]>[
        {
          id: 1568215196898,
          jsonrpc: '2.0',
          result: {
            data: operatorStub,
          },
        },
      ],
  });
}
