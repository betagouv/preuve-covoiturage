export interface IMapModel<T, SourceT = any> {
  map(data: SourceT): T;
}
