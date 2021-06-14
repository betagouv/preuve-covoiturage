import { publicStats } from './common/schemas/search';

export const alias = 'trip.publicStats';
export const schema = publicStats;
export const binding = [alias, schema];
