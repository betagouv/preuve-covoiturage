import { afterEach, describe, expect, test, vi } from "vitest";
import { fetchTerritoryName, searchTerritories } from "./api";
import { latestMillesime, targetMillesime } from "./lists";

const respondWith = (status: number, body: unknown) =>
  vi.spyOn(globalThis, "fetch").mockResolvedValue(
    new Response(JSON.stringify(body), {
      status,
      headers: { "Content-Type": "application/json" },
    }),
  );

afterEach(() => vi.restoreAllMocks());

describe("searchTerritories", () => {
  test("retourne les territoires quand la recherche répond 200", async () => {
    respondWith(200, [
      { id: "69123_com", territory: "69123", l_territory: "Lyon", type: "com", year: 2026 },
    ]);

    await expect(searchTerritories("lyon")).resolves.toHaveLength(1);
  });

  test("retourne une liste vide quand la recherche échoue", async () => {
    respondWith(503, { detail: "maintenance" });

    await expect(searchTerritories("lyon")).resolves.toEqual([]);
  });

  test("retourne une liste vide quand la réponse n'est pas un tableau", async () => {
    respondWith(200, { detail: "invalid request parameters" });

    await expect(searchTerritories("lyon")).resolves.toEqual([]);
  });

  test("n'appelle pas l'API sur une saisie vide", async () => {
    const fetchSpy = respondWith(200, []);

    await expect(searchTerritories("  ")).resolves.toEqual([]);
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  test("reste silencieuse quand la requête est annulée", async () => {
    vi.spyOn(globalThis, "fetch").mockRejectedValue(
      Object.assign(new Error("aborted"), { name: "AbortError" }),
    );
    const logged = vi.spyOn(console, "error").mockImplementation(() => {});

    await expect(searchTerritories("lyon")).resolves.toEqual([]);
    expect(logged).not.toHaveBeenCalled();
  });

  test("transmet le signal d'annulation à fetch", async () => {
    const fetchSpy = respondWith(200, []);
    const { signal } = new AbortController();

    await searchTerritories("lyon", 20, undefined, signal);

    expect(fetchSpy.mock.calls[0][1]).toMatchObject({ signal });
  });

  test("encode la saisie dans la query string", async () => {
    const fetchSpy = respondWith(200, []);

    await searchTerritories("saint-étienne & co");

    expect(String(fetchSpy.mock.calls[0][0])).toContain(
      "q=saint-%C3%A9tienne+%26+co",
    );
  });

  test("cible le millésime demandé quand `year` est fourni", async () => {
    const fetchSpy = respondWith(200, []);

    await searchTerritories("lyon", 20, 2022);

    expect(String(fetchSpy.mock.calls[0][0])).toContain("year=2022");
  });

  test("laisse l'API servir le dernier millésime quand `year` est absent", async () => {
    const fetchSpy = respondWith(200, []);

    await searchTerritories("lyon");

    expect(String(fetchSpy.mock.calls[0][0])).not.toContain("year=");
  });
});

describe("fetchTerritoryName", () => {
  test("retombe sur France quand la recherche échoue", async () => {
    respondWith(503, { detail: "maintenance" });

    await expect(
      fetchTerritoryName({ code: "XXXXX", type: "country" }),
    ).resolves.toBe("France");
  });

  test("retombe sur France quand la recherche ne renvoie aucun résultat", async () => {
    respondWith(200, []);

    await expect(
      fetchTerritoryName({ code: "00000", type: "com" }),
    ).resolves.toBe("France");
  });

  test("retourne le libellé du territoire trouvé", async () => {
    respondWith(200, [{ id: "244400404_epci", l_territory: "Nantes Métropole" }]);

    await expect(
      fetchTerritoryName({ code: "244400404", type: "epci" }),
    ).resolves.toBe("Nantes Métropole");
  });

  test("retombe sur France quand la recherche floue renvoie un autre territoire", async () => {
    respondWith(200, [{ id: "77139_com", l_territory: "Courtry" }]);

    await expect(
      fetchTerritoryName({ code: "XXXXX", type: "country" }),
    ).resolves.toBe("France");
  });

  test("résout le libellé sur le millésime demandé", async () => {
    const fetchSpy = respondWith(200, []);

    await fetchTerritoryName({ code: "69123", type: "com" }, 2022);

    expect(String(fetchSpy.mock.calls[0][0])).toContain("year=2022");
  });
});

describe("targetMillesime", () => {
  test("cible l'année demandée quand elle précède le dernier millésime", () => {
    expect(targetMillesime(latestMillesime - 1)).toBe(latestMillesime - 1);
  });

  test("laisse l'API servir le dernier millésime pour l'année courante", () => {
    expect(targetMillesime(latestMillesime)).toBeUndefined();
  });

  test("laisse l'API servir le dernier millésime au-delà du référentiel", () => {
    expect(targetMillesime(latestMillesime + 1)).toBeUndefined();
  });
});
