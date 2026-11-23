export interface StorageAdapter {
  getItem<T>(key: string, fallback: T): T;
  setItem<T>(key: string, value: T): boolean;
  removeItem(key: string): void;
  clearPrefix(prefix: string): void;
}
