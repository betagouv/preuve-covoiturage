// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import SelectTerritory from "./SelectTerritory";

const push = vi.fn();
vi.mock("next/navigation", () => ({ useRouter: () => ({ push }) }));

// Le millésime du tableau de bord est une entrée du composant : on le pilote.
let year = 2026;
vi.mock("../../context/DashboardProvider", () => ({
  useDashboardContext: () => ({
    dashboard: { params: { code: "XXXXX", name: "France", type: "country", year } },
  }),
}));

const DEBOUNCE_MS = 300;

const lyon = {
  id: "69123_com",
  territory: "69123",
  l_territory: "Lyon",
  type: "com",
  year: 2026,
};

const respondWith = (rows: unknown[]) =>
  vi.spyOn(globalThis, "fetch").mockResolvedValue(
    new Response(JSON.stringify(rows), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    }),
  );

const typeSearch = (...values: string[]) => {
  const input = screen.getByRole("combobox");
  values.forEach((value) => fireEvent.change(input, { target: { value } }));
};

const searchCalls = (spy: ReturnType<typeof respondWith>) =>
  spy.mock.calls.map((c) => String(c[0])).filter((u) => u.includes("territories/search"));

beforeEach(() => {
  year = 2026;
  push.mockClear();
});
afterEach(() => {
  // Pas de `globals: true` dans la config vitest : le nettoyage RTL automatique
  // n'est pas branché, sans quoi les rendus s'empilent d'un test à l'autre.
  cleanup();
  vi.restoreAllMocks();
});

describe("temporisation", () => {
  test("ne lance qu'une requête pour une rafale de frappes", async () => {
    const fetchSpy = respondWith([lyon]);
    render(<SelectTerritory url="territoire" />);

    typeSearch("l", "ly", "lyo", "lyon");

    await waitFor(() => expect(searchCalls(fetchSpy)).toHaveLength(1));
    expect(searchCalls(fetchSpy)[0]).toContain("q=lyon");
  });

  test("ne lance rien avant la fin du délai", async () => {
    const fetchSpy = respondWith([lyon]);
    render(<SelectTerritory url="territoire" />);

    typeSearch("lyon");

    expect(searchCalls(fetchSpy)).toHaveLength(0);
    await waitFor(() => expect(searchCalls(fetchSpy)).toHaveLength(1));
  });
});

describe("millésime", () => {
  test("cible l'année du tableau de bord sur un millésime passé", async () => {
    year = 2022;
    const fetchSpy = respondWith([lyon]);
    render(<SelectTerritory url="territoire" />);

    typeSearch("lyon");

    await waitFor(() => expect(searchCalls(fetchSpy)[0]).toContain("year=2022"));
  });

  test("laisse l'API servir le dernier millésime sur l'année courante", async () => {
    const fetchSpy = respondWith([lyon]);
    render(<SelectTerritory url="territoire" />);

    typeSearch("lyon");

    await waitFor(() => expect(searchCalls(fetchSpy)).toHaveLength(1));
    expect(searchCalls(fetchSpy)[0]).not.toContain("year=");
  });
});

describe("sélection", () => {
  test("affiche les territoires renvoyés par l'API", async () => {
    respondWith([lyon]);
    render(<SelectTerritory url="territoire" />);

    typeSearch("lyon");

    expect(await screen.findByText("Lyon")).toBeDefined();
  });

  test("navigue vers le territoire choisi", async () => {
    respondWith([lyon]);
    render(<SelectTerritory url="territoire" />);
    typeSearch("lyon");

    fireEvent.click(await screen.findByText("Lyon"));

    expect(push).toHaveBeenCalledExactlyOnceWith(
      "/observatoire/territoire?code=69123&type=com",
    );
  });

  // MUI réinjecte le libellé formaté dans le champ après sélection : sans le
  // filtre sur `reason`, ça repartait en requête.
  test("ne relance pas de recherche après la sélection", async () => {
    const fetchSpy = respondWith([lyon]);
    render(<SelectTerritory url="territoire" />);
    typeSearch("lyon");
    await waitFor(() => expect(searchCalls(fetchSpy)).toHaveLength(1));

    fireEvent.click(await screen.findByText("Lyon"));
    await new Promise((r) => setTimeout(r, DEBOUNCE_MS * 2));

    expect(searchCalls(fetchSpy)).toHaveLength(1);
  });
});
