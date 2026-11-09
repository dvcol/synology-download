/**
 * Password encryption at rest (AES-256-GCM).
 *
 * The key is generated once, is not extractable and lives in the extension origin's IndexedDB, so it is shared by the
 * service worker and the extension pages but never leaves the browser profile. Encrypted values are prefixed so plain
 * values (saved before encryption existed) keep working and are never encrypted twice.
 *
 * Encryption is asynchronous: it must happen in page context before dispatching, never inside a reducer.
 */

export const EncryptedPrefix = 'aesgcm.v1:';

const DatabaseName = 'synology-download-crypto';
const StoreName = 'keys';
const KeyName = 'password';
const IvLength = 12;

export const isEncrypted = (value?: string): value is string => !!value?.startsWith(EncryptedPrefix);

const toBase64 = (bytes: Uint8Array): string => btoa(String.fromCharCode(...bytes));
const fromBase64 = (value: string): Uint8Array => Uint8Array.from(atob(value), c => c.charCodeAt(0));

export async function generateKey(): Promise<CryptoKey> {
  return crypto.subtle.generateKey({ name: 'AES-GCM', length: 256 }, false, ['encrypt', 'decrypt']);
}

export async function encryptWithKey(key: CryptoKey, plain: string): Promise<string> {
  const iv = crypto.getRandomValues(new Uint8Array(IvLength));
  const cipher = new Uint8Array(await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, new TextEncoder().encode(plain)));
  const payload = new Uint8Array(iv.length + cipher.length);
  payload.set(iv);
  payload.set(cipher, iv.length);
  return `${EncryptedPrefix}${toBase64(payload)}`;
}

export async function decryptWithKey(key: CryptoKey, value: string): Promise<string> {
  const payload = fromBase64(value.slice(EncryptedPrefix.length));
  const plain = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: payload.slice(0, IvLength) }, key, payload.slice(IvLength));
  return new TextDecoder().decode(plain);
}

async function request<T>(req: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error ?? new Error('IndexedDB request failed'));
  });
}

async function openDatabase(): Promise<IDBDatabase> {
  const req = indexedDB.open(DatabaseName, 1);
  req.onupgradeneeded = () => req.result.createObjectStore(StoreName);
  return request(req);
}

async function readKey(db: IDBDatabase): Promise<CryptoKey | undefined> {
  return request(db.transaction(StoreName).objectStore(StoreName).get(KeyName) as IDBRequest<CryptoKey | undefined>);
}

/** Read the stored key, creating it on first use (another context may create it concurrently: the first one wins). */
async function getKey(): Promise<CryptoKey> {
  const db = await openDatabase();
  try {
    const existing = await readKey(db);
    if (existing) return existing;
    const key = await generateKey();
    try {
      await request(db.transaction(StoreName, 'readwrite').objectStore(StoreName).add(key, KeyName));
      return key;
    } catch {
      const winner = await readKey(db);
      if (winner) return winner;
      throw new Error('Failed to store the encryption key');
    }
  } finally {
    db.close();
  }
}

/** Encrypt a password for storage. Empty or already encrypted values are returned unchanged. */
export async function encryptPassword(password?: string): Promise<string | undefined> {
  if (!password || isEncrypted(password)) return password;
  return encryptWithKey(await getKey(), password);
}

/** Decrypt a stored password. Plain (legacy) values are returned unchanged. */
export async function decryptPassword(password?: string): Promise<string | undefined> {
  if (!isEncrypted(password)) return password;
  return decryptWithKey(await getKey(), password);
}
