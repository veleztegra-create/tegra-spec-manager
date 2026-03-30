// additives-rules.js - reglas dinámicas para aditivos por capa/tinta/contexto
(function (global) {
  const METALLIC_KEYWORDS = ['METALLIC', 'METÁLICO', 'PEARFLEX', 'GLITTER', 'SHIMMER', '871', '872', '873', '874', '875', '876', '877'];

  const rules = [
    {
      id: 'metallic-default',
      when: { layerType: 'METALLIC' },
      additives: '3% cross linker 500 · 3% Binder Flex'
    },
    {
      id: 'water-blocker-default',
      when: { inkType: 'WATER', layerType: 'BLOCKER' },
      additives: 'N/A (sin aditivo)'
    },
    {
      id: 'water-white-default',
      when: { inkType: 'WATER', layerType: 'WHITE_BASE' },
      additives: 'N/A (sin aditivo)'
    },
    {
      id: 'plastisol-color-default',
      when: { inkType: 'PLASTISOL', layerType: 'COLOR' },
      additives: '1 % catalyst'
    }
  ];

  function normalize(value) {
    return String(value || '').trim().toUpperCase();
  }

  function isMetallicColorName(name) {
    const upperName = normalize(name);
    if (!upperName) return false;
    return METALLIC_KEYWORDS.some((keyword) => upperName.includes(keyword));
  }

  function matchRule(rule, context) {
    const when = rule.when || {};

    if (when.inkType && normalize(when.inkType) !== normalize(context.inkType)) return false;
    if (when.layerType && normalize(when.layerType) !== normalize(context.layerType)) return false;
    if (when.customer && normalize(when.customer) !== normalize(context.customer)) return false;
    if (when.fabric && normalize(when.fabric) !== normalize(context.fabric)) return false;
    if (when.colorIncludes && !normalize(context.colorName).includes(normalize(when.colorIncludes))) return false;

    return true;
  }

  function getPresetAdditives(context) {
    const preset = context.preset || {};
    const layerType = normalize(context.layerType);

    if (layerType === 'BLOCKER') return preset?.blocker?.additives || 'N/A';
    if (layerType === 'WHITE_BASE') return preset?.white?.additives || 'N/A';
    return preset?.color?.additives || 'N/A';
  }

  function resolveAdditives(context = {}) {
    const normalizedContext = {
      ...context,
      inkType: normalize(context.inkType || 'WATER'),
      layerType: normalize(context.layerType || 'COLOR'),
      customer: normalize(context.customer),
      fabric: normalize(context.fabric),
      colorName: String(context.colorName || '').trim()
    };

    const placementOverrides = context?.placement?.additivesOverrides;
    if (placementOverrides && typeof placementOverrides === 'object') {
      const override = placementOverrides[normalizedContext.layerType];
      if (override) return { additives: override, source: 'placement-override', ruleId: null };
    }

    if (isMetallicColorName(normalizedContext.colorName) && normalizedContext.layerType === 'COLOR') {
      const metallicRule = rules.find((rule) => rule.when?.layerType === 'METALLIC');
      return {
        additives: metallicRule?.additives || getPresetAdditives(normalizedContext),
        source: metallicRule ? 'rules' : 'preset',
        ruleId: metallicRule?.id || null
      };
    }

    const rule = rules.find((candidate) => matchRule(candidate, normalizedContext));
    if (rule) {
      return { additives: rule.additives, source: 'rules', ruleId: rule.id };
    }

    return { additives: getPresetAdditives(normalizedContext), source: 'preset', ruleId: null };
  }

  global.AdditivesRules = {
    rules,
    resolveAdditives,
    isMetallicColorName
  };
})(typeof window !== 'undefined' ? window : globalThis);
