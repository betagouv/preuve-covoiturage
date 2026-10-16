import { type UserScopeInput } from "@/interfaces/dataInterface";

// Colonne « Territoires » : libellé = périmètre par défaut, suffixe (+N) et infobulle avec tous les noms.
// nameOf résout les noms manquants (scopes masqués hors registry.admin : seul territory_id est renvoyé).
export const territoriesCell = (
  scopes: UserScopeInput[] | undefined,
  fallbackId?: number,
  nameOf: (id: number) => string | undefined = () => undefined,
): { label: string; extra: number; all: string[] } => {
  const list = scopes?.length ? scopes : fallbackId ? [{ territory_id: fallbackId, is_default: true }] : [];
  if (!list.length) return { label: "", extra: 0, all: [] };
  const name = (s: UserScopeInput): string =>
    s.territory_name ?? (s.territory_id ? nameOf(s.territory_id) : undefined) ?? `#${s.territory_id}`;
  const def = list.find((s) => s.is_default) ?? list[0];
  return { label: name(def), extra: list.length - 1, all: list.map(name) };
};
