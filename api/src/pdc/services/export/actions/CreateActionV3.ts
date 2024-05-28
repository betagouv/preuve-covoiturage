import { ContextType, handler } from '@ilos/common';
import { Action as AbstractAction } from '@ilos/core';
import {
  castToArrayMiddleware,
  copyFromContextMiddleware,
  hasPermissionMiddleware,
  validateDateMiddleware,
} from '@pdc/providers/middleware';
import { ParamsInterfaceV3, ResultInterfaceV3, handlerConfigV3 } from '@shared/export/create.contract';
import { aliasV3 } from '@shared/export/create.schema';
import { maxEndDefault, minStartDefault } from '../config/export';
import { DefaultTimezoneMiddleware } from '../middlewares/DefaultTimezoneMiddleware';
import { Export } from '../models/Export';
import { ExportParams } from '../models/ExportParams';
import { ExportRecipient } from '../models/ExportRecipient';
import { ExportRepositoryInterfaceResolver } from '../repositories/ExportRepository';
import { RecipientServiceInterfaceResolver } from '../services/RecipientService';
import { TerritoryServiceInterfaceResolver } from '../services/TerritoryService';

@handler({
  ...handlerConfigV3,
  middlewares: [
    hasPermissionMiddleware('common.export.create'),
    castToArrayMiddleware(['operator_id', 'territory_id', 'recipients']),
    ['timezone', DefaultTimezoneMiddleware],
    copyFromContextMiddleware(`call.user._id`, 'created_by', true),
    copyFromContextMiddleware(`call.user.operator_id`, 'operator_id', true),
    copyFromContextMiddleware(`call.user.territory_id`, 'territory_id', true),
    validateDateMiddleware({
      startPath: 'start_at',
      endPath: 'end_at',
      minStart: () => new Date(new Date().getTime() - minStartDefault),
      maxEnd: () => new Date(new Date().getTime() - maxEndDefault),
    }),
    ['validate', aliasV3],
  ],
})
export class CreateActionV3 extends AbstractAction {
  constructor(
    protected exportRepository: ExportRepositoryInterfaceResolver,
    protected territoryService: TerritoryServiceInterfaceResolver,
    protected recipientService: RecipientServiceInterfaceResolver,
  ) {
    super();
  }

  protected async handle(params: ParamsInterfaceV3, context: ContextType): Promise<ResultInterfaceV3> {
    const paramTarget = Export.target(context);

    // make sure we have at least one recipient
    const emails = await this.recipientService.maybeAddCreator(
      (params.recipients || []).map(ExportRecipient.fromEmail),
      params.created_by,
    );
    if (!emails.length) {
      console.error('No recipient found! You must set "created_by" or "recipients"');
      return;
    }

    // Create the export request
    const {
      uuid,
      target,
      status,
      params: createParams,
    } = await this.exportRepository.create({
      created_by: params.created_by,
      target: paramTarget,
      recipients: emails,
      params: new ExportParams({
        tz: params.tz,
        start_at: params.start_at,
        end_at: params.end_at,
        operator_id: params.operator_id,
        geo_selector: params.geo_selector,
      }),
    });

    return {
      uuid,
      target,
      status,
      start_at: createParams.get().start_at,
      end_at: createParams.get().end_at,
    };
  }
}
