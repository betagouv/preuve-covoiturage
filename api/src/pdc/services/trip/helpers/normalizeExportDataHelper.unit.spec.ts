import { assertEquals, describe, it } from "@/dev_deps.ts";
import { FlattenTripInterface } from "../actions/BuildExportAction.ts";
import { ExportTripInterface } from "../interfaces/index.ts";
import {
  normalizeExport,
  normalizeOpendata,
} from "./normalizeExportDataHelper.ts";

describe("normalize data export", () => {
  const tripWithoutIncentive: ExportTripInterface = {
    journey_id: "",
    trip_id: "",
    journey_start_datetime: new Date("2021-09-26 12:00:00+00"),
    journey_start_lon: "",
    journey_start_lat: "",
    journey_start_insee: "",
    journey_start_department: "",
    journey_start_town: "",
    journey_start_towngroup: "",
    journey_start_country: "",
    journey_end_datetime: new Date("2021-09-26 12:20:00+00"),
    journey_end_lon: "",
    journey_end_lat: "",
    journey_end_insee: "",
    journey_end_department: "",
    journey_end_town: "",
    journey_end_towngroup: "",
    journey_end_country: "",
    driver_card: false,
    driver_revenue: 500,
    passenger_card: false,
    passenger_over_18: false,
    passenger_seats: 1,
    operator_class: "C",
    operator_journey_id: "",
    operator_passenger_id: "",
    operator_driver_id: "",
    journey_distance: 0,
    journey_duration: 0,
    journey_distance_anounced: 0,
    journey_distance_calculated: 0,
    journey_duration_anounced: 0,
    journey_duration_calculated: 0,
  };
  const TRIP_WITHOUT_INCENTIVE = tripWithoutIncentive;
  const TRIP_WITH_DRIVER_INCENTIVE = {
    ...tripWithoutIncentive,
    driver_incentive_raw: [
      {
        siret: "89015202800019",
        amount: 200,
        type: "incentive",
      },
    ],
    driver_incentive_rpc_raw: [
      {
        siret: "89015202800019",
        amount: 200,
        type: "incentive",
      },
    ],
  };
  const TRIP_WITH_PASSENGER_INCENTIVE = {
    ...tripWithoutIncentive,
    passenger_incentive_raw: [
      {
        siret: "89015202800019",
        amount: 200,
        type: "incentive",
      },
    ],
    passenger_incentive_rpc_raw: [
      {
        siret: "89015202800019",
        amount: 200,
        type: "incentive",
      },
    ],
  };

  it("normalizeExportHelper: should flattern trip with driver_incentive for export", () => {
    // Act
    const result: FlattenTripInterface = normalizeExport(
      TRIP_WITH_DRIVER_INCENTIVE,
      "Europe/Paris",
    );

    // Assert
    assertEquals(result.driver_incentive_1_amount, 2);
    assertEquals(result.driver_incentive_1_siret, "89015202800019");

    assertEquals(result.passenger_incentive_1_amount, 0);
    assertEquals(result.passenger_incentive_1_siret, undefined);

    assertEquals(result.journey_start_datetime, "2021-09-26T14:00:00+02:00");
    assertEquals(result.driver_revenue, 5);
    assertEquals(result.has_incentive, undefined);
  });

  it("normalizeExportHelper: should flattern trip with passenger incentive for export", () => {
    // Act
    const result: FlattenTripInterface = normalizeExport(
      TRIP_WITH_PASSENGER_INCENTIVE,
      "Europe/Paris",
    );

    // Assert
    assertEquals(result.passenger_incentive_1_amount, 2);
    assertEquals(result.passenger_incentive_1_siret, "89015202800019");

    assertEquals(result.driver_incentive_1_amount, 0);
    assertEquals(result.driver_incentive_1_siret, undefined);

    assertEquals(result.journey_start_datetime, "2021-09-26T14:00:00+02:00");
    assertEquals(result.driver_revenue, 5);
    assertEquals(result.has_incentive, undefined);
  });

  it("normalizeExportHelper: should flattern trip without driver_incentive for opendata export", () => {
    // Act
    const result: FlattenTripInterface = normalizeOpendata(
      TRIP_WITH_DRIVER_INCENTIVE,
      "Europe/Paris",
    );

    // Assert
    assertEquals(result.driver_incentive_1_amount, undefined);
    assertEquals(result.driver_incentive_1_siret, undefined);

    assertEquals(result.passenger_incentive_1_amount, undefined);
    assertEquals(result.passenger_incentive_1_siret, undefined);

    assertEquals(result.journey_start_datetime, "2021-09-26T14:00:00+02:00");
    assertEquals(result.driver_revenue, 500);
    assertEquals(result.has_incentive, true);
  });

  it("normalizeExportHelper: should flattern trip with incentive false for opendata export", () => {
    // Act
    const result: FlattenTripInterface = normalizeOpendata(
      TRIP_WITHOUT_INCENTIVE,
      "Europe/Paris",
    );

    // Assert
    assertEquals(result.driver_incentive_1_amount, undefined);
    assertEquals(result.driver_incentive_1_siret, undefined);

    assertEquals(result.passenger_incentive_1_amount, undefined);
    assertEquals(result.passenger_incentive_1_siret, undefined);

    assertEquals(result.journey_start_datetime, "2021-09-26T14:00:00+02:00");
    assertEquals(result.driver_revenue, 500);
    assertEquals(result.has_incentive, false);
  });

  // eslint-disable-next-line max-len
  it("normalizeExportHelper: should flattern trip with incentive true for passenger incentives for opendata export", () => {
    // Act
    const result: FlattenTripInterface = normalizeOpendata(
      TRIP_WITH_PASSENGER_INCENTIVE,
      "Europe/Paris",
    );

    // Assert
    assertEquals(result.driver_incentive_1_amount, undefined);
    assertEquals(result.driver_incentive_1_siret, undefined);

    assertEquals(result.passenger_incentive_1_amount, undefined);
    assertEquals(result.passenger_incentive_1_siret, undefined);

    assertEquals(result.journey_start_datetime, "2021-09-26T14:00:00+02:00");
    assertEquals(result.driver_revenue, 500);
    assertEquals(result.has_incentive, true);
  });
});
