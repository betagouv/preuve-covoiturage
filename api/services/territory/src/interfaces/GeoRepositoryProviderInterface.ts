import { TerritoryDbMetaInterface } from '../shared/territory/common/interfaces/TerritoryDbMetaInterface';
import {
  ParamsInterface as CreateParams,
  ResultInterface as CreateResultInterface,
} from '../shared/territory/create.contract';
import { ParamsInterface as PatchParamsInterface } from '../shared/territory/update.contract';
import { ParamsInterface as DropdownParamsInterface } from '../shared/territory/listGeo.contract';
import {
  TerritoryQueryInterface,
  SortEnum,
  ProjectionFieldsEnum,
  TerritoryListFilter,
} from '../shared/territory/common/interfaces/TerritoryQueryInterface';
import { TerritoryParentChildrenInterface } from '../shared/territory/common/interfaces/TerritoryChildrenInterface';
import { ContactsInterface } from '../shared/common/interfaces/ContactsInterface';
import { TerritoryLevelEnum } from '../shared/territory/common/interfaces/TerritoryInterface';
import { TerritoryDropdownInterface } from '../shared/territory/common/interfaces/TerritoryDropdownInterface';

import {
  ParamsInterface as FindByInseeParamsInterface,
  ResultInterface as FindByInseeResultInterface,
} from '../shared/territory/findByInsees.contract';

export interface GeoRepositoryProviderInterface {
  dropdown(params: DropdownParamsInterface): Promise<TerritoryDropdownInterface[]>;
  findByInsees(params: FindByInseeParamsInterface): Promise<FindByInseeResultInterface>;
  getDirectRelation(id: number | number[]): Promise<TerritoryParentChildrenInterface[]>;
}

export abstract class GeoRepositoryProviderInterfaceResolver implements GeoRepositoryProviderInterface {
  async getDirectRelation(id: number | number[]): Promise<TerritoryParentChildrenInterface[]> {
    throw new Error();
  }

  async dropdown(params: DropdownParamsInterface): Promise<TerritoryDropdownInterface[]> {
    throw new Error();
  }

  async findByInsees(params: FindByInseeParamsInterface): Promise<FindByInseeResultInterface> {
    throw new Error();
  }
}
