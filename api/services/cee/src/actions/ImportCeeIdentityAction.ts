import { ContextType, handler } from '@ilos/common';
import { Action as AbstractAction, env } from '@ilos/core';

import { handlerConfig, ParamsInterface, ResultInterface } from '../shared/cee/importApplicationIdentity.contract';

import { alias } from '../shared/cee/importApplicationIdentity.schema';

import { CeeRepositoryProviderInterfaceResolver } from '../interfaces';
import { ServiceDisabledError } from '../errors/ServiceDisabledError';
import { getOperatorIdOrFail } from '../helpers/getOperatorIdOrFail';
import { getDateOrFail } from '../helpers/getDateOrFail';
import { timestampSchema } from '../shared/cee/common/ceeSchema';
import {
  CeeImportSpecificApplicationIdentityInterface,
  CeeImportStandardizedApplicationIdentityInterface,
} from '../shared/cee/common/CeeApplicationInterface';

@handler({
  ...handlerConfig,
  middlewares: [['validate', alias]],
})
export class ImportCeeIdentityAction extends AbstractAction {
  constructor(protected ceeRepository: CeeRepositoryProviderInterfaceResolver) {
    super();
  }

  public async handle(params: ParamsInterface, context: ContextType): Promise<ResultInterface> {
    if (env.or_false(APP_DISABLE_CEE_IMPORT_IDENTITY)) {
      throw new ServiceDisabledError();
    }

    const operator_id = getOperatorIdOrFail(context);

    const result: ResultInterface = {
      imported: 0,
      failed: 0,
      failed_details: [],
    };

    const specificData = params
      .filter((p) => p.cee_application_type === 'specific' && !('cee_application_uuid' in p) && 'phone_trunc' in p)
      .map((d: CeeImportSpecificApplicationIdentityInterface, i) => ({
        ...d,
        operator_id,
        datetime: getDateOrFail(d.datetime, `data/${i}/datetime ${timestampSchema.errorMessage}`),
        application_timestamp: getDateOrFail(d.datetime, `data/${i}/datetime ${timestampSchema.errorMessage}`),
      }));

    for (const application of specificData) {
      try {
        await this.ceeRepository.importSpecificApplicationIdentity(application);
        result.imported += 1;
      } catch (e) {
        result.failed += 1;
        result.failed_details.push({ ...application, error: e.message });
      }
    }

    const standardizedData = params.filter(
      (p) => p.cee_application_type === 'standardized' || 'cee_application_uuid' in p,
    );

    for (const {
      cee_application_uuid,
      identity_key,
    } of standardizedData as Array<CeeImportStandardizedApplicationIdentityInterface>) {
      const application = { operator_id, cee_application_uuid, identity_key };
      try {
        await this.ceeRepository.importStandardizedApplicationIdentity(application);
        result.imported += 1;
      } catch (e) {
        result.failed += 1;
        result.failed_details.push({ ...application, cee_application_type: 'standardized', error: e.message });
      }
    }

    return result;
  }
}
