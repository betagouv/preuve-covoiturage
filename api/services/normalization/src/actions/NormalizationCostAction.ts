import { Action as AbstractAction } from '@ilos/core';
import { handler, KernelInterfaceResolver } from '@ilos/common';

import {
  signature as operatorFindSignature,
  ParamsInterface as OperatorFindParamsInterface,
  ResultInterface as OperatorFindResultInterface,
} from '../shared/operator/find.contract';

import { handlerConfig, ParamsInterface, ResultInterface } from '../shared/normalization/cost.contract';
import { PaymentInterface } from '../shared/common/interfaces/PaymentInterface';

import { IncentiveInterface } from '../shared/common/interfaces/IncentiveInterface';

// Enrich position data
@handler({ ...handlerConfig, middlewares: [['channel.service.only', ['acquisition', handlerConfig.service]]] })
export class NormalizationCostAction extends AbstractAction {
  constructor(private kernel: KernelInterfaceResolver) {
    super();
  }

  protected async getSiret(operatorId): Promise<string> {
    try {
      const { siret } = await this.kernel.call<OperatorFindParamsInterface, OperatorFindResultInterface>(
        operatorFindSignature,
        {
          _id: Number(operatorId),
        },
        {
          call: {
            user: {
              permissions: ['operator.read'],
            },
          },
          channel: {
            service: 'normalization',
          },
        },
      );
      return siret;
    } catch (e) {
      return null;
    }
  }

  public async handle(params: ParamsInterface): Promise<ResultInterface> {
    const siret = await this.getSiret(params.operator_id);

    const [cost, payments] = this.normalizeCost(
      siret,
      params.revenue,
      params.contribution,
      params.incentives,
      params.payments,
      params.isDriver,
    );

    // finalPerson['cost'] = cost;
    // finalPerson.payments = payments;

    return { cost, payments };
  }

  //  ------------------------------------------------------------------------------------

  protected normalizeCost(
    siret: string,
    revenue = 0,
    contribution = 0,
    incentives?: IncentiveInterface[],
    payments?: PaymentInterface[],
    isDriver = false,
  ): [number, PaymentInterface[]] {
    const cleanIncentives = incentives && incentives.length ? incentives : [];
    const inputPayments = payments && payments.length ? payments : [];
    const incentiveAmount = cleanIncentives.reduce((total, current) => total + current.amount, 0);
    // const revenue = data.revenue || 0;

    // tslint:disable-next-line: no-bitwise
    const cost = (isDriver ? -revenue - incentiveAmount : contribution + incentiveAmount) | 0;

    const isIncentive = (d: { type: string }): boolean => d.type === 'incentive';

    const cleanPayments = [
      ...cleanIncentives.map((p) => ({ ...p, type: 'incentive' })),
      ...inputPayments.map((p) => ({ ...p, type: 'payment', index: -1 })),
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
      // tslint:disable-next-line: no-bitwise
      amount: ((isDriver ? Math.abs(cost) : cost) - cleanPayments.reduce((sum, item) => sum + item.amount, 0)) | 0,
    });

    return [cost, cleanPayments];
  }
}
