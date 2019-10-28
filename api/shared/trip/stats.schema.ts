import { search } from './common/schemas/search';

export const alias = 'trip.stats';
export const schema = search;
export const binding = [alias, schema];
