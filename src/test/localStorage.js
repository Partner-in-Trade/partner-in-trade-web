export class MemoryStorage {
  constructor() {
    this.store = {};
  }

  clear() {
    this.store = {};
  }

  getItem(key) {
    return this.store[key] ?? null;
  }

  setItem(key, value) {
    this.store[key] = String(value);
  }

  removeItem(key) {
    delete this.store[key];
  }
}

export function installMemoryLocalStorage() {
  const storage = new MemoryStorage();
  vi.stubGlobal('localStorage', storage);
  return storage;
}
