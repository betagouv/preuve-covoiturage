import { StaticAbstractDataset, StaticMigrable } from '@betagouvpdc/evolution-geo';
import { CreateAiresCovoiturageTable } from './datastructures/CreateAiresCovoiturageTable';
import { getAiresLastUrl } from './helper';
import { AiresCovoiturage } from './datasets/AiresCovoiturage';

export const datastructures: Set<StaticMigrable> = new Set([
  CreateAiresCovoiturageTable
]);

export const datasets = () => {
  const datasets: Set<StaticAbstractDataset> = new Set([]);
  // add Aires migration
  const lastAiresDataset =  async () => { 
    const AiresUrl = 'https://transport.data.gouv.fr/api/datasets/5d6eaffc8b4c417cdc452ac3';
    const url = await getAiresLastUrl(AiresUrl)
    datasets.add(AiresCovoiturage(2023, url));
  };
  lastAiresDataset();
  return datasets;
}