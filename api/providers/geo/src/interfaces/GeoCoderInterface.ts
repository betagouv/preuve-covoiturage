import { PointInterface } from './PointInterface';

export interface GeoCoderInterface {
  toPosition(literal: string): Promise<PointInterface>;
}
