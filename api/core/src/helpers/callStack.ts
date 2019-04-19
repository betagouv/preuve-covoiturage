import { MiddlewareInterface } from '../interfaces/MiddlewareInterface';
import { CallType } from '../types/CallType';

export function callStack(call: CallType, ...steps: MiddlewareInterface[]): void {
  const [currentStep, ...nextSteps] = steps;
  if (currentStep) {
    currentStep(call, () => { callStack(call, ...nextSteps); });
  }
}
