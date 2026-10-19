import { searchDashboardTerritories } from "@/helpers/api";
import { afterEach, describe, expect, it, vi } from "vitest";

const lyon = { _id: 1, name: "Métropole de Lyon", siret: "20004697700019" };

const respondWith = (body: unknown, status = 200) =>
  vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response(JSON.stringify(body), { status }));

afterEach(() => {
  vi.restoreAllMocks();
});

describe("searchDashboardTerritories", () => {
  it("interroge dashboard/territories avec la recherche, la limite et la session", async () => {
    const fetchSpy = respondWith({ data: [lyon], meta: { pagination: { limit: 20, offset: 0, total: 1 } } });

    const result = await searchDashboardTerritories("lyon", 20);

    expect(result).toEqual([lyon]);
    const [url, init] = fetchSpy.mock.calls[0] as [string, RequestInit];
    expect(url).toContain("/v3/dashboard/territories?");
    expect(url).toContain("search=lyon");
    expect(url).toContain("limit=20");
    expect(init.credentials).toBe("include");
  });

  it("ne lance aucun appel sur une recherche vide", async () => {
    const fetchSpy = respondWith({ data: [lyon] });

    expect(await searchDashboardTerritories("")).toEqual([]);
    expect(await searchDashboardTerritories("   ")).toEqual([]);
    expect(await searchDashboardTerritories(null)).toEqual([]);
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("transmet le signal d'annulation", async () => {
    const fetchSpy = respondWith({ data: [] });
    const { signal } = new AbortController();

    await searchDashboardTerritories("lyon", 20, signal);

    const [, init] = fetchSpy.mock.calls[0] as [string, RequestInit];
    expect(init.signal).toBe(signal);
  });

  it("rend une liste vide sur une erreur HTTP ou une réponse inattendue", async () => {
    vi.spyOn(console, "error").mockImplementation(() => undefined);
    respondWith({ error: "nope" }, 500);
    expect(await searchDashboardTerritories("lyon")).toEqual([]);

    vi.restoreAllMocks();
    vi.spyOn(console, "error").mockImplementation(() => undefined);
    respondWith([lyon]);
    expect(await searchDashboardTerritories("lyon")).toEqual([]);
  });

  it("rend une liste vide sur une requête annulée, sans journaliser", async () => {
    const error = vi.spyOn(console, "error").mockImplementation(() => undefined);
    vi.spyOn(globalThis, "fetch").mockRejectedValue(new DOMException("aborted", "AbortError"));

    expect(await searchDashboardTerritories("lyon")).toEqual([]);
    expect(error).not.toHaveBeenCalled();
  });
});
