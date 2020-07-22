export interface ConnectionInterface<T = any> {
  up(): Promise<void>;
  down(): Promise<void>;
  getClient(): T;
}
