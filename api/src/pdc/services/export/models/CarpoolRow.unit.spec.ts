import { assertEquals, describe, it } from "@/dev_deps.ts";
import { CarpoolRow } from "@/pdc/services/export/models/CarpoolRow.ts";
import { CarpoolListType } from "@/pdc/services/export/repositories/queries/CarpoolListQuery.ts";

describe("CarpoolRow", () => {
  const columns = [
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
    "offer_public",
    "offer_accepted_at",
    "incentive_type",
    "has_incentive",
  ];
  const data = [[
    null,
    null,
    "d194758c-3a97-4ce3-beda-4d676541a75f_2024-01-01",
    "C",
    "passed",
    "2024-01-01T10:00:00.000Z",
    "2024-01-01",
    "10:00:00",
    "2024-01-01T10:10:00.000Z",
    "2024-01-01",
    "10:10:00",
    "00:13:56",
    17.05,
    "49.006",
    "2.206",
    "49.053",
    "2.023",
    "95051",
    "Beauchamp",
    "Val-d'Oise",
    "CA Val Parisis",
    "Île-de-France Mobilités",
    "Île-de-France",
    "France",
    "95127",
    "Cergy",
    "Val-d'Oise",
    "CA de Cergy-Pontoise",
    "Île-de-France Mobilités",
    "Île-de-France",
    "France",
    "BlaBlaCar Daily",
    "33e5d7ad-5048-4734-89c4-9821004824d6",
    "143c91da5be0cfa2c05f6d545237218b7b968c5107a7d02552cf447f7c04d29f",
    "33e5d7ad-5048-4734-89c4-9821004824d6",
    "f522d7fb5040994f26d1fcff443ecf94adce08dd41f73ad92cd8a5070b7566bd",
    2.2,
    0,
    1,
    false,
    "28750007800020",
    "ILE-DE-FRANCE MOBILITES",
    "1.7",
    "49190454600034",
    "COMUTO",
    "0.5",
    null,
    null,
    null,
    null,
    null,
    null,
    null,
    null,
    null,
    null,
    null,
    null,
    null,
    null,
    null,
    null,
    null,
    null,
    true,
    "2024-01-01T08:55:00.000Z",
    "normal",
    true,
  ]];
  const rowData = Object.fromEntries(
    columns.map((column, index) => [column, data[0][index]]),
  ) as unknown as CarpoolListType;

  it("should list incentive fields", () => {
    const row = new CarpoolRow(rowData);
    const fields = row.incentiveFields();
    assertEquals(fields, [
      "incentive_0_siret",
      "incentive_0_name",
      "incentive_0_amount",
      "incentive_1_siret",
      "incentive_1_name",
      "incentive_1_amount",
      "incentive_2_siret",
      "incentive_2_name",
      "incentive_2_amount",
    ]);
  });

  it("should sum incentives", () => {
    const row = new CarpoolRow(rowData);
    const sum = row.incentiveSum();
    assertEquals(sum, 1.7 + 0.5 + 0);
  });

  it("should check if there is an incentive", () => {
    const row = new CarpoolRow(rowData);
    const hasIncentive = row.hasIncentive();
    assertEquals(hasIncentive, true);
  });
});