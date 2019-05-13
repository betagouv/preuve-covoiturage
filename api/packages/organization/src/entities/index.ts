import * as Aom from './models/Aom';
import * as Operator from './models/Operator';
import * as Token from './models/Token';

import * as AomSchema from './schemas/aom';
import * as OperatorSchema from './schemas/operator';
import * as ApplicationSchema from './schemas/application';
import * as TokenSchema from './schemas/token';

import * as aom from './seeds/aom';
import * as dummyAom from './seeds/dummy-aom';
import * as dummyOperator from './seeds/dummy-operator';

export const models = {
  Aom,
  Operator,
  Token,
};

export const schemas = {
  AomSchema,
  OperatorSchema,
  ApplicationSchema,
  TokenSchema,
};

export const seeds = {
  aom,
  dummyAom,
  dummyOperator,
};
