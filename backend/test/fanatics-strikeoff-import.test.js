import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

function loadFixes(overrides = {}) {
  const window = {
    ExcelAutomation: {
      processExcelWithAutomation() {
        return { sourceSheet: 'SWO', autoPlacements: [] };
      }
    },
    XLSX: {
      utils: {
        sheet_to_json() {
          return strikeOffRows;
        }
      }
    },
    Store: {
      state: {
        generalData: {},
        styleVersion: { number: 1, swoSnapshot: {} }
      }
    },
    ...overrides
  };

  const document = {
    addEventListener() {}
  };

  const context = vm.createContext({ window, globalThis: window, document, console });
  vm.runInContext(
    fs.readFileSync(new URL('../../fixes.js', import.meta.url), 'utf8'),
    context
  );
  return window;
}

const strikeOffRows = [
  ['Customer', 'Fanatics'],
  ['Team Name', 'LAC'],
  ['Request Date', '2026-09-21'],
  ['PO #', '210926SCA'],
  ['Category', 'NFL - Limited'],
  ['Colorway', 'Rivalry'],
  ['Need by Date', '2026-10-04'],
  ['Submit #', '1st Strike Off'],
  ['Description', '37NM-0N4A-97F Los Angeles Chargers-Rivalry Front and Back Number StrikeOff Twill with HSWB'],
  ['Requester', 'Sindy Castro'],
  ['Season', 'FA27'],
  ['Artwork Path', 'https://example.test/artwork/strikeoff.ai'],
  ['Image', ''],
  ['Trim # / IM #', ''],
  ['Type of Embellishment', 'Twill'],
  ['Description', "Front & Back #'s"],
  ['Fabric Code', ''],
  ['Color', ''],
  ['Adhesives', ''],
  ['Backing / Carrier Paper', ''],
  ['Whse', ''],
  ['Total Blocks', ''],
  ['Comments', '']
];

test('Fanatics Strike Off SWO format is normalized without creating screen-print placements', () => {
  const window = loadFixes();
  const normalized = window.FanaticsStrikeOffNormalizer.normalize(strikeOffRows);

  assert.equal(normalized.sourceFormat, 'FANATICS_STRIKE_OFF');
  assert.equal(normalized.customer, 'Fanatics');
  assert.equal(normalized.style, '37NM-0N4A-97F');
  assert.equal(normalized.colorway, 'Rivalry');
  assert.equal(normalized.po, '210926SCA');
  assert.equal(normalized.season, 'FA27');
  assert.equal(normalized.sampleType, '1st Strike Off');
  assert.equal(normalized.requestor, 'Sindy Castro');
  assert.equal(normalized.requestDate, '2026-09-21');
  assert.equal(normalized.needByDate, '2026-10-04');
  assert.equal(normalized.category, 'NFL - Limited');
  assert.equal(normalized.swoSnapshot.description, strikeOffRows[8][1]);
  assert.deepEqual(normalized.autoPlacements, []);
});

test('Fanatics Strike Off style extraction only applies to the recognized format', () => {
  const window = loadFixes();

  assert.equal(
    window.FanaticsStrikeOffNormalizer.extractStyleFromDescription(
      '37NM-0N4A-97F Los Angeles Chargers-Rivalry Front and Back Number StrikeOff'
    ),
    '37NM-0N4A-97F'
  );

  assert.equal(
    window.FanaticsStrikeOffNormalizer.isFanaticsStrikeOff([
      ['Customer', 'Fanatics'],
      ['Description', '37NM-0N4A-97F Something']
    ]),
    false
  );
});

test('StyleVersion preserves extended SWO metadata used by Strike Off imports', () => {
  const window = {};
  const context = vm.createContext({ window, globalThis: window, console });
  vm.runInContext(
    fs.readFileSync(new URL('../../modules/style-version.js', import.meta.url), 'utf8'),
    context
  );

  const version = window.StyleVersion.normalizeStyleVersion({
    number: 1,
    stage: { sampleType: '1st Strike Off', isPPF: false },
    swoSnapshot: {
      sourceFormat: 'FANATICS_STRIKE_OFF',
      requestDate: '2026-09-21',
      needByDate: '2026-10-04',
      category: 'NFL - Limited'
    }
  });

  assert.equal(version.stage.sampleType, '1st Strike Off');
  assert.equal(version.swoSnapshot.sourceFormat, 'FANATICS_STRIKE_OFF');
  assert.equal(version.swoSnapshot.requestDate, '2026-09-21');
  assert.equal(version.swoSnapshot.needByDate, '2026-10-04');
  assert.equal(version.swoSnapshot.category, 'NFL - Limited');
});

test('ExcelAutomation wrapper enriches the imported Strike Off result and preserves zero auto placements', () => {
  const window = loadFixes({
    StyleVersion: {
      normalizeStyleVersion(value, generalData) {
        return {
          ...value,
          normalizedWithGeneralData: generalData
        };
      }
    }
  });

  const result = window.ExcelAutomation.processExcelWithAutomation(
    {},
    'SWO',
    { Sheets: { SWO: {} } }
  );

  assert.equal(result.sourceFormat, 'FANATICS_STRIKE_OFF');
  assert.equal(result.style, '37NM-0N4A-97F');
  assert.equal(result.sampleType, '1st Strike Off');
  assert.equal(result.requestor, 'Sindy Castro');
  assert.deepEqual(result.autoPlacements, []);
  assert.equal(
    window.Store.state.styleVersion.swoSnapshot.sourceFormat,
    'FANATICS_STRIKE_OFF'
  );
});
