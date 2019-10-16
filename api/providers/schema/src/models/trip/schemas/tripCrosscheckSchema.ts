import { journeyCreateSchema } from '../../journey';

/**
 * Use a good ol' technique to DEEP copy the object
 * { ...journeyCreateSchema } does a shallow copy and the patch
 * to definitions.journey.required impacts journeyCreateSchema too.
 */
const merge = JSON.parse(JSON.stringify(journeyCreateSchema));

// rename the schema
merge['$id'] = 'trip.crosscheck';

// make operator_id required
merge.required = ['journey_id', 'operator_class', 'operator_id'];

export const tripCrosscheckSchema = { ...merge };
