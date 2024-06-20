import { search } from './common/schemas/search.ts';

export const alias = 'trip.list';
export const schema = search;
export const binding = [alias, schema];
