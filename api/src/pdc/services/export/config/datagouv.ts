import { env } from "@/lib/env/index.ts";
import { FieldFilter, Fields } from "@/pdc/services/export/models/CSVWriter.ts";
import { CarpoolDataGouvListType } from "../repositories/queries/CarpoolDataGouvQuery.ts";

export type DataGouvAPIConfig = {
  enabled: boolean;
  notify: boolean;
  contact: string | null;
  key: string;
  url: string;
  dataset: string;
};

export const api = {
  enabled: env("APP_DATAGOUV_ENABLED") === "true",
  notify: env("APP_DATAGOUV_NOTIFY") === "true",
  contact: env("APP_DATAGOUV_CONTACT") || null,
  key: env("APP_DATAGOUV_KEY"),
  url: env("APP_DATAGOUV_URL") || "https://api.gouv.fr/api/1/datasets/",
  dataset: env("APP_DATAGOUV_DATASET"),
};

/**
 * @required
 * used by the FieldService
 */
export const fields: Fields<CarpoolDataGouvListType> = [
  "journey_id",
  "trip_id",
  "journey_start_datetime",
  "journey_start_date",
  "journey_start_time",
  "journey_start_lon",
  "journey_start_lat",
  "journey_start_insee",
  "journey_start_department",
  "journey_start_town",
  "journey_start_towngroup",
  "journey_start_country",
  "journey_end_datetime",
  "journey_end_date",
  "journey_end_time",
  "journey_end_lon",
  "journey_end_lat",
  "journey_end_insee",
  "journey_end_department",
  "journey_end_town",
  "journey_end_towngroup",
  "journey_end_country",
  "passenger_seats",
  "operator_class",
  "journey_distance",
  "journey_duration",
  "has_incentive",
];

/**
 * @required
 * used by the FieldService
 */
export const filters: Array<FieldFilter<CarpoolDataGouvListType>> = [];
