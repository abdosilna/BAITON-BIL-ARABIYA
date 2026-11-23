import type { StorageAdapter } from './StorageAdapter';

const KEY_PREFIX = 'baiton_ar_pref_';

export class LocalStorageAdapter implements StorageAdapter {
  private memoryFallback = new Map<string, string>();

  private getStorage(): Storage | null {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        return window.localStorage;
      }
    } catch {
      return null;
    }
    return null;
  }

  getItem<T>(key: string, fallback: T): T {
    const namespaced = `${KEY_PREFIX}${key}`;
    try {
      const storage = this.getStorage();
      const raw = storage ? storage.getItem(namespaced) : this.memoryFallback.get(namespaced);
      if (raw === null || raw === undefined) return fallback;
      return JSON.parse(raw) as T;
    } catch {
      return fallback;
    }
  }

  setItem<T>(key: string, value: T): boolean {
    const namespaced = `${KEY_PREFIX}${key}`;
    try {
      const serialized = JSON.stringify(value);
      const storage = this.getStorage();
      if (storage) {
        storage.setItem(namespaced, serialized);
      } else {
        this.memoryFallback.set(namespaced, serialized);
      }
      return true;
    } catch {
      return false;
    }
  }

  removeItem(key: string): void {
    const namespaced = `${KEY_PREFIX}${key}`;
    try {
      const storage = this.getStorage();
      if (storage) {
        storage.removeItem(namespaced);
      }
      this.memoryFallback.delete(namespaced);
    } catch {
      // Ignore storage access failures gracefully
    }
  }

  clearPrefix(prefix: string): void {
    const fullPrefix = `${KEY_PREFIX}${prefix}`;
    try {
      const storage = this.getStorage();
      if (storage) {
        const toRemove: string[] = [];
        for (let i = 0; i < storage.length; i += 1) {
          const k = storage.key(i);
          if (k && k.startsWith(fullPrefix)) {
            toRemove.push(k);
          }
        }
        toRemove.forEach((k) => storage.removeItem(k));
      }
      for (const k of Array.from(this.memoryFallback.keys())) {
        if (k.startsWith(fullPrefix)) {
          this.memoryFallback.delete(k);
        }
      }
    } catch {
      // Ignore
    }
  }
}

export const localStorageAdapter = new LocalStorageAdapter();
