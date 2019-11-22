import { OperatorVisibilityType } from '~/core/interfaces/operator/operatorVisibilityType';

import { territoryStubs } from '../stubs/territory/territory.list';
import { visibilityList } from '../stubs/operator/operator.visibleInTerritories';

export class ExpectedVisibility {
  public static get(): OperatorVisibilityType {
    const array = [...visibilityList];
    array.splice(1, 0, territoryStubs[1]._id);
    return array;
  }
}
