import {
  TerritoryCodeInterface,
  TerritoryCodeEnum,
  TerritorySelectorsInterface,
} from '../../shared/territory/common/interfaces/TerritoryCodeInterface';

export { TerritoryCodeInterface, TerritoryCodeEnum, TerritorySelectorsInterface };

export interface CarpoolMetaInterface {
  calc_distance?: number;
  calc_duration?: number;
  payments?: Array<{ index?: number; amount?: number; siret?: string; type?: 'incentive' | 'payment' }>;
}

export interface CarpoolInterface {
  _id: number;
  trip_id: string;
  passenger_identity_uuid: string;
  passenger_has_travel_pass: boolean;
  passenger_is_over_18: boolean | null;
  passenger_meta?: CarpoolMetaInterface;
  driver_identity_uuid: string;
  driver_has_travel_pass: boolean;
  driver_meta?: CarpoolMetaInterface;
  operator_siret: string;
  operator_class: string;
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
  CommonIncentiveInterface,
  IncentiveStateEnum,
  IncentiveStatusEnum,
  SerializedIncentiveInterface,
  StatefulIncentiveInterface,
  StatelessIncentiveInterface,
} from './IncentiveInterface';

export {
  PolicyInterface,
  PolicyHandlerInterface,
  PolicyHandlerParamsInterface,
  PolicyHandlerStaticInterface,
  SerializedPolicyInterface,
  SliceInterface,
  StatefulContextInterface,
  StatelessRuleHelper,
  StatelessContextInterface,
} from './PolicyInterface';

export { OperatorsEnum, OperatorsIdEnum } from './OperatorsEnum';
