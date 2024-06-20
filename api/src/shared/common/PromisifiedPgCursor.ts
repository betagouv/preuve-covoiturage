export interface PgCursorHandler<T> {
  read: (rowCount: number) => Promise<T[]>;
  release: () => Promise<void>;
}
