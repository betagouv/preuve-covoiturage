import { handler } from "@/ilos/common/index.ts";
import { Action as AbstractAction } from "@/ilos/core/index.ts";
import { hasPermissionMiddleware } from "@/pdc/providers/middleware/index.ts";
import { Direction } from "@/pdc/providers/superstruct/shared/index.ts";
import { JourneysByHours } from "@/pdc/services/observatory/dto/distribution/JourneysByHours.ts";
import { Infer } from "https://jsr.io/@superstruct/core/2.0.2/src/struct.ts";
import { DistributionRepositoryInterfaceResolver } from "../../interfaces/DistributionRepositoryProviderInterface.ts";
export type ResultInterface = {
  code: string;
  libelle: string;
  direction: Infer<typeof Direction>;
  hours: [
    {
      hour: number;
      journeys: number;
    },
  ];
}[];

@handler({
  service: "observatory",
  method: "journeysByHours",
  middlewares: [hasPermissionMiddleware("common.observatory.stats"), [
    "validate",
    JourneysByHours,
  ]],
})
export class JourneysByHoursAction extends AbstractAction {
  constructor(private repository: DistributionRepositoryInterfaceResolver) {
    super();
  }

  public async handle(params: JourneysByHours): Promise<ResultInterface> {
    return this.repository.getJourneysByHours(params);
  }
}
