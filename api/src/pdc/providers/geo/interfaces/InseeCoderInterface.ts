import { PointInterface } from './PointInterface.ts';

export interface InseeCoderInterface {
  positionToInsee(geo: PointInterface): Promise<string>;
}
