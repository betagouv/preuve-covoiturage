import { PointInterface } from './PointInterface';

export interface InseeReverseCoderInterface {
  inseeToPosition(insee: string): Promise<PointInterface>;
}
