import {
  provider,
  InitHookInterface,
  ConfigInterfaceResolver,
  ContextType,
  KernelInterfaceResolver,
  HasLogger,
} from '@ilos/common';

const context: ContextType = {
  call: {
    user: {},
  },
  channel: {
    service: 'normalization',
  },
};

@provider()
export class WorkflowProvider extends HasLogger implements InitHookInterface {
  protected steps: string[] = [];

  constructor(protected config: ConfigInterfaceResolver, protected kernel: KernelInterfaceResolver) {
    super();
  }

  async init() {
    this.steps = this.config.get('workflow.steps');
  }

  async next(currentState: string, data: any): Promise<void> {
    const nextStep = this.getNextStep(currentState);
    this.logger.debug(`Found ${nextStep}`);
    return this.kernel.notify(nextStep, data, context);
  }

  protected getNextStep(currentState: string): string {
    this.logger.debug(`Find next step from ${currentState}`, this.steps);

    const index = this.steps.indexOf(currentState) + 1;
    if (this.steps.length > index && index !== 0) {
      return this.steps[index];
    }

    throw new Error();
  }
}
