import * as aomService from './aomService';
import * as operatorService from './operatorService';
import * as applicationService from './applicationService';
import * as aomHttp from './transports/aomHttp';
import * as operatorHttp from './transports/operatorHttp';
import * as applicationHttp from './transports/applicationHttp';
import * as entities from './entities';

const transports = {
  aomHttp,
  operatorHttp,
  applicationHttp,
};

export {
  aomService,
  operatorService,
  applicationService,
  transports,
  entities,
};
