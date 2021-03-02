import { KeywordDefinition } from '@ilos/validator';

import { dateCast } from '../cast/dateCast';
import { phoneCast } from '../cast/phoneCast';
import { phonetruncCast } from '../cast/phonetruncCast';

const castStore = {
  date: dateCast,
  phone: phoneCast,
  phonetrunc: phonetruncCast,
};

export const castKeyword: KeywordDefinition = {
  keyword: 'cast',
  modifying: true,
  errors: false,
  compile: (castKeyword: string) => (data: any, dataCtx: any): boolean => {
    if (castKeyword in castStore) {
      try {
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
