import { expect } from "dep:expect";
import { beforeEach, describe, it } from "dep:testing-bdd";
import { SUPPORTED_VERSIONS, USER_ACCESSKEY, USER_SECRETKEY } from "../../config.ts";
import { API } from "../../lib/API.ts";
import { createOperatorJourney } from "../../lib/journey.ts";
import { rx_datetime, rx_uuidV4 } from "../../lib/regex.ts";
import { CreateJourneyResponse } from "../../lib/types.ts";

describe("DEX Authentication", () => {
  const http = new API();

  beforeEach(async () => {
    if (!http.token) await http.authenticate(USER_ACCESSKEY, USER_SECRETKEY);
  });

  it("should be authenticated", async () => {
    const response = await http.get("/profile");
    expect(response.status).toEqual(200);
    expect(response.body).toBeDefined();
    expect(response.body).toMatchObject({
      operator_id: 1,
      role: "operator.admin",
    });
  });

  for (const version of SUPPORTED_VERSIONS) {
    it(`should be authenticated with ${version} API`, async () => {
      const journey = await createOperatorJourney();
      const response = await http.post<CreateJourneyResponse>(`/${version}/journeys`, journey);
      expect(response.body).toBeDefined();

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
    break;
  }

  // for (const version of SUPPORTED_VERSIONS) {
  //   it(`should not be authenticated with ${version} API`, async () => {
  //     const response = await http.post(`/${version}/journeys`, await createOperatorJourney());
  //     expect(response.ok).toBe(false);
  //     expect(response.status).toEqual(404);
  //   });
  // }
});
