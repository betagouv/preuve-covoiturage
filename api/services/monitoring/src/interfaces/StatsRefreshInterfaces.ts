export const CronFrequencies = ['daily', 'weekly', 'monthly'] as const;
export type CronFrequency = typeof CronFrequencies[number];
export type MatviewItem = { matviewname: string };
