import { createSign } from 'crypto';
import { ConfigInterfaceResolver, ContextType, handler } from '@ilos/common';
import { Action as AbstractAction, env } from '@ilos/core';

import { handlerConfig, ParamsInterface, ResultInterface } from '../shared/cee/registerApplication.contract';

import { alias } from '../shared/cee/registerApplication.schema';

import {
  ApplicationCooldownConstraint,
  CeeJourneyTypeEnum,
  CeeRepositoryProviderInterfaceResolver,
  RegisteredCeeApplication,
  TimeRangeConstraint,
  ValidJourneyConstraint,
} from '../interfaces';
import { ServiceDisabledError } from '../errors/ServiceDisabledError';
import { getOperatorIdOrFail } from '../helpers/getOperatorIdOrFail';
import { getDateOrFail } from '../helpers/getDateOrFail';
import { timestampSchema } from '../shared/cee/common/ceeSchema';
import { isBeforeOrFail, isBetweenOrFail } from '../helpers/isBeforeOrFail';
import { ConflictException } from '@ilos/common';
import {
  CeeLongApplicationInterface,
  CeeShortApplicationInterface,
} from '../shared/cee/common/CeeApplicationInterface';

@handler({
  ...handlerConfig,
  middlewares: [['validate', alias]],
})
export class RegisterCeeAction extends AbstractAction {
  readonly timeConstraint: TimeRangeConstraint;
  readonly cooldownConstraint: ApplicationCooldownConstraint;
  readonly validJourneyConstraint: ValidJourneyConstraint;
  constructor(
    protected ceeRepository: CeeRepositoryProviderInterfaceResolver,
    protected config: ConfigInterfaceResolver,
  ) {
    super();

    this.timeConstraint = this.config.get('rules.timeRangeConstraint');
    this.cooldownConstraint = this.config.get('rules.applicationCooldownConstraint');
    this.validJourneyConstraint = this.config.get('rules.validJourneyConstraint');
  }

  public async handle(params: ParamsInterface, context: ContextType): Promise<ResultInterface> {
    if (!!env('APP_DISABLE_CEE_REGISTER', false)) {
      throw new ServiceDisabledError();
    }

    const operator_id = getOperatorIdOrFail(context);

    switch (params.journey_type) {
      case CeeJourneyTypeEnum.Short:
        return this.processForShortApplication(operator_id, params);
      case CeeJourneyTypeEnum.Long:
        return this.proceesForLongApplication(operator_id, params);
    }
  }

  protected async processForShortApplication(
    operator_id: number,
    params: CeeShortApplicationInterface,
  ): Promise<ResultInterface> {
    const carpoolData = await this.ceeRepository.searchForValidJourney(
      { operator_id, operator_journey_id: params.operator_journey_id },
      this.validJourneyConstraint,
    );
    isBeforeOrFail(carpoolData.datetime, this.timeConstraint.short);
    try {
      if (carpoolData.already_registered) {
        throw new ConflictException();
      }
      const application = await this.ceeRepository.registerShortApplication(
        { ...params, ...carpoolData, operator_id },
        this.cooldownConstraint,
      );
      return {
        uuid: application.uuid,
        datetime: carpoolData.datetime.toISOString(),
        token: await this.sign(application),
        journey_id: carpoolData.acquisition_id,
        status: carpoolData.status,
      };
    } catch (e) {
      if (e instanceof ConflictException) {
        const search = {
          last_name_trunc: params.last_name_trunc,
          phone_trunc: carpoolData.phone_trunc,
          driving_license: params.driving_license,
        };
        const old = await this.ceeRepository.searchForShortApplication(search, this.cooldownConstraint);
        if (!old) {
          // Server error
          throw new Error('Boum');
        } else {
          throw new ConflictException({
            uuid: operator_id === old.operator_id ? old._id : undefined,
            datetime: old.datetime.toISOString(),
          });
        }
      }
      throw e;
    }
  }

  protected async proceesForLongApplication(
    operator_id: number,
    params: CeeLongApplicationInterface,
  ): Promise<ResultInterface> {
    const datetime = getDateOrFail(params.datetime, `data/datetime ${timestampSchema.errorMessage}`);
    isBeforeOrFail(datetime, this.timeConstraint.long);
    isBetweenOrFail(datetime, this.validJourneyConstraint.start_date, this.validJourneyConstraint.end_date);
    try {
      const application = await this.ceeRepository.registerLongApplication(
        { ...params, datetime, operator_id },
        this.cooldownConstraint,
      );
      return {
        uuid: application.uuid,
        datetime: datetime.toISOString(),
        token: await this.sign(application),
      };
    } catch (e) {
      if (e instanceof ConflictException) {
        const search = {
          last_name_trunc: params.last_name_trunc,
          phone_trunc: params.phone_trunc,
          driving_license: params.driving_license,
        };
        const old = await this.ceeRepository.searchForLongApplication(search, this.cooldownConstraint);
        if (!old) {
          // Server error
          throw new Error('Boum');
        } else {
          throw new ConflictException({
            uuid: operator_id === old.operator_id ? old._id : undefined,
            datetime: old.datetime.toISOString(),
          });
        }
      }
      throw e;
    }
  }
  public async sign(application: RegisteredCeeApplication): Promise<string> {
    const private_key = this.config.get('signature.private_key');
    const signer = createSign('RSA-SHA512');
    const data = [
      application.operator_siret.toString(),
      application.journey_type.toString(),
      application.driving_license,
      application.datetime.toISOString(),
    ].join('/');
    signer.write(data);
    signer.end();
    return signer.sign(private_key, 'base64');
  }
}
