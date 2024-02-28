export type FactoryType<T> = (...args: any[]) => ((...args: any[]) => T) | T;
