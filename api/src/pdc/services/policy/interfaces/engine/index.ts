import { BoundedSlices, SliceInterface, UnboundedSlices } from '@shared/policy/common/interfaces/Slices';
import {
  TerritoryCodeEnum,
  TerritoryCodeInterface,
  TerritorySelectorsInterface,
} from '@shared/territory/common/interfaces/TerritoryCodeInterface';

export {
  CommonIncentiveInterface,
  IncentiveStateEnum,
  IncentiveStatusEnum,
  SerializedIncentiveInterface,
  StatefulIncentiveInterface,
  StatelessIncentiveInterface,
} from './IncentiveInterface';
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
export { OperatorsEnum } from './OperatorsEnum';
export {
  PolicyHandlerInterface,
  PolicyHandlerParamsInterface,
  PolicyHandlerStaticInterface,
  PolicyInterface,
  SerializedPolicyInterface,
  StatefulContextInterface,
  StatelessContextInterface,
  StatelessRuleHelper,
} from './PolicyInterface';
export { TerritoryCodeInterface, TerritoryCodeEnum, TerritorySelectorsInterface };
export { SliceInterface, BoundedSlices, UnboundedSlices };

export interface CarpoolMetaInterface {
  calc_distance?: number;
  calc_duration?: number;
  payments?: Array<{ index?: number; amount?: number; siret?: string; type?: 'incentive' | 'payment' }>;
}

export interface CarpoolInterface {
  _id: number;
  passenger_payment: number;
  passenger_identity_uuid: string;
  passenger_has_travel_pass: boolean;
  passenger_is_over_18: boolean | null;
  passenger_meta?: CarpoolMetaInterface;
  driver_payment: number;
  driver_identity_uuid: string;
  driver_has_travel_pass: boolean;
  driver_meta?: CarpoolMetaInterface;
  operator_trip_id?: string;
  operator_uuid: string;
  operator_class: string;
  datetime: Date;
  seats: number;
  duration: number;
  distance: number;
  cost: number;
  start: TerritoryCodeInterface;
  start_lat: number;
  start_lon: number;
  end: TerritoryCodeInterface;
  end_lat: number;
  end_lon: number;
}
