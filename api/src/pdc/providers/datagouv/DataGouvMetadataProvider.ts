import { datefr, format, subDays } from "@/deps.ts";
import { provider } from "@/ilos/common/Decorators.ts";
import { ConfigInterfaceResolver } from "@/ilos/common/index.ts";
import { DataGouvAPIConfig } from "@/pdc/services/export/config/datagouv.ts";

export type DataGouvDescriptionParams = {
  start_at: Date;
  end_at: Date;
  count_total: number;
  count_exposed: number;
  count_removed: number;
  count_removed_start: number;
  count_removed_end: number;
  count_removed_both: number;
};

@provider()
export class DataGouvMetadataProvider {
  protected config: DataGouvAPIConfig;

  constructor(configStore: ConfigInterfaceResolver) {
    this.config = configStore.get("datagouv.api");
  }

  description(params: DataGouvDescriptionParams): string {
    const start_date_fr = format(params.start_at, "PP", { locale: datefr });
    const end_date_fr = format(subDays(params.end_at, 1), "PP", { locale: datefr });

    return `
Spécificités jeu de données entre le ${start_date_fr} et le ${end_date_fr} :

Les données concernent également les trajets dont le point de départ OU d'arrivée est situé en dehors du territoire français.

Nombre trajets collectés et validés par le registre de preuve de covoiturage ${params.count_total}.
Nombre de trajets exposés dans le jeu de données : ${params.count_exposed}.
Nombre de trajets supprimés du jeu de données : ${params.count_removed} = ${params.count_removed_start} + ${params.count_removed_end} - ${params.count_removed_both}.
    Nombre de trajets dont l'occurrence du code INSEE de départ est < 6 : ${params.count_removed_start}
    Nombre de trajets dont l'occurrence du code INSEE d'arrivée est < 6 : ${params.count_removed_end}
    Nombre de trajets dont l'occurrence du code INSEE de départ ET d'arrivée est < 6 : ${params.count_removed_both}
    `;
  }
}
