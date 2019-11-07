import { PointInterface } from './PointInterface';

export interface InseeCoderInterface {
  toInsee(geo: PointInterface): Promise<string>;
}
