declare function env(key: string, fallback?: string): any;

export const collectionName = env('APP_JOURNEY_DB', 'journeys');
export const db = env('APP_MONGO_DB');
export const costByKm = 0.558;

// 0: no time limit
// default: 5 days
export const timeLimit = env('APP_ACQUISITION_TIMELIMIT', '5');
