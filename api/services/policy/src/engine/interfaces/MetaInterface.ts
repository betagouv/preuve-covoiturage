export interface MetaInterface {
  has(key: string): boolean;
  get(key: string, fallback?: number): number;
  set(key: string, data: number): void;
  keys(): string[];
  values(): number[];
}
