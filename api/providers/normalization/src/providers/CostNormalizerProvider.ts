import { KernelInterfaceResolver, provider } from '@ilos/common';

import {
  signature as operatorFindSignature,
  ParamsInterface as OperatorFindParamsInterface,
  ResultInterface as OperatorFindResultInterface,
} from '../shared/operator/find.contract';

import {
  CostParamsInterface,
  CostResultInterface,
  CostNormalizerProviderInterface,
  IncentiveInterface,
  PaymentInterface,
} from '../interfaces';

@provider()
export class CostNormalizerProvider implements CostNormalizerProviderInterface {
  constructor(private kernel: KernelInterfaceResolver) {}

  protected async getSiret(operatorId: number): Promise<string> {
    try {
      const { siret } = await this.kernel.call<OperatorFindParamsInterface, OperatorFindResultInterface>(
        operatorFindSignature,
        { _id: Number(operatorId) },
        {
          call: { user: { permissions: ['registry.operator.find'] } },
          channel: { service: 'normalization' },
        },
      );

      return siret;
    } catch (e) {
      console.error(`[normalization]:cost:getSiret ${e.message}`, e);
      return null;
    }
  }

  public async handle(params: CostParamsInterface): Promise<CostResultInterface> {
    const siret = await this.getSiret(params.operator_id);

    this.validate(params);

    const [cost, payments] = this.normalizeCost(siret, params.contribution, params.incentives, params.payments);

    return { cost, payments };
  }

  //  ------------------------------------------------------------------------------------

  protected normalizeCost(
    siret: string,
    contribution: number,
    incentives: IncentiveInterface[],
    payments: PaymentInterface[],
  ): [number, PaymentInterface[]] {
    const incentiveAmount = incentives.reduce((total, current) => total + current.amount, 0);
    const cost = incentiveAmount + contribution;

    const isIncentive = (d: { type: string }): boolean => d.type === 'incentive';

    const cleanPayments = [
      ...incentives.map((p) => ({ ...p, type: 'incentive' })),
      ...payments.map((p) => ({ ...p, type: 'payment', index: -1 })),
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

    cleanPayments.push({
      siret,
      index: cleanPayments.length,
      type: 'payment',
      amount: (cost - cleanPayments.reduce((sum, item) => sum + item.amount, 0)) | 0,
    });

    return [cost, cleanPayments];
  }

  protected validate(params: CostParamsInterface): void {
    // Payments should not be greater than contribution
    if (params.contribution < params.payments.reduce((acc, p) => acc + p.amount, 0)) {
      throw new Error('Payments should not be greater than contribution');
    }
  }
}
