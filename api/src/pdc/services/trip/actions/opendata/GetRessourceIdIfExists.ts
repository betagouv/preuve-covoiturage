import { provider } from '@/ilos/common/index.ts';
import path from 'node:path';
import { Dataset } from '../../interfaces/DataGouvInterface.ts';
import { DataGouvProvider } from '../../providers/DataGouvProvider.ts';

@provider()
export class GetRessourceIdIfExists {
  constructor(private datagouv: DataGouvProvider) {}

  async call(datasetSlug: string, filepath: string): Promise<string> {
    const dataset: Dataset = await this.datagouv.getDataset(datasetSlug);
    return dataset.resources.find((r) => r.title === path.basename(filepath))?.id;
  }
}
