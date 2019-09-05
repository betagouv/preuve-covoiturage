export type chartType = 'cumulated' | 'monthly' | 'daily';

export type chartsType = { [key in chartType]?: any };
