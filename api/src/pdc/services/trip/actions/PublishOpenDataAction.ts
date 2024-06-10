import {
  ConfigInterfaceResolver,
  ContextType,
  handler,
} from "@/ilos/common/index.ts";
import { Action } from "@/ilos/core/index.ts";
import { internalOnlyMiddlewares } from "@/pdc/providers/middleware/index.ts";
import { UploadedResource } from "../interfaces/index.ts";
import { DataGouvProvider } from "../providers/DataGouvProvider.ts";
import {
  handlerConfig,
  ParamsInterface,
  ResultInterface,
} from "@/shared/trip/publishOpenData.contract.ts";
import { alias } from "@/shared/trip/publishOpenData.schema.ts";
import { BuildResourceDescription } from "./opendata/BuildResourceDescription.ts";
import { GetRessourceIdIfExists } from "./opendata/GetRessourceIdIfExists.ts";

@handler({
  ...handlerConfig,
  middlewares: [...internalOnlyMiddlewares(handlerConfig.service), [
    "validate",
    alias,
  ]],
})
export class PublishOpenDataAction extends Action {
  constructor(
    private config: ConfigInterfaceResolver,
    private datagouv: DataGouvProvider,
    private buildResourceDescription: BuildResourceDescription,
    private getRessourceIdIfExists: GetRessourceIdIfExists,
  ) {
    super();
  }

  public async handle(
    params: ParamsInterface,
    context: ContextType,
  ): Promise<ResultInterface> {
    const { filepath, tripSearchQueryParam, excludedTerritories } = params;
    const datasetSlug = this.config.get("datagouv.datasetSlug");
    const description: string = await this.buildResourceDescription.call(
      tripSearchQueryParam,
      excludedTerritories,
    );
    const existingResourceId: string = await this.getRessourceIdIfExists.call(
      datasetSlug,
      filepath,
    );
    let uploadResource: UploadedResource = null;
    if (existingResourceId) {
      uploadResource = await this.datagouv.updateDatasetResource(
        datasetSlug,
        filepath,
        existingResourceId,
      );
    } else {
      uploadResource = await this.datagouv.uploadDatasetResource(
        datasetSlug,
        filepath,
      );
    }
    await this.datagouv.updateResource(datasetSlug, {
      ...uploadResource,
      description,
    });
  }
}
