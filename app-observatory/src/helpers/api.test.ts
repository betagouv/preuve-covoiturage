import { afterEach, describe, expect, test, vi } from "vitest";
import { fetchTerritoryName, searchTerritories } from "./api";

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
    respondWith(200, [{ l_territory: "Nantes Métropole" }]);

    await expect(
      fetchTerritoryName({ code: "244400404", type: "epci" }),
    ).resolves.toBe("Nantes Métropole");
  });
});
