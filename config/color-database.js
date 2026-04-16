// color-database.js - base de datos global para frontend (lookup por nombre)
(function (global) {
  const colorDatabase = [
    {
      name: 'BLUSTERY 45W',
      hex: '#006673',
      rgb: { r: 0, g: 102, b: 115 },
      luminance: 72.98,
      toneCategory: 'light',
      properties: { opacity: 'medium', recommendedInk: 'waterbased', contrastText: 'black' }
    },
    {
      name: 'OLD ROYAL 4DA',
      hex: '#304080',
      rgb: { r: 48, g: 64, b: 128 },
      luminance: 66.51,
      toneCategory: 'light',
      properties: { opacity: 'medium', recommendedInk: 'waterbased', contrastText: 'black' }
    },
    {
      name: 'ANTHRACITE O6F',
      hex: '#404045',
      rgb: { r: 64, g: 64, b: 69 },
      luminance: 64.57,
      toneCategory: 'light',
      properties: { opacity: 'high', recommendedInk: 'waterbased', contrastText: 'black' }
    },
    {
      name: 'OFF NOIR OAV',
      hex: '#353535',
      rgb: { r: 53, g: 53, b: 53 },
      luminance: 53,
      toneCategory: 'dark',
      properties: { opacity: 'high', recommendedInk: 'plastisol', contrastText: 'white' }
    }
  ];

  global.ColorDatabase = colorDatabase;
})(typeof window !== 'undefined' ? window : globalThis);
