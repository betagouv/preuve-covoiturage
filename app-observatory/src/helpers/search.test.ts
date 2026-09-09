import { afterEach, describe, expect, test, vi } from "vitest";
import { fetchSearchAPI } from "./search";

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
