// config-color.js - Capa unificada para búsqueda de colores
(function (global) {
  const ColorConfig = {
    db: {
      institutional: {},
      pantone: {},
      metallic: {},
      coated: {},
      all: {}
    },

    normalizeLookupKey(input) {
      return String(input || '')
        .toUpperCase()
        .trim()
        .replace(/[_\s]+/g, '-')
        .replace(/-+/g, '-');
    },

    normalizePantoneInput(input) {
      return String(input || '')
        .toLowerCase()
        .trim()
        .replace(/pantone\s*/g, '')
        .replace(/[_\s]+/g, '-')
        .replace(/-+/g, '-');
    },

    buildFromSources() {
      const merged = {};

      const addEntry = (key, hex, bucket = 'all') => {
        if (!key || !hex) return;
        const normalizedKey = this.normalizeLookupKey(key);
        const entry = { key: normalizedKey, hex };
        this.db[bucket][normalizedKey] = entry;
        this.db.all[normalizedKey] = entry;

        // Index pantone-like codes for entradas como "287 C"
        const m = normalizedKey.match(/(?:PANTONE-)?(\d{3,4})-?([A-Z])/);
        if (m) {
          const pantoneCode = `${m[1].toLowerCase()}-${m[2].toLowerCase()}`;
          this.db.pantone[pantoneCode] = { key: pantoneCode, hex };
        }
      };

      // Base mínima pantone coated (evita fallos de búsqueda por formato)
      addEntry('PANTONE_287_C', '#002F6C', 'coated');

      // 1) Config.COLOR_DATABASES
      const cfgDbs = global.Config?.COLOR_DATABASES || {};
      Object.entries(cfgDbs).forEach(([dbName, db]) => {
        if (!db || typeof db !== 'object') return;
        Object.entries(db).forEach(([key, data]) => {
          if (!data || !data.hex) return;
          const bucket = dbName.toUpperCase().includes('PANTONE') ? 'coated' : 'institutional';
          addEntry(key, data.hex, bucket);
        });
      });

      // 2) TeamsConfig.colors (mientras se termina la transición)
      ['NCAA', 'NBA', 'NFL'].forEach((league) => {
        const colors = global.TeamsConfig?.[league]?.colors;
        if (!colors) return;
        ['institutional', 'metallic', 'alt', 'uni'].forEach((category) => {
          const categoryMap = colors[category];
          if (!categoryMap || typeof categoryMap !== 'object') return;
          Object.entries(categoryMap).forEach(([key, data]) => {
            if (!data || !data.hex) return;
            const bucket = category === 'metallic' ? 'metallic' : 'institutional';
            addEntry(key, data.hex, bucket);
          });
        });
      });

      return this.db;
    },

    findColorHex(input) {
      if (!input) return null;

      const raw = String(input).trim();
      const hexMatch = raw.match(/#([0-9A-Fa-f]{6})/);
      if (hexMatch) return `#${hexMatch[1].toUpperCase()}`;

      const normalized = this.normalizeLookupKey(raw);
      const normalizedPantone = this.normalizePantoneInput(raw);

      // 1) Pantone exacta por código normalizado (ej: 287-c)
      if (this.db.pantone[normalizedPantone]) return this.db.pantone[normalizedPantone].hex;

      // 2) Exacta en catálogo general
      if (this.db.all[normalized]) return this.db.all[normalized].hex;

      // 3) Fuzzy includes (controlado)
      for (const [key, entry] of Object.entries(this.db.all)) {
        if (normalized.includes(key) || key.includes(normalized)) {
          return entry.hex;
        }
      }

      return null;
    }
  };

  ColorConfig.buildFromSources();

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = ColorConfig;
  }
  global.ColorConfig = ColorConfig;
})(typeof window !== 'undefined' ? window : globalThis);
