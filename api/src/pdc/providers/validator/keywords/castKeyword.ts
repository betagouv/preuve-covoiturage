import { KeywordDefinition } from '@ilos/validator';

import { dateCast } from './cast/dateCast';
import { phoneCast } from './cast/phoneCast';
import { phonetruncCast } from './cast/phonetruncCast';

const castStore = {
  date: dateCast(),
  isodate: dateCast(true),
  phone: phoneCast,
  phonetrunc: phonetruncCast,
};

export const castKeyword: KeywordDefinition = {
  keyword: 'cast',
  type: 'string',
  modifying: true,
  errors: false,
  compile:
    (castKeyword: string) =>
    (data: any, dataCtx: any): boolean => {
      if (castKeyword in castStore) {
        try {
          /**
           * The access to the parent data object and the current property name allow to create keywords
           * that modify the validated data.
           * (modifying option MUST be used in keyword definition in this case).
           */
          dataCtx.parentData[dataCtx.parentDataProperty] = castStore[castKeyword](data);
        } catch {
          return false;
        }
      }
      return true;
    },
  metaSchema: {
    type: 'string',
    enum: Reflect.ownKeys(castStore),
  },
};
