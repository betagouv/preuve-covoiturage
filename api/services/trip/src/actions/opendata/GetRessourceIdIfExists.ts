import { provider } from '@ilos/common';
import path from 'path';
import { Dataset } from '../../interfaces/DataGouvInterface';
import { DataGouvProvider } from '../../providers/DataGouvProvider';

@provider()
export class GetRessourceIdIfExists {
  constructor(private datagouv: DataGouvProvider) {}

  async call(datasetSlug: string, filepath: string): Promise<string> {
    const dataset: Dataset = await this.datagouv.getDataset(datasetSlug);
    return dataset.resources.find((r) => r.title === path.basename(filepath))?.id;
  }
}
