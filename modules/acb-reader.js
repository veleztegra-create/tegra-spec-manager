const SIGNATURE = '8BCB';
const MAX_COLORS = 8000;
const MAX_STRING_CHARS = 1_000_000;

/**
 * Decode an Adobe Color Book (ACB) binary file.
 * Initial support is intentionally limited to version-1 RGB books (model ID 0).
 * Production metadata such as ink type, white base, and blocker is not part of this format.
 */
export function decodeAcb(input) {
  const bytes = toBytes(input);
  let offset = 0;
  const ensure = (length, label) => {
    if (!Number.isInteger(length) || length < 0 || offset + length > bytes.length) {
      throw new Error(`ACB inválido: archivo truncado al leer ${label}.`);
    }
  };
  const readU16 = (label) => {
    ensure(2, label);
    const value = (bytes[offset] << 8) | bytes[offset + 1];
    offset += 2;
    return value;
  };
  const readU32 = (label) => {
    ensure(4, label);
    const value = bytes[offset] * 0x1000000 + (bytes[offset + 1] << 16) + (bytes[offset + 2] << 8) + bytes[offset + 3];
    offset += 4;
    return value;
  };
  const readString = (label) => {
    const length = readU32(`${label} (longitud)`);
    if (length > MAX_STRING_CHARS) throw new Error(`ACB inválido: longitud excesiva en ${label}.`);
    ensure(length * 2, label);
    let result = '';
    const chunkSize = 4096;
    let chunk = [];
    for (let i = 0; i < length; i++) {
      chunk.push((bytes[offset] << 8) | bytes[offset + 1]);
      offset += 2;
      if (chunk.length === chunkSize) {
        result += String.fromCharCode(...chunk);
        chunk = [];
      }
    }
    if (chunk.length) result += String.fromCharCode(...chunk);
    return result;
  };

  ensure(4, 'firma');
  const signature = String.fromCharCode(...bytes.slice(0, 4));
  offset = 4;
  if (signature !== SIGNATURE) throw new Error('El archivo no tiene la firma Adobe Color Book 8BCB.');

  const version = readU16('versión');
  if (version !== 1) throw new Error(`Versión ACB no compatible: ${version}.`);
  const bookId = readU16('ID del libro');
  const title = readString('título');
  const colorNamePrefix = readString('prefijo');
  const colorNamePostfix = readString('sufijo');
  const description = readString('descripción');
  const colorCount = readU16('cantidad de colores');
  const pageSize = readU16('tamaño de página');
  const pageKey = readU16('clave de página');
  const colorModelId = readU16('modelo de color');

  if (colorCount > MAX_COLORS) throw new Error(`Cantidad de colores fuera de rango: ${colorCount}.`);
  if (pageSize > 9) throw new Error(`Tamaño de página ACB fuera de rango: ${pageSize}.`);
  if (pageSize > 0 && pageKey > pageSize) throw new Error(`Clave de página inválida: ${pageKey}.`);
  if (colorModelId !== 0) {
    throw new Error(`Modelo de color ACB no compatible todavía: ${colorModelId}. Solo se admite RGB (0).`);
  }

  const colors = [];
  for (let i = 0; i < colorCount; i++) {
    const rawName = readString(`nombre del color ${i + 1}`);
    ensure(9, `código y RGB del color ${i + 1}`);
    const codeBytes = bytes.slice(offset, offset + 6);
    if (codeBytes.some((byte) => byte < 0x20 || byte > 0x7e)) {
      throw new Error(`Código no ASCII imprimible en el color ${i + 1}.`);
    }
    const code = String.fromCharCode(...codeBytes);
    offset += 6;
    const rgb = { r: bytes[offset], g: bytes[offset + 1], b: bytes[offset + 2] };
    offset += 3;
    const hex = `#${[rgb.r, rgb.g, rgb.b].map((n) => n.toString(16).padStart(2, '0')).join('').toUpperCase()}`;
    colors.push({ index: i, name: `${colorNamePrefix}${rawName}${colorNamePostfix}`, rawName, code, rgb, hex });
  }

  let spotProcessIdentifier = null;
  const remaining = bytes.length - offset;
  if (remaining === 8) {
    spotProcessIdentifier = String.fromCharCode(...bytes.slice(offset));
    if (!['spflspot', 'spflproc'].includes(spotProcessIdentifier)) {
      throw new Error(`Identificador spot/process no reconocido: ${spotProcessIdentifier}.`);
    }
    offset += 8;
  } else if (remaining !== 0) {
    throw new Error(`ACB inválido: quedan ${remaining} bytes inesperados después de los colores.`);
  }

  return {
    schemaVersion: 1,
    sourceFormat: 'ACB',
    version,
    bookId,
    title,
    colorNamePrefix,
    colorNamePostfix,
    description,
    colorCount,
    pageSize,
    pageKey,
    colorModel: 'RGB',
    colorModelId,
    spotProcessIdentifier,
    colors
  };
}

function toBytes(input) {
  if (input instanceof Uint8Array) return input;
  if (input instanceof ArrayBuffer) return new Uint8Array(input);
  if (ArrayBuffer.isView(input)) return new Uint8Array(input.buffer, input.byteOffset, input.byteLength);
  throw new TypeError('decodeAcb espera un ArrayBuffer o Uint8Array.');
}
