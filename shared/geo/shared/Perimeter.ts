export const perimeterTypes = ['com', 'epci', 'aom', 'dep', 'reg', 'country'] as const;
export type PerimeterType = (typeof perimeterTypes)[number];
export type PerimeterLabel = string;

export type INSEECode = string;

export const indicTypes = ['journeys', 'trips', 'has_incentive', 'occupation_rate'] as const;
export type IndicType = (typeof indicTypes)[number];

export const directionTypes = ['from', 'to'] as const;
export type Direction = (typeof directionTypes)[number];
