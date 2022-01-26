import { ConfigInterfaceResolver, provider } from '@ilos/common';
import { DataGouvProvider } from '../../providers/DataGouvProvider';
import path from 'path';
import { Dataset } from '../../interfaces/DataGouvInterface';

@provider()
export class GetRessourceIdIfExists {
  constructor(private datagouv: DataGouvProvider, private config: ConfigInterfaceResolver) {}

  async call(filepath: string): Promise<string> {
    const datasetSlug = this.config.get('datagouv.datasetSlug');
    const dataset: Dataset = await this.datagouv.getDataset(datasetSlug);
    return dataset.resources.find((r) => r.title === path.basename(filepath))?.id;
  }
}
