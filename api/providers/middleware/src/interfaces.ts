export type UnconfiguredMiddleware = string;
export type ConfiguredMiddleware<P = any> = [string, P];
export type ListOfConfiguredMiddlewares<P = any> = ConfiguredMiddleware<P>[];
