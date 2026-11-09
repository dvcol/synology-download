import { decryptPassword, decryptWithKey, EncryptedPrefix, encryptPassword, encryptWithKey, generateKey, isEncrypted } from './crypto.utils';

describe('crypto.utils', () => {
  it('round-trips a password with a generated key', async () => {
    expect.assertions(3);
    const key = await generateKey();
    const encrypted = await encryptWithKey(key, 'p@ssw0rd ñ 密码');
    expect(isEncrypted(encrypted)).toBe(true);
    expect(encrypted).not.toContain('p@ssw0rd');
    await expect(decryptWithKey(key, encrypted)).resolves.toBe('p@ssw0rd ñ 密码');
  });

  it('uses a random iv for every encryption', async () => {
    expect.assertions(1);
    const key = await generateKey();
    expect(await encryptWithKey(key, 'same')).not.toBe(await encryptWithKey(key, 'same'));
  });

  it('fails to decrypt with another key', async () => {
    expect.assertions(1);
    const encrypted = await encryptWithKey(await generateKey(), 'secret');
    await expect(decryptWithKey(await generateKey(), encrypted)).rejects.toThrow();
  });

  it('fails to decrypt a tampered value', async () => {
    expect.assertions(1);
    const key = await generateKey();
    const encrypted = await encryptWithKey(key, 'secret');
    const tampered = `${encrypted.slice(0, -4)}AAAA`;
    await expect(decryptWithKey(key, tampered)).rejects.toThrow();
  });

  it('detects the encrypted prefix', () => {
    expect.assertions(3);
    expect(isEncrypted(`${EncryptedPrefix}abc`)).toBe(true);
    expect(isEncrypted('plain')).toBe(false);
    expect(isEncrypted(undefined)).toBe(false);
  });

  it('passes empty values through without touching storage', async () => {
    expect.assertions(4);
    await expect(encryptPassword('')).resolves.toBe('');
    await expect(encryptPassword(undefined)).resolves.toBeUndefined();
    await expect(decryptPassword('')).resolves.toBe('');
    await expect(decryptPassword(undefined)).resolves.toBeUndefined();
  });

  it('never encrypts twice and keeps legacy plain passwords readable', async () => {
    expect.assertions(2);
    const already = `${EncryptedPrefix}abc`;
    await expect(encryptPassword(already)).resolves.toBe(already);
    await expect(decryptPassword('legacy-plain')).resolves.toBe('legacy-plain');
  });
});
