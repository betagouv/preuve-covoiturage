import { search } from './common/schemas/search.ts';

export const alias = 'trip.searchcount';
export const schema = search;
export const binding = [alias, schema];
