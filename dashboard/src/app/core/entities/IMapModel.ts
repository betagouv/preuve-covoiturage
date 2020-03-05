export interface MapModel<T, SourceT = any> {
  map(data: SourceT): T;
}
