import { provider } from '@ilos/common';
import { SlicesInterface } from '../../../interfaces/SlicesInterface';
import { ResultInterface as Campaign } from '../../../shared/policy/find.contract';

@provider()
export class CreateSlicesSheetToWorkbook {
  async call(filepath: string, slices: SlicesInterface[]): Promise<void> {}
}
