import { stats } from './common/schemas/search';

export const alias = 'trip.stats';
export const schema = stats;
export const binding = [alias, schema];
