// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, test, vi } from "vitest";
import TerritoryAutocomplete from "./TerritoryAutocomplete";

const DEBOUNCE_MS = 300;

const lyon = { _id: 1, name: "Métropole de Lyon", siret: "20004697700019" };
const idfm = { _id: 2, name: "Île-de-France Mobilités", siret: "28750007800020" };

const respondWith = (rows: unknown[]) =>
  vi.spyOn(globalThis, "fetch").mockResolvedValue(
    new Response(JSON.stringify({ data: rows, meta: { pagination: { limit: 20, offset: 0, total: rows.length } } }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    }),
  );

// Focus d'abord : hors focus, MUI réinjecte le libellé de la valeur à chaque rendu.
const typeSearch = (...values: string[]) => {
  const input = screen.getByRole("combobox");
  fireEvent.focus(input);
  values.forEach((value) => fireEvent.change(input, { target: { value } }));
};

const calls = (spy: ReturnType<typeof respondWith>) => spy.mock.calls as [string, RequestInit][];
const searchCalls = (spy: ReturnType<typeof respondWith>) =>
  calls(spy)
    .map(([url]) => url)
    .filter((u) => u.includes("dashboard/territories"));

afterEach(() => {
  // Pas de `globals: true` dans la config vitest : le nettoyage RTL n'est pas automatique.
  cleanup();
  vi.restoreAllMocks();
});

describe("temporisation", () => {
  test("ne lance qu'une requête pour une rafale de frappes", async () => {
    const fetchSpy = respondWith([lyon]);
    render(<TerritoryAutocomplete value={null} onChange={vi.fn()} label="Territoire" />);

    typeSearch("l", "ly", "lyo", "lyon");

    await waitFor(() => expect(searchCalls(fetchSpy)).toHaveLength(1));
    expect(searchCalls(fetchSpy)[0]).toContain("search=lyon");
    expect(searchCalls(fetchSpy)[0]).toContain("limit=20");
  });

  test("ne cherche pas sous deux caractères", async () => {
    const fetchSpy = respondWith([lyon]);
    render(<TerritoryAutocomplete value={null} onChange={vi.fn()} label="Territoire" />);

    typeSearch("l");
    await new Promise((r) => setTimeout(r, DEBOUNCE_MS * 2));

    expect(searchCalls(fetchSpy)).toHaveLength(0);
    expect(screen.queryByText("Saisissez au moins 2 caractères")).not.toBeNull();
  });

  test("annule la requête en vol quand la saisie change", async () => {
    const fetchSpy = respondWith([lyon]);
    render(<TerritoryAutocomplete value={null} onChange={vi.fn()} label="Territoire" />);

    typeSearch("lyo");
    await waitFor(() => expect(searchCalls(fetchSpy)).toHaveLength(1));
    typeSearch("lyon");
    await waitFor(() => expect(searchCalls(fetchSpy)).toHaveLength(2));

    expect(calls(fetchSpy)[0][1].signal?.aborted).toBe(true);
    expect(calls(fetchSpy)[1][1].signal?.aborted).toBe(false);
  });

  test("n'émet plus rien après démontage", async () => {
    const fetchSpy = respondWith([lyon]);
    const { unmount } = render(<TerritoryAutocomplete value={null} onChange={vi.fn()} label="Territoire" />);

    typeSearch("lyon");
    unmount();
    await new Promise((r) => setTimeout(r, DEBOUNCE_MS * 2));

    expect(searchCalls(fetchSpy)).toHaveLength(0);
  });
});

describe("options", () => {
  test("affiche nom et SIRET des territoires renvoyés", async () => {
    respondWith([lyon]);
    render(<TerritoryAutocomplete value={null} onChange={vi.fn()} label="Territoire" />);

    typeSearch("lyon");

    expect(await screen.findByText("Métropole de Lyon (20004697700019)")).toBeDefined();
  });

  test("masque les territoires exclus", async () => {
    respondWith([lyon, idfm]);
    render(<TerritoryAutocomplete value={null} onChange={vi.fn()} excludeIds={[idfm._id]} label="Territoire" />);

    typeSearch("mobilit");

    expect(await screen.findByText(/Métropole de Lyon/)).toBeDefined();
    expect(screen.queryByText(/Île-de-France Mobilités/)).toBeNull();
  });

  test("signale l'absence de résultat", async () => {
    respondWith([]);
    render(<TerritoryAutocomplete value={null} onChange={vi.fn()} label="Territoire" />);

    typeSearch("zzzz");

    expect(await screen.findByText("Aucun territoire")).toBeDefined();
  });
});

describe("sélection", () => {
  test("remonte le territoire choisi puis vide le champ en mode ajout", async () => {
    const fetchSpy = respondWith([lyon]);
    const onChange = vi.fn();
    render(<TerritoryAutocomplete value={null} onChange={onChange} label="Territoire" />);
    typeSearch("lyon");

    fireEvent.click(await screen.findByText(/Métropole de Lyon/));
    await new Promise((r) => setTimeout(r, DEBOUNCE_MS * 2));

    expect(onChange).toHaveBeenCalledExactlyOnceWith(lyon);
    expect(screen.getByRole<HTMLInputElement>("combobox").value).toBe("");
    // MUI réinjecte le libellé après sélection : ça ne doit pas relancer de recherche.
    expect(searchCalls(fetchSpy)).toHaveLength(1);
  });

  test("affiche le libellé de la valeur contrôlée", () => {
    render(<TerritoryAutocomplete value={lyon} onChange={vi.fn()} label="Territoire" />);

    expect(screen.getByRole<HTMLInputElement>("combobox").value).toBe("Métropole de Lyon (20004697700019)");
  });

  test("ignore la réponse d'une recherche remplacée", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch");
    const body = (rows: unknown[]) => JSON.stringify({ data: rows });
    fetchSpy.mockImplementationOnce(
      () =>
        new Promise((resolve) =>
          setTimeout(() => resolve(new Response(body([idfm]), { status: 200 })), DEBOUNCE_MS * 2),
        ),
    );
    fetchSpy.mockResolvedValue(new Response(body([lyon]), { status: 200 }));
    render(<TerritoryAutocomplete value={null} onChange={vi.fn()} label="Territoire" />);

    typeSearch("lyo");
    await waitFor(() => expect(searchCalls(fetchSpy)).toHaveLength(1));
    typeSearch("lyon");
    await waitFor(() => expect(searchCalls(fetchSpy)).toHaveLength(2));
    await new Promise((r) => setTimeout(r, DEBOUNCE_MS * 3));

    expect(screen.queryByText(/Île-de-France/)).toBeNull();
    expect(screen.queryByText(/Métropole de Lyon/)).not.toBeNull();
  });
});
