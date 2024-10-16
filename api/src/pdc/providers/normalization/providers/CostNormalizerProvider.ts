import { KernelInterfaceResolver, provider } from "@/ilos/common/index.ts";

import {
  ParamsInterface as OperatorFindParamsInterface,
  ResultInterface as OperatorFindResultInterface,
  signature as operatorFindSignature,
} from "@/shared/operator/find.contract.ts";

import { logger } from "@/lib/logger/index.ts";
import {
  CostNormalizerProviderInterface,
  CostParamsInterface,
  CostResultInterface,
  IncentiveInterface,
  PaymentInterface,
} from "../interfaces/index.ts";

@provider()
export class CostNormalizerProvider implements CostNormalizerProviderInterface {
  constructor(private kernel: KernelInterfaceResolver) {}

  protected async getSiret(operatorId: number): Promise<string> {
    try {
      const { siret } = await this.kernel.call<
        OperatorFindParamsInterface,
        OperatorFindResultInterface
      >(
        operatorFindSignature,
        { _id: Number(operatorId) },
        {
          call: { user: { permissions: ["registry.operator.find"] } },
          channel: { service: "normalization" },
        },
      );

      return siret;
    } catch (e) {
      logger.error(`[normalization]:cost:getSiret ${e.message}`, e);
      return null;
    }
  }

  public async handle(
    params: CostParamsInterface,
  ): Promise<CostResultInterface> {
    const siret = await this.getSiret(params.operator_id);

    this.validate(params);

    const [cost, payments] = this.normalizeCost(
      siret,
      params.contribution,
      params.incentives,
      params.payments,
    );

    return { cost, payments, payment: params.payment || 0 };
  }

  //  ------------------------------------------------------------------------------------

  protected normalizeCost(
    siret: string,
    contribution: number,
    incentives: IncentiveInterface[],
    payments: PaymentInterface[],
  ): [number, PaymentInterface[]] {
    const incentiveAmount = incentives.reduce(
      (total, current) => total + current.amount,
      0,
    );
    const cost = incentiveAmount + contribution;

    const isIncentive = (d: { type: string }): boolean =>
      d.type === "incentive";

    const cleanPayments = [
      ...incentives.map((p) => ({ ...p, type: "incentive" })),
      ...payments.map((p) => ({ ...p, type: "payment", index: -1 })),
    ]
      .sort((a, b) => {
        if (!isIncentive(a) && !isIncentive(b)) {
          return 0;
        }
        if (isIncentive(a) && !isIncentive(b)) {
          return -1;
        }
        if (!isIncentive(a) && isIncentive(b)) {
          return 1;
        }
        if (a.index > b.index) {
          return 1;
        }
        if (a.index < b.index) {
          return -1;
        }
        return 0;
      })
      .map((p, i) => ({ ...p, index: i }));

    const amount =
      (cost - cleanPayments.reduce((sum, item) => sum + item.amount, 0)) | 0;
    if (amount > 0) {
      cleanPayments.push({
        amount,
        siret,
        index: cleanPayments.length,
        type: "payment",
      });
    }

    return [cost, cleanPayments];
  }

  protected validate(params: CostParamsInterface): void {
    // Payments should not be greater than contribution
    if (
      params.contribution <
        params.payments.reduce((acc, p) => acc + p.amount, 0)
    ) {
      throw new Error("Payments should not be greater than contribution");
    }
  }
}
