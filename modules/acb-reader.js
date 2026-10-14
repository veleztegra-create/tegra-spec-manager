const SIGNATURE = '8BCB';
const MAX_COLORS = 8000;
const MAX_STRING_CHARS = 1_000_000;

/**
 * Decode Adobe Color Book (ACB) v1 books.
 * Supports RGB (0) and CIELAB D50 (7). Lab values are retained and converted
 * to sRGB only for the application's on-screen swatches and HTML/PDF previews.
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
  if (![0, 7].includes(colorModelId)) {
    const modelName = colorModelId === 2 ? 'CMYK (2)' : `modelo ${colorModelId}`;
    throw new Error(`Modelo de color ACB no compatible todavía: ${modelName}. Se admiten RGB (0) y Lab (7).`);
  }

  const colors = [];
  for (let i = 0; i < colorCount; i++) {
    const rawName = readString(`nombre del color ${i + 1}`);
    ensure(9, `código y componentes del color ${i + 1}`);
    const codeBytes = bytes.slice(offset, offset + 6);
    if (codeBytes.some((byte) => byte < 0x20 || byte > 0x7e)) {
      throw new Error(`Código no ASCII imprimible en el color ${i + 1}.`);
    }
    const code = String.fromCharCode(...codeBytes);
    offset += 6;
    const components = [bytes[offset], bytes[offset + 1], bytes[offset + 2]];
    offset += 3;

    let rgb;
    let lab = null;
    if (colorModelId === 0) {
      rgb = { r: components[0], g: components[1], b: components[2] };
    } else {
      lab = {
        l: components[0] * 100 / 255,
        a: components[1] - 128,
        b: components[2] - 128
      };
      rgb = labD50ToSrgb(lab);
    }
    const hex = `#${[rgb.r, rgb.g, rgb.b].map((n) => n.toString(16).padStart(2, '0')).join('').toUpperCase()}`;
    colors.push({
      index: i,
      name: `${colorNamePrefix}${rawName}${colorNamePostfix}`,
      rawName,
      code,
      rgb,
      hex,
      ...(lab ? { lab } : {})
    });
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
    colorModel: colorModelId === 0 ? 'RGB' : 'Lab',
    colorModelId,
    spotProcessIdentifier,
    colors
  };
}

function labD50ToSrgb({ l, a, b }) {
  const epsilon = 216 / 24389;
  const kappa = 24389 / 27;
  const fy = (l + 16) / 116;
  const fx = fy + a / 500;
  const fz = fy - b / 200;
  const inverse = (value) => {
    const cube = value ** 3;
    return cube > epsilon ? cube : (116 * value - 16) / kappa;
  };

  // CIELAB D50 reference white, then Bradford adaptation from D50 to D65.
  const x50 = 0.96422 * inverse(fx);
  const y50 = inverse(fy);
  const z50 = 0.82521 * inverse(fz);
  const x = 0.9555766 * x50 - 0.0230393 * y50 + 0.0631636 * z50;
  const y = -0.0282895 * x50 + 1.0099416 * y50 + 0.0210077 * z50;
  const z = 0.0122982 * x50 - 0.0204830 * y50 + 1.3299098 * z50;

  const linearToSrgb = (value) => {
    const channel = value <= 0.0031308 ? 12.92 * value : 1.055 * (Math.max(0, value) ** (1 / 2.4)) - 0.055;
    return Math.round(Math.max(0, Math.min(1, channel)) * 255);
  };
  return {
    r: linearToSrgb(3.2404542 * x - 1.5371385 * y - 0.4985314 * z),
    g: linearToSrgb(-0.9692660 * x + 1.8760108 * y + 0.0415560 * z),
    b: linearToSrgb(0.0556434 * x - 0.2040259 * y + 1.0572252 * z)
  };
}

function toBytes(input) {
  if (input instanceof Uint8Array) return input;
  if (input instanceof ArrayBuffer) return new Uint8Array(input);
  if (ArrayBuffer.isView(input)) return new Uint8Array(input.buffer, input.byteOffset, input.byteLength);
  throw new TypeError('decodeAcb espera un ArrayBuffer o Uint8Array.');
}
