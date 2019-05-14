import { aomService } from './aomService';
import { operatorService } from './operatorService';
import { applicationService } from './applicationService';
import { aomHttp } from './transports/aomHttp';
import { operatorHttp } from './transports/operatorHttp';
import { applicationHttp } from './transports/applicationHttp';
import * as entities from './entities';

const transports = {
  aomHttp,
  operatorHttp,
  applicationHttp,
};

export { aomService };
export { operatorService };
export { applicationService };
export { transports };
export { entities };
