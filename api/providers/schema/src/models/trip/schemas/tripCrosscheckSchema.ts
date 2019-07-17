import { journeyCreateSchema } from '../../journey';

const merge = { ...journeyCreateSchema };

// rename the schema
merge['$id'] = 'trip.crosscheck';

// make operator_id required
merge.required = ['journey_id', 'operator_class', 'operator_id'];

export const tripCrosscheckSchema = { ...merge };
