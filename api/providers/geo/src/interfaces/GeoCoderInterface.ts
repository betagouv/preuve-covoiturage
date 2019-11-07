import { PointInterface } from './PointInterface';

export interface GeoCoderInterface {
  literalToPosition(literal: string): Promise<PointInterface>;
}
