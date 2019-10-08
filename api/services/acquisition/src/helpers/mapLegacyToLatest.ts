import { Journey } from '../entities/Journey';

/**
 * Convert and calculate values from legacy schema to latest
 * Delete unused properties to match JSON Schema {additionalProperties: false} rule
 */
export function mapLegacyToLatest(operatorSiret: string | null) {
  return (jrn: any): Journey => {
    // Convert passenger
    if ('passenger' in jrn) {
      jrn.passenger.contribution = jrn.passenger.cost - jrn.passenger.incentive;
      jrn.passenger.incentives = jrn.passenger.incentive
        ? [{ siret: operatorSiret, amount: jrn.passenger.incentive, index: 0 }]
        : [];

      delete jrn.passenger.cost;
      delete jrn.passenger.incentive;
      delete jrn.passenger.remaining_fee;

      jrn.passenger.start.datetime = jrn.passenger.start.datetime.toISOString();
      jrn.passenger.end.datetime = jrn.passenger.end.datetime.toISOString();
    }

    // Convert driver
    if ('driver' in jrn) {
      jrn.driver.expense = jrn.driver.revenue - jrn.driver.incentive;
      jrn.driver.incentives = jrn.driver.incentive
        ? [{ siret: operatorSiret, amount: jrn.driver.incentive, index: 0 }]
        : [];

      delete jrn.driver.cost;
      delete jrn.driver.incentive;
      delete jrn.driver.remaining_fee;

      jrn.driver.start.datetime = jrn.driver.start.datetime.toISOString();
      jrn.driver.end.datetime = jrn.driver.end.datetime.toISOString();
    }

    return jrn;
  };
}
