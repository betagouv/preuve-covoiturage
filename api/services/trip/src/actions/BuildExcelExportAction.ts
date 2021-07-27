import { ContextType, handler, KernelInterfaceResolver } from '@ilos/common';
import { Action } from '@ilos/core';
import { handlerConfig, ParamsInterface, ResultInterface } from '../shared/trip/buildExcelExport.contract';

@handler({
  ...handlerConfig,
})
export class BuildExcelExportAction extends Action {

  constructor(private kernel: KernelInterfaceResolver) {
    super();
  }

  public async handle(params: ParamsInterface, context: ContextType): Promise<ResultInterface> {
    
  }
}