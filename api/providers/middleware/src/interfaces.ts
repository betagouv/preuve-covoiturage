export type ParametredMiddleware<P = any> = [string, P];
export type ListOfParametredMiddlewares<P = any> = ParametredMiddleware<P>[];
