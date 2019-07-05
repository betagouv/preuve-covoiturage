import { journey } from './journey';
import { Person, Trip } from '../../src/entities/Trip';

export const trip = <Trip>{
  territory: [journey.passenger.start.territory[0], journey.passenger.end.territory[0]],
  status: 'pending',
  start: journey.driver.start.datetime,
  people: [
    {
      ...journey.passenger,
      operator_journey_id: journey.operator_journey_id,
      journey_id: journey.journey_id,
      class: 'A',
      operator_class: journey.operator_class,
      operator_id: journey.operator_id,
      is_driver: false,
    },
    {
      ...journey.driver,
      operator_journey_id: journey.operator_journey_id,
      journey_id: journey.journey_id,
      class: 'A',
      operator_class: journey.operator_class,
      operator_id: journey.operator_id,
      is_driver: true,
    },
  ],
};
