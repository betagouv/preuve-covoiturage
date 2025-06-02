import { expect } from "dep:expect";
import { beforeEach, describe, it } from "dep:testing-bdd";
import { OPERATOR_EMAIL, OPERATOR_PASSWORD } from "../../config.ts";
import { API } from "../../lib/API.ts";
import { createOperatorJourney } from "../../lib/journey.ts";
import { rx_datetime, rx_uuidV4 } from "../../lib/regex.ts";
import { CreateJourneyResponse, ProfileResponse } from "../../lib/types.ts";

describe("Legacy Authentication", () => {
  const http = new API();

  beforeEach(async () => {
    if (!http.token) await http.legacyAuthenticate(OPERATOR_EMAIL, OPERATOR_PASSWORD);
  });

  it("should be authenticated", async () => {
    const response = await http.get<ProfileResponse>("/profile");
    expect(response.status).toEqual(200);
    expect(response.body).toBeDefined();
    expect(response.body.operator_id).toStrictEqual(1);
    expect(response.body.application_id).toBeGreaterThan(0);
    expect(response.body.permissions).toBeDefined();
    expect(response.body.permissions.length).toBeGreaterThan(0);
  });

  /**
   * Test for legacy authentication with different API versions.
   * @doc https://tech.covoiturage.beta.gouv.fr/
   *
   * UPDATE the list of supported versions if needed.
   * - 2025-05-22: v3, v3.2
   */
  const SUPPORTED_VERSIONS = ["v3", "v3.2"];
  const UNSUPPORTED_VERSIONS = ["v3.1", "v4"];

  for (const version of SUPPORTED_VERSIONS) {
    it(`should be authenticated with ${version} API`, async () => {
      const journey = await createOperatorJourney();
      const response = await http.post<CreateJourneyResponse>(`/${version}/journeys`, journey);
      expect(response.body).toBeDefined();
      expect(typeof response.body).toBe("object");

      if ("result" in response.body) {
        expect(response.body.result).toBeDefined();
        expect(response.body.result.data).toBeDefined();
        expect(response.body.result.data.operator_journey_id).toMatch(rx_uuidV4);
        expect(response.body.result.data.created_at).toMatch(rx_datetime);
      } else if ("error" in response.body) {
        console.error(response.body.error);
        throw new Error(response.body.error?.message || "Unknown error");
      }
    });
  }

  for (const version of UNSUPPORTED_VERSIONS) {
    it(`should not be authenticated with ${version} API`, async () => {
      const response = await http.post(`/${version}/journeys`, await createOperatorJourney());
      expect(response.ok).toBe(false);
      expect(response.status).toEqual(404);
    });
  }
});
