import { assertEquals, assertFalse, describe, it } from "@/dev_deps.ts";
import { ConfigStore } from "@/ilos/core/extensions/Config.ts";
import { DataGouvProvider } from "@/pdc/services/trip/providers/DataGouvProvider.ts";
import { assertExists } from "https://deno.land/std@0.224.0/assert/assert_exists.ts";
import { Resource } from "../interfaces/index.ts";

describe("Datagouv API integration tests", () => {
  it("update dataset ressouce with correct body and content-type header", async () => {
    // Arrange
    const updateRessourceBodyResponse: Resource = {
      id: "123",
      description: "Spécificités du jeu de données août 2024",
      filetype: "file",
      format: "csv",
      title: "2024-08.csv",
      type: "main",
      url:
        "https://demo-static.data.gouv.fr/resources/trajets-realises-en-covoiturage-registre-de-preuve-de-covoiturage/20240919-081700/2024-08.csv",
    };
    const config = new ConfigStore({
      datagouv: {
        baseURL: "https://demo.data.gouv.fr/api/1",
        apiKey: "data-gouv-api-key",
        apiKeyHeader: "X-API-KEY",
        datasetSlug:
          "trajets-realises-en-covoiturage-registre-de-preuve-de-covoiturage",
      },
    });
    const mockFetch = (url: string, options: RequestInit) => {
      assertEquals(
        url,
        `${config.get("datagouv.baseURL")}//datasets/${
          config.get("datagouv.datasetSlug")
        }/resources/${updateRessourceBodyResponse.id}`,
      );
      assertEquals(options.method, "PUT");
      assertExists(options.headers);
      assertEquals(
        (options.headers as Record<string, string>)["Content-Type"],
        "application/json",
      );
      assertEquals(
        (options.headers as Record<string, string>)["X-API-KEY"],
        "data-gouv-api-key",
      );
      assertEquals(
        options.body,
        JSON.stringify(updateRessourceBodyResponse),
      );

      // Return a mock response
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve(updateRessourceBodyResponse),
      });
    };

    // Save the original fetch method
    const originalFetch = globalThis.fetch;
    // Replace fetch with the mock
    globalThis.fetch = mockFetch as typeof fetch;

    // Act
    const dataGouvProvider = new DataGouvProvider(config);
    const result = await dataGouvProvider.updateResource(
      config.get("datagouv.datasetSlug"),
      updateRessourceBodyResponse,
    );

    // Assert
    // Check the returned value
    assertEquals(result, updateRessourceBodyResponse);

    // Restore the original fetch method
    globalThis.fetch = originalFetch;
  });

  it("create dataset ressouce with file name", async () => {
    // Arrange
    const createRessourceBodyResponse: Resource = {
      id: "123",
      description: "Spécificités du jeu de données août 2024",
      filetype: "file",
      format: "csv",
      title: "2024-08.csv",
      type: "main",
      url:
        "https://demo-static.data.gouv.fr/resources/trajets-realises-en-covoiturage-registre-de-preuve-de-covoiturage/20240919-081700/2024-08.csv",
    };
    const mockReadFile = async (filepath: string) => new Uint8Array([1, 2, 3]);
    const filepath = "/path/to/2024-08.csv";
    const config = new ConfigStore({
      datagouv: {
        baseURL: "https://demo.data.gouv.fr/api/1",
        apiKey: "data-gouv-api-key",
        apiKeyHeader: "X-API-KEY",
        datasetSlug:
          "trajets-realises-en-covoiturage-registre-de-preuve-de-covoiturage",
      },
    });
    const mockFetch = (url: string, options: RequestInit) => {
      assertEquals(
        url,
        `${config.get("datagouv.baseURL")}//datasets/${
          config.get("datagouv.datasetSlug")
        }/upload/`,
      );
      assertEquals(options.method, "POST");
      assertExists(options.headers);
      assertFalse(
        (options.headers as Record<string, string>)["Content-Type"],
        "application/json",
      );
      assertEquals(
        ((options.body as FormData).get("file") as File)["name"],
        "2024-08.csv",
      );

      // Return a mock response
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve(createRessourceBodyResponse),
      });
    };

    // readFile Mock
    const originalReadFile = Deno.readFile;
    // @ts-ignore
    Deno.readFile = mockReadFile;

    // fetch Mock
    const originalFetch = globalThis.fetch;
    globalThis.fetch = mockFetch as typeof fetch;

    // Act
    const dataGouvProvider = new DataGouvProvider(config);
    await dataGouvProvider.uploadDatasetResource(
      config.get("datagouv.datasetSlug"),
      filepath,
    );

    // Restore the original fetch method
    globalThis.fetch = originalFetch;
    Deno.readFile = originalReadFile;
  });
});
