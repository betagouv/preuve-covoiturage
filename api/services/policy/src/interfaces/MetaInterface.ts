export interface MetaInterface {
  signature: any;
  get(key: string, fallback?: any): any;
  set(key: string, data: any): void;
  all(): { [k: string]: any };
  keys(): string[];
}
