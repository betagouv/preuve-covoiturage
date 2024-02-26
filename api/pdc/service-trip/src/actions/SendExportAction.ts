import { internalOnlyMiddlewares } from '@pdc/provider-middleware';
import { Action } from '@ilos/core';
import { handler, ContextType, KernelInterfaceResolver } from '@ilos/common';
import { BucketName, S3StorageProvider } from '@pdc/provider-storage';

import { handlerConfig, ParamsInterface, ResultInterface } from '../shared/trip/sendExport.contract';
import { alias } from '../shared/trip/sendExport.schema';
import { signature as notifySignature, ParamsInterface as NotifyParamsInterface } from '../shared/user/notify.contract';
import {
  signature as buildExportSignature,
  ParamsInterface as BuildExportParamsInterface,
} from '../shared/trip/buildExport.contract';

@handler({
  ...handlerConfig,
  middlewares: [...internalOnlyMiddlewares(handlerConfig.service), ['validate', alias]],
})
export class SendExportAction extends Action {
  protected defaultContext: ContextType = {
    channel: {
      service: 'trip',
    },
    call: {
      user: {},
    },
  };

  constructor(
    private file: S3StorageProvider,
    private kernel: KernelInterfaceResolver,
  ) {
    super();
  }

  public async handle(params: ParamsInterface, context: ContextType): Promise<ResultInterface> {
    try {
      const { from, ...exportParams } = params;
      const fileKey = await this.kernel.call<BuildExportParamsInterface>(
        buildExportSignature,
        JSON.parse(JSON.stringify(exportParams)),
        this.defaultContext,
      );
      const url = await this.file.getSignedUrl(BucketName.Export, fileKey);

      const email = from.email;
      const fullname = from.fullname;

      const emailParams = {
        template: 'ExportCSVNotification',
        to: `${fullname} <${email}>`,
        data: {
          fullname,
          action_href: url,
        },
      };

      await this.kernel.notify<NotifyParamsInterface>(notifySignature, emailParams, {
        channel: {
          service: 'trip',
        },
        call: {
          user: {},
        },
      });

      return;
    } catch (e) {
      await this.kernel.notify<NotifyParamsInterface>(
        notifySignature,
        {
          template: 'ExportCSVErrorNotification',
          to: `${params.from.fullname} <${params.from.email}>`,
          data: {
            fullname: params.from.fullname,
          },
        },
        this.defaultContext,
      );

      throw e;
    }
  }
}
