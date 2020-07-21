export class Cache {
  private db: Map<any, any> = new Map();

  put(key: any, value: any) {
    this.db.set(key, value);
  }

  get(key: any) {
    return this.db.get(key);
  }

  del(key: any) {
    this.db.delete(key);
  }

  clear() {
    this.db.clear();
  }
}
