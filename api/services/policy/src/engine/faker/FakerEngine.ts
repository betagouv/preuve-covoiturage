import { AbstractVariant } from './AbstractVariant';
import { PersonInterface } from '../../shared/policy/common/interfaces/PersonInterface';

/**
- start/end > si InseeFilter (TerritoryFilter)

!!! nombre de personne dans un trajet [1-7] !!!
- 80% 2
- 15% 3
- 5% 4+
*/

export class FakerEngine {
  constructor(protected readonly variants: AbstractVariant<any>[]) {}

  public static getBasicPerson(is_driver = false): PersonInterface {
    return {
      is_driver,
      datetime: new Date(),
      carpool_id: 1,
      identity_uuid: 'no one',
      is_over_18: true,
      has_travel_pass: false,
      operator_id: 1,
      operator_class: 'C',
      start_insee: '91377',
      end_insee: '91377',
      seats: 1,
      duration: 600,
      distance: 5000,
      cost: 2,
      start_territory_id: [1],
      end_territory_id: [1],
    };
  }

  public static getBasicTrip(nb: number): PersonInterface[] {
    let array = new Array(nb);
    for (let i = 0; i < nb; i++) {
      array[i] = FakerEngine.getBasicPerson(i === 0);
    }
    return array;
  }
}
