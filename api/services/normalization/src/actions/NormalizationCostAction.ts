import { Action as AbstractAction } from '@ilos/core';
import { handler, KernelInterfaceResolver } from '@ilos/common';

import {
  signature as operatorFindSignature,
  ParamsInterface as OperatorFindParamsInterface,
  ResultInterface as OperatorFindResultInterface,
} from '../shared/operator/find.contract';

import { handlerConfig, ParamsInterface, ResultInterface } from '../shared/normalization/cost.contract';
import { ActionMiddleware } from '../shared/common/ActionMiddlewareInterface';
import { WorkflowProvider } from '../providers/WorkflowProvider';
import { PersonInterface } from '../shared/common/interfaces/PersonInterface';
import { PaymentInterface } from '../shared/common/interfaces/PaymentInterface';

// Enrich position data
@handler(handlerConfig)
export class NormalizationCostAction extends AbstractAction {
  public readonly middlewares: ActionMiddleware[] = [['channel.service.only', ['acquisition', handlerConfig.service]]];

  constructor(private wf: WorkflowProvider, private kernel: KernelInterfaceResolver) {
    super();
  }

  public async handle(journey: ParamsInterface): Promise<ResultInterface> {
    this.logger.debug(`Normalization:cost on ${journey._id}`);

    const normalizedJourney = { ...journey };
    const { siret } = await this.kernel.call<OperatorFindParamsInterface, OperatorFindResultInterface>(
      operatorFindSignature,
      {
        _id: Number(journey.operator_id),
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

    if (journey.payload.passenger) {
      const [cost, payments] = this.normalizeCost(siret, journey.payload.passenger, false);
      journey.payload.passenger['cost'] = cost;
      journey.payload.passenger.payments = payments;
    }

    if (journey.payload.driver) {
      const [cost, payments] = this.normalizeCost(siret, journey.payload.driver, true);
      journey.payload.driver['cost'] = cost;
      journey.payload.driver.payments = payments;
    }

    await this.wf.next('normalization:cost', normalizedJourney);

    return normalizedJourney;
  }

  protected normalizeCost(siret: string, data: PersonInterface, isDriver?: boolean): [number, PaymentInterface[]] {
    const incentives = data.incentives && data.incentives.length ? data.incentives : [];
    const inputPayments = data.payments && data.payments.length ? data.payments : [];
    const incentiveAmount = incentives.reduce((total, current) => total + current.amount, 0);
    const revenue = data.revenue || 0;
    const contribution = data.contribution || 0;

    // tslint:disable-next-line: no-bitwise
    const cost = (isDriver ? -revenue - incentiveAmount : contribution + incentiveAmount) | 0;

    const isIncentive = (d: { type: string }): boolean => d.type === 'incentive';

    const payments = [
      ...incentives.map((p) => ({ ...p, type: 'incentive' })),
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

    payments.push({
      siret,
      index: payments.length,
      type: 'payment',
      // tslint:disable-next-line: no-bitwise
      amount: (Math.abs(cost) - payments.reduce((sum, item) => sum + item.amount, 0)) | 0,
    });

    return [cost, payments];
  }
}
