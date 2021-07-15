import { ContextType, handler } from '@ilos/common';
import { Action } from '@ilos/core';
import { internalOnlyMiddlewares } from '@pdc/provider-middleware';
import { handlerConfig, ParamsInterface, ResultInterface } from '../shared/trip/buildExcelExport.contract';
import { alias } from '../shared/trip/buildExport.schema';

@handler({
  ...handlerConfig,
})
export class BuildExcelExportAction extends Action {
  public async handle(params: ParamsInterface, context: ContextType): Promise<ResultInterface> {
  }
}