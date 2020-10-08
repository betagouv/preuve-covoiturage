import { schema } from './common/schema';

export const alias = 'territory.update';
export const update = schema(alias, { _id: { macro: 'serial' } });
