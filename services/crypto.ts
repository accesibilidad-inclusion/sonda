import { EXPORT_PUBLIC_KEY_JWK, EXPORT_KEY_ID } from '../constants';

function toB64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
  return btoa(binary);
}

/**
 * Cifra un Blob con AES-256-GCM (clave de un solo uso) y envuelve esa clave
 * con RSA-OAEP usando la clave pública del equipo investigador.
 * Devuelve un Blob JSON (.sonda) con la cabecera legible + el contenido cifrado.
 */
export async function encryptExport(blob: Blob): Promise<Blob> {
  const publicKey = await crypto.subtle.importKey(
    'jwk',
    EXPORT_PUBLIC_KEY_JWK,
    { name: 'RSA-OAEP', hash: 'SHA-256' },
    false,
    ['encrypt'],
  );

  const aesKey = await crypto.subtle.generateKey(
    { name: 'AES-GCM', length: 256 },
    true,
    ['encrypt'],
  );

  const iv = crypto.getRandomValues(new Uint8Array(12));
  const plaintext = await blob.arrayBuffer();
  const ciphertext = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    aesKey,
    plaintext,
  );

  const rawAes = await crypto.subtle.exportKey('raw', aesKey);
  const encryptedKey = await crypto.subtle.encrypt(
    { name: 'RSA-OAEP' },
    publicKey,
    rawAes,
  );

  const envelope = {
    schemaVersion: '1.0',
    algorithm: 'RSA-OAEP-256+AES-256-GCM',
    keyId: EXPORT_KEY_ID,
    encryptedKey: toB64(encryptedKey),
    iv: toB64(iv.buffer as ArrayBuffer),
    ciphertext: toB64(ciphertext),
  };

  return new Blob([JSON.stringify(envelope)], { type: 'application/json' });
}
