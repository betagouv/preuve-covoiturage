import { afterEach, describe, expect, test, vi } from "vitest";
import { fetchSearchAPI, fetchTerritoryName } from "./search";

// Corps réel renvoyé par Meilisearch quand la clé est absente ou invalide.
const invalidApiKey = {
  message: "The provided API key is invalid.",
  code: "invalid_api_key",
  type: "auth",
  link: "https://docs.meilisearch.com/errors#invalid_api_key",
};

const respondWith = (status: number, body: unknown) =>
  vi.spyOn(globalThis, "fetch").mockResolvedValue(
    new Response(JSON.stringify(body), {
      status,
      headers: { "Content-Type": "application/json" },
    }),
  );

afterEach(() => vi.restoreAllMocks());

describe("fetchSearchAPI", () => {
  test("lève une erreur portant le statut quand la recherche répond 403", async () => {
    respondWith(403, invalidApiKey);

    await expect(fetchSearchAPI("indexes/geo/search")).rejects.toThrow(/403/);
  });

  test("lève une erreur portant le code Meilisearch quand la recherche répond 403", async () => {
    respondWith(403, invalidApiKey);

    await expect(fetchSearchAPI("indexes/geo/search")).rejects.toThrow(
      /invalid_api_key/,
    );
  });

  test("retourne le corps décodé quand la recherche répond 200", async () => {
    respondWith(200, { hits: [{ l_territory: "France" }] });

    await expect(fetchSearchAPI("indexes/geo/search")).resolves.toEqual({
      hits: [{ l_territory: "France" }],
    });
  });
});

describe("fetchTerritoryName", () => {
  test("retombe sur France quand la recherche répond 403", async () => {
    respondWith(403, invalidApiKey);

    await expect(
      fetchTerritoryName({ code: "XXXXX", type: "country" }),
    ).resolves.toBe("France");
  });

  test("retombe sur France quand la recherche ne renvoie aucun résultat", async () => {
    respondWith(200, { hits: [] });

    await expect(
      fetchTerritoryName({ code: "00000", type: "com" }),
    ).resolves.toBe("France");
  });

  test("retourne le libellé du territoire trouvé", async () => {
    respondWith(200, { hits: [{ l_territory: "Nantes Métropole" }] });

    await expect(
      fetchTerritoryName({ code: "244400404", type: "epci" }),
    ).resolves.toBe("Nantes Métropole");
  });
});
