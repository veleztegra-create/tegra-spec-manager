// config-color.js - Capa unificada para búsqueda de colores
(function (global) {
  const DEFAULT_PANTONE_COATED = {
    '100-C': '#F6EB61', '101-C': '#F7EA48', '102-C': '#FCE300', '103-C': '#C5A900',
    '104-C': '#AF9800', '105-C': '#897A27', '106-C': '#F9E547', '107-C': '#FBE122',
    '108-C': '#F8D400', '109-C': '#FFD100', '110-C': '#DAAA00', '111-C': '#AA8A00',
    '112-C': '#9C8412', '113-C': '#FDD757', '114-C': '#FDDC5C', '115-C': '#FEEA95',
    '116-C': '#FFCD00', '117-C': '#C99700', '118-C': '#AC8400', '119-C': '#897322',
    '120-C': '#FEDB8A', '121-C': '#FDDFA0', '122-C': '#FED141', '123-C': '#FFC72C',
    '124-C': '#EAAA00', '125-C': '#B58500', '126-C': '#9A7611', '130-C': '#F2A900',
    '137-C': '#FFA300', '151-C': '#FF8200', '158-C': '#FF6A13', '165-C': '#FF6720',
    '172-C': '#FA4616', '1788-C': '#EE2737', '185-C': '#E4002B', '186-C': '#C8102E',
    '187-C': '#A6192E', '199-C': '#D50032', '200-C': '#BA0C2F', '201-C': '#9D2235',
    '202-C': '#862633', '203-C': '#8A1538', '206-C': '#CE0037', '214-C': '#D50057',
    '218-C': '#E00083', '226-C': '#D0006F', '234-C': '#AA0061', '2395-C': '#EF4A81',
    '262-C': '#582C83', '268-C': '#582C83', '2727-C': '#307FE2', '2736-C': '#1C3F95',
    '274-C': '#10069F', '275-C': '#003087', '2767-C': '#13294B', '280-C': '#012169',
    '281-C': '#00205B', '282-C': '#041E42', '286-C': '#0033A0', '287-C': '#002F6C',
    '288-C': '#003594', '289-C': '#0C2340', '290-C': '#B9D9EB', '291-C': '#9BCBEB',
    '292-C': '#6CC5E9', '293-C': '#003DA5', '294-C': '#002F87', '295-C': '#003A70',
    '300-C': '#005EB8', '301-C': '#004B87', '302-C': '#003B5C', '303-C': '#002A3A',
    '306-C': '#00B5E2', '307-C': '#0077C8', '310-C': '#67C8FF', '312-C': '#00A9CE',
    '320-C': '#009CA6', '321-C': '#008E97', '322-C': '#007377', '325-C': '#64CCC9',
    '326-C': '#00BFB3', '327-C': '#00A499', '328-C': '#009B77', '329-C': '#008264',
    '330-C': '#006A52', '333-C': '#3CDBC0', '339-C': '#00B388', '340-C': '#00965E',
    '342-C': '#006341', '343-C': '#00573F', '347-C': '#009A44', '348-C': '#00843D',
    '349-C': '#046A38', '350-C': '#2C5234', '354-C': '#00B140', '355-C': '#009639',
    '356-C': '#007A33', '357-C': '#215732', '361-C': '#43B02A', '362-C': '#509E2F',
    '363-C': '#4C8C2B', '364-C': '#4A7729', '365-C': '#B2D235', '366-C': '#A4D65E',
    '367-C': '#A2C523', '368-C': '#78BE20', '369-C': '#64A70B', '370-C': '#658D1B',
    '375-C': '#97D700', '376-C': '#84BD00', '377-C': '#7A9A01', '378-C': '#596E35',
    '382-C': '#D2D755', '383-C': '#A4AA00', '384-C': '#949300', '385-C': '#786D1B',
    '390-C': '#B5BD00', '391-C': '#9A9500', '392-C': '#8A8D00', '393-C': '#B1B800',
    '394-C': '#B7BF10', '395-C': '#A3AA00', '430-C': '#7C878E', '431-C': '#5B6770',
    '432-C': '#333F48', '433-C': '#1D252D', '444-C': '#6D747A', '445-C': '#505759',
    '446-C': '#2C2F31', 'Cool-Gray-1-C': '#D9D9D6', 'Cool-Gray-3-C': '#C8C9C7',
    'Cool-Gray-5-C': '#B1B3B3', 'Cool-Gray-7-C': '#97999B', 'Cool-Gray-9-C': '#75787B',
    'Cool-Gray-11-C': '#53565A', 'Black-C': '#2D2926', 'Black-6-C': '#101820',
    'Warm-Gray-1-C': '#D7D2CB', 'Warm-Gray-5-C': '#A8998A', 'Warm-Gray-8-C': '#8D827A',
    'Warm-Gray-11-C': '#6E6259'
  };

  const DEFAULT_PANTONE_METALLIC = {
    '871-C': '#85714D', '872-C': '#8A6F3B', '873-C': '#9A7B3E', '874-C': '#A37F2C',
    '875-C': '#B68E2E', '876-C': '#C69214', '877-C': '#8A8D8F',
    '8001-C': '#8C734B', '8002-C': '#9B7E46', '8003-C': '#A7893C', '8004-C': '#B68B2E',
    '8005-C': '#C49102', '8006-C': '#C6A052', '8007-C': '#D4AF37', '8008-C': '#E0B84F'
  };

  const ColorConfig = {
    db: { institutional: {}, pantone: {}, metallic: {}, coated: {}, all: {} },

    normalizeLookupKey(input) {
      return String(input || '').toUpperCase().trim().replace(/[_\s]+/g, '-').replace(/-+/g, '-');
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
      // reset
      this.db = { institutional: {}, pantone: {}, metallic: {}, coated: {}, all: {} };

      const addEntry = (key, hex, bucket = 'all') => {
        if (!key || !hex) return;
        const normalizedKey = this.normalizeLookupKey(key);
        const entry = { key: normalizedKey, hex };
        this.db[bucket][normalizedKey] = entry;
        this.db.all[normalizedKey] = entry;

        const m = normalizedKey.match(/(?:PANTONE-)?(\d{3,4})-?([A-Z])/);
        if (m) {
          const pantoneCode = `${m[1].toLowerCase()}-${m[2].toLowerCase()}`;
          this.db.pantone[pantoneCode] = { key: pantoneCode, hex };
        }
      };

      // 0) Defaults Pantone (coated/metallic)
      Object.entries(DEFAULT_PANTONE_COATED).forEach(([k, hex]) => addEntry(k, hex, 'coated'));
      Object.entries(DEFAULT_PANTONE_METALLIC).forEach(([k, hex]) => addEntry(k, hex, 'metallic'));

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

      // 2) TeamsConfig.colors (transición segura)
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

    findPantoneHex(input) {
      const normalizedPantone = this.normalizePantoneInput(input);
      return this.db.pantone[normalizedPantone]?.hex || null;
    },

    findColorHex(input) {
      if (!input) return null;

      const raw = String(input).trim();
      const hexMatch = raw.match(/#([0-9A-Fa-f]{6})/);
      if (hexMatch) return `#${hexMatch[1].toUpperCase()}`;

      const normalized = this.normalizeLookupKey(raw);
      const pantoneHex = this.findPantoneHex(raw);
      if (pantoneHex) return pantoneHex;

      if (this.db.all[normalized]) return this.db.all[normalized].hex;

      for (const [key, entry] of Object.entries(this.db.all)) {
        if (normalized.includes(key) || key.includes(normalized)) return entry.hex;
      }

      return null;
    }
  };

  ColorConfig.buildFromSources();

  if (typeof module !== 'undefined' && module.exports) module.exports = ColorConfig;
  global.ColorConfig = ColorConfig;
})(typeof window !== 'undefined' ? window : globalThis);
