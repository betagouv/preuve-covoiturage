import { Feature } from "@/deps.ts";
import { handler } from "@/ilos/common/index.ts";
import { Action as AbstractAction } from "@/ilos/core/index.ts";
import { hasPermissionMiddleware } from "@/pdc/providers/middleware/index.ts";
import { AiresCovoiturage } from "@/pdc/services/observatory/dto/infra/AiresCovoiturage.ts";
import { InfraRepositoryInterfaceResolver } from "../../interfaces/InfraRepositoryProviderInterface.ts";
export type ResultInterface = {
  id_lieu: string;
  nom_lieu: string;
  com_lieu: string;
  type: string;
  date_maj: Date;
  nbre_pl: number;
  nbre_pmr: number;
  duree: number;
  horaires: string;
  proprio: string;
  lumiere: boolean;
  geom: Feature;
}[];

@handler({
  service: "observatory",
  method: "airesCovoiturage",
  middlewares: [hasPermissionMiddleware("common.observatory.stats"), [
    "validate",
    AiresCovoiturage,
  ]],
})
export class AiresCovoiturageAction extends AbstractAction {
  constructor(private repository: InfraRepositoryInterfaceResolver) {
    super();
  }

  public async handle(params: AiresCovoiturage): Promise<ResultInterface> {
    return this.repository.getAiresCovoiturage(params);
  }
}
