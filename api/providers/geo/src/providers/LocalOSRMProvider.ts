import { provider } from '@ilos/common';

import { OSRMProvider } from './OSRMProvider';

@provider()
export class LocalOSRMProvider extends OSRMProvider {
  protected domain = 'http://osrm.covoiturage.beta.gouv.fr:5000';
}
