import { StaticAbstractDataset, StaticMigrable } from '@betagouvpdc/evolution-geo';
import { CreateAiresCovoiturageTable } from './datastructures/CreateAiresCovoiturageTable';
import { getAiresLastUrl } from './helpers';
import { AiresCovoiturage } from './datasets/AiresCovoiturage';

export const datastructures: Set<StaticMigrable> = new Set([CreateAiresCovoiturageTable]);

export const datasets = async () => {
  // add Aires migration
  const AiresUrl = 'https://transport.data.gouv.fr/api/datasets/5d6eaffc8b4c417cdc452ac3';
  const url = await getAiresLastUrl(AiresUrl);
  const datasets: Set<StaticAbstractDataset> = new Set([]);
  datasets.add(AiresCovoiturage(url));
  return datasets;
};