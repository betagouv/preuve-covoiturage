import { JourneyInterface } from '../shared/common/interfaces/JourneyInterface';

/**
 * Convert and calculate values from legacy schema to latest
 * Delete unused properties to match JSON Schema {additionalProperties: false} rule
 */
export function mapLegacyToLatest(operatorSiret: string | null) {
  return (jrn: any): JourneyInterface => {
    /**
     * Convert passenger
     *
     * Version 1 {
     *    cost: number
     *    contribution: number
     *    travel_pass: {
     *      name: string
     *      user_id: string
     *    }
     *  }
     */
    if ('passenger' in jrn) {
      jrn.passenger.incentives = jrn.passenger.incentive
        ? [{ siret: operatorSiret, amount: jrn.passenger.incentive, index: 0 }]
        : [];

      delete jrn.passenger.cost;
      delete jrn.passenger.incentive;
      delete jrn.passenger.remaining_fee;

      // move travel_pass to identity
      if ('travel_pass' in jrn.passenger) {
        jrn.passenger.identity.travel_pass = jrn.passenger.travel_pass;
        delete jrn.passenger.travel_pass;
      }

      jrn.passenger.start.datetime = jrn.passenger.start.datetime.toISOString();
      jrn.passenger.end.datetime = jrn.passenger.end.datetime.toISOString();
    }

    /**
     * Convert driver
     *
     * Version 1 {
     *    cost: number
     *    revenue: number
     *  }
     */
    if ('driver' in jrn) {
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
