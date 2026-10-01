import { randomBytes, scrypt, timingSafeEqual } from 'node:crypto';
import { promisify } from 'node:util';

/*
 * Hash de senha com scrypt (node:crypto) — sem dependência nativa.
 * Formato salvo: `<salt hex>:<hash hex>`.
 */

const scrypt_async = promisify(scrypt) as (
  password: string,
  salt: Buffer,
  key_length: number,
) => Promise<Buffer>;

const KEY_LENGTH = 64;

async function hash_password(password: string): Promise<string> {
  const salt = randomBytes(16);
  const hash = await scrypt_async(password, salt, KEY_LENGTH);

  return `${salt.toString('hex')}:${hash.toString('hex')}`;
}

async function verify_password(password: string, stored: string): Promise<boolean> {
  const [salt_hex, hash_hex] = stored.split(':');
  if (!salt_hex || !hash_hex) return false;

  const expected = Buffer.from(hash_hex, 'hex');
  const hash = await scrypt_async(password, Buffer.from(salt_hex, 'hex'), expected.length);

  return timingSafeEqual(hash, expected);
}

export { hash_password, verify_password };
