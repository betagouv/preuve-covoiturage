import { PointInterface } from './PointInterface.ts';

export interface GeoCoderInterface {
  literalToPosition(literal: string): Promise<PointInterface>;
}
