import { provider } from "@/ilos/common/index.ts";
import { basename } from "@/lib/path/index.ts";
import { Dataset } from "../../interfaces/DataGouvInterface.ts";
import { DataGouvProvider } from "../../providers/DataGouvProvider.ts";

@provider()
export class GetRessourceIdIfExists {
  constructor(private datagouv: DataGouvProvider) {}

  async call(datasetSlug: string, filepath: string): Promise<string> {
    const dataset: Dataset = await this.datagouv.getDataset(datasetSlug);
    return dataset.resources.find((r) => r.title === basename(filepath))
      ?.id;
  }
}
