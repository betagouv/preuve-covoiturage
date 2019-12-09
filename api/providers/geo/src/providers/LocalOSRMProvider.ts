import { OSRMProvider } from './OSRMProvider';

export class LocalOSRMProvider extends OSRMProvider {
  protected domain = 'http://osrm.covoiturage.beta.gouv.fr:5000';
}
