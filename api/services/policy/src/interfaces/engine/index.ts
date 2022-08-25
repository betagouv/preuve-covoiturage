import {
  TerritoryCodeInterface,
  TerritoryCodeEnum,
  TerritorySelectorsInterface,
} from '../../shared/territory/common/interfaces/TerritoryCodeInterface';

export { TerritoryCodeInterface, TerritoryCodeEnum, TerritorySelectorsInterface };

export interface CarpoolInterface {
  _id: number;
  trip_id: string;
  identity_uuid: string;
  operator_siret: string;
  operator_class: string;
  is_over_18: boolean | null;
  is_driver: boolean;
  has_travel_pass: boolean;
  datetime: Date;
  seats: number;
  duration: number;
  distance: number;
  cost: number;
  start: TerritoryCodeInterface;
  end: TerritoryCodeInterface;
}

export {
  MetadataAccessorInterface,
  MetadataLifetime,
  MetadataRegistryInterface,
  MetadataStoreInterface,
  MetadataVariableDefinitionInterface,
  SerializedAccessibleMetadataInterface,
  SerializedMetadataVariableDefinitionInterface,
  SerializedStoredMetadataInterface,
  StoredMetadataVariableInterface,
} from './MetadataInterface';

export {
  IncentiveStateEnum,
  IncentiveStatusEnum,
  SerializedIncentiveInterface,
  StatefulIncentiveInterface,
  StatelessIncentiveInterface,
} from './IncentiveInterface';

export {
  PolicyInterface,
  PolicyHandlerInterface,
  PolicyHandlerStaticInterface,
  SerializedPolicyInterface,
  StatefulContextInterface,
  StatelessRuleHelper,
  StatelessContextInterface,
  StepInterface,
} from './PolicyInterface';
