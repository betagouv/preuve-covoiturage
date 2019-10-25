import { search } from './common/schemas/search';

export const alias = 'trip.list';
export const schema = search;
export const binding = [alias, schema];
