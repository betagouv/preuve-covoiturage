import { ConfigInterfaceResolver, ContextType, handler, NotFoundException } from '@ilos/common';
import { Action } from '@ilos/core';
import { BucketName, S3StorageProvider } from '@pdc/provider-file';
import { internalOnlyMiddlewares } from '@pdc/provider-middleware';
import { getOpenDataExportName } from '../helpers/getOpenDataExportName';
import { Dataset, Resource } from '../interfaces';
import { DataGouvProvider } from '../providers/DataGouvProvider';
import { handlerConfig, ParamsInterface, ResultInterface } from '../shared/trip/publishOpenData.contract';
import { alias } from '../shared/trip/publishOpenData.schema';
import { BuildResourceDescription } from './opendata/BuildResourceDescription';

@handler({
  ...handlerConfig,
  middlewares: [...internalOnlyMiddlewares(handlerConfig.service), ['validate', alias]],
})
export class PublishOpenDataAction extends Action {
  constructor(
    private file: S3StorageProvider,
    private config: ConfigInterfaceResolver,
    private datagouv: DataGouvProvider,
    private buildResourceDescription: BuildResourceDescription,
  ) {
    super();
  }

  public async handle(params: ParamsInterface, context: ContextType): Promise<ResultInterface> {
    try {
      const { date, publish } = params;
      const filename = getOpenDataExportName('csv', date);
      const datasetSlug = this.config.get('datagouv.datasetSlug');
      if (publish) {
        await this.ensureExportIsReachable(filename);
        const description: string = await this.buildResourceDescription.call(context.call.metadata);
        const resource = await this.createResource(filename, description);
        await this.datagouv.publishResource(datasetSlug, resource);
      } else {
        // Unused, Untested
        const dataset = await this.datagouv.getDataset(datasetSlug);
        await this.datagouv.unpublishResource(datasetSlug, this.findRidFromTitle(dataset, filename));
      }
    } catch (e) {
      throw e;
    }
  }

  protected async ensureExportIsReachable(filename: string): Promise<void> {
    const exportExist = await this.file.exists(BucketName.Export, filename);
    const publicExist = await this.file.exists(BucketName.Public, filename);

    if (!exportExist && !publicExist) {
      throw new NotFoundException(`Export ${filename} is not found`);
    }
    if (exportExist && !publicExist) {
      await this.file.copy(BucketName.Export, filename, BucketName.Public, filename);
    }
  }

  protected findRidFromTitle(dataset: Dataset, title: string): string {
    if (!dataset.resources || dataset.resources.length) {
      throw new NotFoundException(`File ${title} is not found in dataset ${dataset.slug}`);
    }
    const resource = dataset.resources.find((r) => r.title === title);
    if (!resource) {
      throw new NotFoundException(`File ${title} is not found in dataset ${dataset.slug}`);
    }
    return resource.id;
  }

  protected async createResource(filename: string, description: string): Promise<Resource> {
    return {
      filetype: 'remote',
      format: 'csv',
      title: filename,
      mime: 'text/csv',
      description: description,
      type: 'main',
      url: await this.file.getPublicUrl(BucketName.Public, filename),
    };
  }
}
