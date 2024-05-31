import { PointInterface } from './PointInterface.ts';

export interface InseeReverseCoderInterface {
  inseeToPosition(insee: string): Promise<PointInterface>;
}
