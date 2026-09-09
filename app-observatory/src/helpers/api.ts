import { Config } from "@/config";
import { INSEECode, PerimeterType } from "@/interfaces/observatoire/Perimeter";
import { useDashboardContext } from "../context/DashboardProvider";

// Base de l'API observatoire (datalake) ; le path /observatory est fixé ici, pas dans la var d'env.
export const OBSERVATORY_API_URL = `${Config.get<string>("next.public_datalake_base_url", "")}/observatory`;

export interface TerritorySearchResult {
  id: string;
  territory: string;
  l_territory: string;
  type: PerimeterType;
  year: number;
}

// Autocomplete de sélection de territoire via la route datalake `/observatory/territories/search`
// (remplace l'index Meilisearch `geo`). Sert aussi la résolution exacte d'un `id` (`code_type`).
// `year` cible un millésime précis du référentiel ; absent, l'API sert le dernier (`is_latest`).
export async function searchTerritories(
  q: string | null,
  limit = 20,
  year?: number,
): Promise<TerritorySearchResult[]> {
  const query = (q ?? "").trim();
  if (!query) return [];
  const params = new URLSearchParams({ q: query, limit: String(limit) });
  if (year !== undefined) params.set("year", String(year));
  const url = `${OBSERVATORY_API_URL}/territories/search?${params}`;
  // L'autocomplete ne sait rien afficher d'autre qu'une liste vide : on journalise
  // la panne pour ne pas la confondre avec une recherche sans résultat. La requête
  // est tenue hors des logs (saisie utilisateur).
  try {
    const response = await fetch(url);
    if (!response.ok) {
      console.error(`Recherche de territoires : HTTP ${response.status}`);
      return [];
    }
    const data = await response.json();
    if (!Array.isArray(data)) {
      console.error("Recherche de territoires : réponse inattendue");
      return [];
    }
    return data;
  } catch (e) {
    console.error("Recherche de territoires injoignable", e);
    return [];
  }
}

// Résolution du libellé d'un territoire à partir de son `id` (`code_type`), sur le
// millésime `year` (défaut API : le dernier). Retombe sur « France » si la recherche
// ne renvoie rien ou échoue.
// La route est floue : sans `id` exact elle renvoie le territoire le plus proche
// (`XXXXX_country` → « Courtry »), d'où la comparaison sur `id`.
export async function fetchTerritoryName(
  value: { code: INSEECode; type: PerimeterType },
  year?: number,
): Promise<string> {
  const id = `${value.code}_${value.type}`;
  const results = await searchTerritories(id, 1, year);
  const exact = results.find((r) => r.id === id);
  return exact?.l_territory ?? "France";
}
export const GetApiUrl = (
  route: string,
  params: string[],
) => {
  const { dashboard } = useDashboardContext();
  switch (dashboard.params.period) {
    case "month":
      params.push(`month=${dashboard.params.month}`);
      break;
    case "trimester":
      params.push(`trimester=${dashboard.params.trimester}`);
      break;
    case "semester":
      params.push(`semester=${dashboard.params.semester}`);
      break;
  }
  return `${OBSERVATORY_API_URL}/${route}?${params.join("&")}`;
};
