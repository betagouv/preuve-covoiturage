import { ContextType, KernelInterface } from '@ilos/common';
import { IdentityIdentifiersInterface } from '../shared/certificate/common/interfaces/IdentityIdentifiersInterface';

export interface ParamsInterface {
  identity: IdentityIdentifiersInterface;
  operator_id: number;
  context?: ContextType;
}

export type ResultsInterface = string;

export interface FindPersonInterface {
  (params: ParamsInterface): Promise<ResultsInterface>;
}

export const findPerson = (kernel: KernelInterface): FindPersonInterface =>
  async function findPerson(params: ParamsInterface): Promise<ResultsInterface> {
    const { identity, operator_id } = params;

    return kernel.call(
      'carpool:finduuid',
      { identity, operator_id },
      {
        channel: { service: 'certificate' },
        call: { user: {} },
      },
    );
  };
