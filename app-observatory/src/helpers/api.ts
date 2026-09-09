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
  try {
    const response = await fetch(url);
    if (!response.ok) return [];
    const data = await response.json();
    return Array.isArray(data) ? data : [];
  } catch (e) {
    console.error(e);
    return [];
  }
}

// Résolution du libellé d'un territoire à partir de son `id` (`code_type`), sur le
// millésime `year` (défaut API : le dernier). Retombe sur « France » si la recherche
// ne renvoie rien ou échoue.
export async function fetchTerritoryName(
  value: { code: INSEECode; type: PerimeterType },
  year?: number,
): Promise<string> {
  const results = await searchTerritories(`${value.code}_${value.type}`, 1, year);
  return results[0]?.l_territory ?? "France";
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
