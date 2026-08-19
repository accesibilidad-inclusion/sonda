const DB_NAME = 'sonda';
const DB_VERSION = 1;
let _db: IDBDatabase | null = null;

function openDB(): Promise<IDBDatabase> {
  if (_db) return Promise.resolve(_db);
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = e => {
      const db = (e.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains('data')) db.createObjectStore('data');
    };
    req.onsuccess = e => { _db = (e.target as IDBOpenDBRequest).result; resolve(_db!); };
    req.onerror = () => reject(req.error);
  });
}

export async function idbGet<T>(key: string): Promise<T | null> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const req = db.transaction('data', 'readonly').objectStore('data').get(key);
    req.onsuccess = () => resolve(req.result ?? null);
    req.onerror = () => reject(req.error);
  });
}

export async function idbSet(key: string, value: unknown): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('data', 'readwrite');
    tx.objectStore('data').put(value, key);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function idbClear(): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('data', 'readwrite');
    tx.objectStore('data').clear();
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

/** Solicita persistencia al navegador (evita desalojo silencioso). */
export async function requestPersistence(): Promise<void> {
  if (navigator.storage?.persist) await navigator.storage.persist();
}

/** True si el almacenamiento supera el 85 % de la cuota. */
export async function isStorageCritical(): Promise<boolean> {
  if (!navigator.storage?.estimate) return false;
  const { usage = 0, quota = 1 } = await navigator.storage.estimate();
  return usage / quota > 0.85;
}
