import { provider } from "@/ilos/common/Decorators.ts";
import { ConfigInterfaceResolver } from "@/ilos/common/index.ts";
import { DataGouvAPIConfig } from "@/pdc/services/export/config/datagouv.ts";
import fr from "npm:date-fns@^3.6/locale/fr";

export type DataGouvDescriptionParams = {
  start_at: Date;
};

@provider()
export class DataGouvMetadataProvider {
  protected config: DataGouvAPIConfig;

  constructor(configStore: ConfigInterfaceResolver) {
    this.config = configStore.get("datagouv.api");
  }

  description(params: DataGouvDescriptionParams): string {
    const dateFr = fr(params.start_at);

    return `
Spécificités jeu de données June 2024

Les données concernent également les trajets dont le point de départ OU d'arrivée est situé en dehors du territoire français.

Nombre trajets collectés et validés par le registre de preuve de covoiturage 1000521
Nombre de trajets exposés dans le jeu de données : 973640
Nombre de trajets supprimés du jeu de données : 26881 = 14885 + 15058 - 3062
    Nombre de trajets dont l'occurrence du code INSEE de départ est < 6 : 14885
    Nombre de trajets dont l'occurrence du code INSEE d'arrivée est < 6 : 15058
    Nombre de trajets dont l'occurrence du code INSEE de départ ET d'arrivée est < 6 : 3062
    `;
  }
}
