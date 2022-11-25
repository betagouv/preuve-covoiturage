import { ConfigInterfaceResolver, handler } from '@ilos/common';
import { Action as AbstractAction } from '@ilos/core';
import { hasPermissionMiddleware } from '@pdc/provider-middleware';

import { alias } from '../shared/user/simulatePolicyform.schema';
import { handlerConfig, ParamsInterface } from '../shared/user/simulatePolicyform.contract';
import { UserNotificationProvider } from '../providers/UserNotificationProvider';

@handler({
  ...handlerConfig,
  middlewares: [['validate', alias], hasPermissionMiddleware('common.user.contactform')],
})
export class SimulatePolicyformAction extends AbstractAction {
  constructor(private config: ConfigInterfaceResolver, private notify: UserNotificationProvider) {
    super();
  }

  public async handle(params: ParamsInterface): Promise<void> {
    // 1 Simulation pour 1, 3 et 6 mois de la campagne en synchrone et retourner le résultat en json ?
    // 1 Handling error if insee could not be found returns an error
    // 2 send email to user async
  }
}
