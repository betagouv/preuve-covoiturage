import { FieldFilter, Fields } from "../models/CSVWriter.ts";
import { ExportTarget } from "../models/Export.ts";

export const prefix = "RPC";

export const filters: Array<FieldFilter> = [
  {
    target: ExportTarget.OPENDATA,
    exclusions: [
      "operator",
      "operator_journey_id",
      "operator_trip_id",
      "operator_passenger_id",
      "passenger_identity_key",
      "operator_driver_id",
      "driver_identity_key",
      "passenger_contribution",
      "driver_revenue",
    ],
  },
  {
    target: ExportTarget.OPERATOR,
    exclusions: ["operator", "has_incentive"],
  },
  {
    target: ExportTarget.TERRITORY,
    exclusions: ["has_incentive"],
  },
];

// fields are defined in the models/CarpoolRow.ts types
export const fields: Fields = [
  "journey_id",
  "operator_trip_id",
  "operator_journey_id",
  "operator_class",

  "status",

  "start_datetime",
  "start_date",
  "start_time",
  "end_datetime",
  "end_date",
  "end_time",

  "duration",
  "distance",

  "start_lat",
  "start_lon",
  "end_lat",
  "end_lon",

  "start_insee",
  "start_commune",
  "start_departement",
  "start_epci",
  "start_aom",
  "start_region",
  "start_pays",

  "end_insee",
  "end_commune",
  "end_departement",
  "end_epci",
  "end_aom",
  "end_region",
  "end_pays",

  "operator",
  "operator_passenger_id",
  "passenger_identity_key",
  "operator_driver_id",
  "driver_identity_key",

  "driver_revenue",
  "passenger_contribution",
  "passenger_seats",

  "cee_application",
  "incentive_type",
  "has_incentive",

  "incentive_0_siret",
  "incentive_0_name",
  "incentive_0_amount",
  "incentive_1_siret",
  "incentive_1_name",
  "incentive_1_amount",
  "incentive_2_siret",
  "incentive_2_name",
  "incentive_2_amount",

  "incentive_rpc_0_campaign_id",
  "incentive_rpc_0_campaign_name",
  "incentive_rpc_0_siret",
  "incentive_rpc_0_name",
  "incentive_rpc_0_amount",
  "incentive_rpc_1_campaign_id",
  "incentive_rpc_1_campaign_name",
  "incentive_rpc_1_siret",
  "incentive_rpc_1_name",
  "incentive_rpc_1_amount",
  "incentive_rpc_2_campaign_id",
  "incentive_rpc_2_campaign_name",
  "incentive_rpc_2_siret",
  "incentive_rpc_2_name",
  "incentive_rpc_2_amount",
];
