import { Aom } from './models/Aom';
import { Operator } from './models/Operator';
import { Token } from './models/Token';

import { AomSchema } from './schemas/aom';
import { OperatorSchema } from './schemas/operator';
import { ApplicationSchema } from './schemas/application';
import { TokenSchema } from './schemas/token';

import { aom } from './seeds/aom';
import { dummyAom } from './seeds/dummy-aom';
import { dummyOperator } from './seeds/dummy-operator';

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
