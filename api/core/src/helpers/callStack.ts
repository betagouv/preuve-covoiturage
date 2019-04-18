import { MiddlewareInterface } from '../interfaces/MiddlewareInterface';
import { CallInterface } from '../interfaces/CallInterface';

export function callStack(call: CallInterface, ...steps: MiddlewareInterface[]): void {
  const [currentStep, ...nextSteps] = steps;
  if (currentStep) {
    currentStep(call, () => { callStack(call, ...nextSteps); });
  }
}
