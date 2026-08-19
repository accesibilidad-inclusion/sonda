import { idbGet, idbSet } from './db';

const MIGRATED_KEY = 'sonda_idb_migrated';
// Solo los datos grandes se migran a IDB; los flags permanecen en localStorage.
const LS_DATA_KEYS = ['sonda_progress', 'sonda_usage'];

/**
 * Corre una sola vez: copia los datos grandes de localStorage a IndexedDB.
 * Idempotente: si ya se ejecutó (flag en IDB), sale inmediatamente.
 */
export async function migrateFromLocalStorage(): Promise<void> {
  const done = await idbGet<string>(MIGRATED_KEY);
  if (done) return;

  for (const key of LS_DATA_KEYS) {
    const raw = localStorage.getItem(key);
    if (!raw) continue;
    try {
      await idbSet(key, JSON.parse(raw));
    } catch {
      // valor no-JSON: ignorar
    }
  }

  await idbSet(MIGRATED_KEY, new Date().toISOString());
}
