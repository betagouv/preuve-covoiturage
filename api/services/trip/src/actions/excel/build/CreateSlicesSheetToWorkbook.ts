import { provider } from '@ilos/common';
import { ResultInterface as Campaign } from '../../../shared/policy/find.contract';

@provider()
export class CreateSlicesSheetToWorkbook {
  async call(filepath: string, campaign: Campaign): Promise<void> {}
}
