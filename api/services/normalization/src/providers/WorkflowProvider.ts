import { provider, KernelInterface, InitHookInterface, ConfigInterfaceResolver, ContextType } from '@ilos/common';

const context: ContextType = {
  call: {
    user: {},
  },
  channel: {
    service: 'normalization',
  },
};

@provider()
export class WorkflowProvider implements InitHookInterface {
  protected steps: string[];

  constructor(protected config: ConfigInterfaceResolver, protected kernel: KernelInterface) {}

  async init() {
    this.steps = this.config.get('workflow.steps');
  }

  async next(currentState: string, data: any): Promise<void> {
    const nexStep = this.getNextStep(currentState);
    return this.kernel.notify(nexStep, data, context);
  }

  protected getNextStep(currentState: string): string {
    const index = this.steps.indexOf(currentState) + 1;
    if (this.steps.length > index && index !== 0) {
      return this.steps[index];
    }
    throw new Error();
  }
}
