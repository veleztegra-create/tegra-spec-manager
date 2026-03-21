const HEX_COLOR_PATTERN = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i;

export function clampLimit(rawLimit, defaultValue = 20, maxValue = 100) {
  const parsed = Number(rawLimit);
  if (!Number.isFinite(parsed)) return defaultValue;
  const integer = Math.trunc(parsed);
  if (integer < 1) return 1;
  return Math.min(integer, maxValue);
}

export function toOptionalString(value) {
  if (value === undefined || value === null) return null;
  const normalized = String(value).trim();
  return normalized.length > 0 ? normalized : null;
}

export function normalizeDateOrNow(value) {
  const date = value ? new Date(value) : new Date();
  return Number.isNaN(date.getTime()) ? new Date() : date;
}

export function normalizeHex(hex) {
  const normalized = String(hex || '').trim();
  if (HEX_COLOR_PATTERN.test(normalized)) return normalized;
  return '#000000';
}

export function normalizeRgb(rgb) {
  const source = rgb && typeof rgb === 'object' ? rgb : {};
  const parseChannel = (channel) => {
    const parsed = Number(source[channel]);
    if (!Number.isFinite(parsed)) return 0;
    const integer = Math.trunc(parsed);
    return Math.max(0, Math.min(255, integer));
  };

  return {
    r: parseChannel('r'),
    g: parseChannel('g'),
    b: parseChannel('b')
  };
}

export function clampColorThreshold(value, defaultValue = 155) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return defaultValue;
  return Math.max(0, Math.min(255, Math.trunc(parsed)));
}

export function calculateLuminance(rgb) {
  const normalized = normalizeRgb(rgb);
  return Number(((normalized.r * 0.299) + (normalized.g * 0.587) + (normalized.b * 0.114)).toFixed(2));
}

export function normalizeColor(color = {}, index = 0, classificationThreshold = 155) {
  const rgbJson = normalizeRgb(color.rgb);
  const luminance = Number.isFinite(Number(color.luminance))
    ? Number(Number(color.luminance).toFixed(2))
    : calculateLuminance(rgbJson);
  const normalizedTone = String(color.toneCategory || '').trim().toLowerCase();

  return {
    orderIndex: index,
    name: toOptionalString(color.name),
    suggestedName: toOptionalString(color.suggestedName),
    hex: normalizeHex(color.hex),
    rgbJson,
    toneCategory: normalizedTone === 'light' || normalizedTone === 'dark'
      ? normalizedTone
      : (luminance >= classificationThreshold ? 'light' : 'dark'),
    luminance,
    ocrRawText: toOptionalString(color.ocrRawText),
    manuallyCorrected: Boolean(color.manuallyCorrected)
  };
}

export function normalizePalettePayload(body = {}) {
  const classificationThreshold = clampColorThreshold(body.classificationThreshold);
  const colors = Array.isArray(body.colors)
    ? body.colors.map((color, index) => normalizeColor(color, index, classificationThreshold))
    : [];

  const totalColors = Number(body.totalColors);

  return {
    source: toOptionalString(body.source) || 'dashboard-techpack-palette-extractor',
    extractedAt: normalizeDateOrNow(body.extractedAt),
    totalColors: Number.isFinite(totalColors) && totalColors >= 0 ? Math.trunc(totalColors) : colors.length,
    classificationThreshold,
    colors,
    payloadJson: body
  };
}

export function normalizeSpecPayload(payload = {}) {
  const fallbackGeneralData = {
    customer: payload.customer,
    style: payload.style,
    folder: payload.folder,
    colorway: payload.colorway,
    season: payload.season,
    pattern: payload.pattern,
    po: payload.po,
    sampleType: payload.sampleType,
    nameTeam: payload.nameTeam,
    gender: payload.gender,
    designer: payload.designer,
    baseSize: payload.baseSize,
    fabric: payload.fabric,
    technicianName: payload.technicianName,
    technicalComments: payload.technicalComments,
    program: payload.program,
    specDate: payload.specDate
  };

  const hasFallbackGeneralData = Object.values(fallbackGeneralData).some((value) => value !== undefined);

  const generalData = payload.generalData && typeof payload.generalData === 'object'
    ? payload.generalData
    : (hasFallbackGeneralData ? fallbackGeneralData : {});

  const placements = Array.isArray(payload.placements)
    ? payload.placements.filter((placement) => placement && typeof placement === 'object')
    : [];

  return {
    generalData,
    placements,
    meta: payload.meta && typeof payload.meta === 'object' ? payload.meta : {}
  };
}

export function mapPlacementForDb(placement = {}, index = 0) {
  return {
    orderIndex: index,
    type: toOptionalString(placement.type),
    name: toOptionalString(placement.name),
    placementDetails: toOptionalString(placement.placementDetails),
    specialInstructions: toOptionalString(placement.specialInstructions),
    dimensions: toOptionalString(placement.dimensions),
    baseSize: toOptionalString(placement.baseSize),
    inkType: toOptionalString(placement.inkType),
    colorsJson: placement.colors || null,
    sequenceJson: placement.sequence || null
  };
}
