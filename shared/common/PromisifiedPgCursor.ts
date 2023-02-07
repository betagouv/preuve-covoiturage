export interface PgCursorHandler<T> {
  read: (count: number) => Promise<T[]>;
  release?: Function;
}
