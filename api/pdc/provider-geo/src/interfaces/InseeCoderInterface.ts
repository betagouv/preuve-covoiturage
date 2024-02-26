import { PointInterface } from './PointInterface';

export interface InseeCoderInterface {
  positionToInsee(geo: PointInterface): Promise<string>;
}
