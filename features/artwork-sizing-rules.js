// Artwork sizing rules — every variant is calculated from the user-entered 100% original.
(function (global) {
  'use strict';
  const MM_TO_INCH = 1 / 25.4;

  function number(value) {
    const parsed = Number.parseFloat(String(value ?? '').replace(',', '.'));
    return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
  }
  function format(value, decimals = 2) {
    return (Math.round(value * Math.pow(10, decimals)) / Math.pow(10, decimals)).toFixed(decimals);
  }
  function isFrontOrBack(placement) {
    const type = String(placement?.type || '').trim().toUpperCase();
    return type === 'FRONT' || type === 'BACK';
  }
  function descriptors(placement, data) {
    return [
      placement?.fabric, placement?.fabricContent, placement?.program, placement?.title, placement?.type,
      data?.fabric, data?.fabricContent, data?.program, data?.sampleType, data?.category, data?.customer
    ].filter(Boolean).join(' ').toUpperCase();
  }
  function size(label, width, height, rule, precision = 2) {
    return { label, width: format(width, precision), height: format(height, precision), rule, precision };
  }
  function applyOverrides(placement, sizes) {
    const overrides = placement?.automaticArtworkSizeOverrides || {};
    return sizes.map(item => {
      const override = overrides[item.rule] || {};
      const width = number(override.width);
      const height = number(override.height);
      return {
        ...item,
        width: width ? format(width, item.precision || 2) : item.width,
        height: height ? format(height, item.precision || 2) : item.height
      };
    });
  }
  function getAutomaticSizes(placement = {}, data = {}) {
    if (!isFrontOrBack(placement)) return [];
    const width = number(placement.width);
    const height = number(placement.height);
    if (!width || !height) return [];

    const context = descriptors(placement, data);
    const inkType = String(placement.inkType || data.inkType || '').trim().toUpperCase();

    // PPF artwork adjustment: +3 mm to each overall dimension.
    // This remains separate from pattern-piece shrinkage.
    if (context.includes('PPF')) {
      const addition = 3 * MM_TO_INCH;
      return applyOverrides(placement, [size('PPF +3 mm', width + addition, height + addition, 'PPF_PLUS_3MM', 3)]);
    }

    // Twill: 101%, then 101% with 4 mm added to each overall dimension.
    if (context.includes('TWILL')) {
      const scaledWidth = width * 1.01;
      const scaledHeight = height * 1.01;
      const addition = 4 * MM_TO_INCH;
      return applyOverrides(placement, [
        size('101%', scaledWidth, scaledHeight, 'TWILL_101'),
        size('101% + 4 mm', scaledWidth + addition, scaledHeight + addition, 'TWILL_101_PLUS_4MM')
      ]);
    }

    if (context.includes('NCAA')) {
      const percentage = inkType === 'SILICONE' ? 1 : 2.5;
      const factor = 1 + percentage / 100;
      return applyOverrides(placement, [size(
        percentage === 1 ? '101% (NCAA Silicone)' : '102.5% (NCAA)',
        width * factor,
        height * factor,
        percentage === 1 ? 'NCAA_SILICONE_1' : 'NCAA_2_5'
      )]);
    }
    return [];
  }

  function getManualSizes(placement = {}) {
    return Array.isArray(placement.additionalArtworkSizes)
      ? placement.additionalArtworkSizes.filter(item => item && typeof item === 'object')
      : [];
  }

  global.ArtworkSizingRules = { getAutomaticSizes, getManualSizes, isFrontOrBack };
})(typeof window !== 'undefined' ? window : globalThis);
