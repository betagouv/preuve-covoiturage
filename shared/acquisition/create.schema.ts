import { createJourneySchemaV2 } from './common/schemas/createJourneySchemaV2';
import { createJourneySchemaV3 } from './common/schemas/createJourneySchemaV3';

export const v2alias = 'journey.create.v2';
export const v3alias = 'journey.create.v3';

export const v2binding = [v2alias, createJourneySchemaV2];
export const v3binding = [v3alias, createJourneySchemaV3];
