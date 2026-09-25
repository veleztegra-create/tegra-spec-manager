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
  assert.equal(normalized.team, 'LAC');
  assert.equal(normalized.style, '37NM-0N4A-97F');
  assert.equal(normalized.colorway, 'Rivalry');
  assert.equal(normalized.po, '210926SCA');
  assert.equal(normalized.season, 'FA27');
  assert.equal(normalized.sampleType, '1st Strike Off');
  assert.equal(normalized.requestor, 'Sindy Castro');
  assert.equal(normalized.category, 'NFL - Limited');
  assert.equal(normalized.swoSnapshot.description, strikeOffRows[8][1]);
  assert.equal(normalized.pattern, '');
  assert.equal(normalized.baseSize, '');
  assert.equal(normalized.requestDate, undefined);
  assert.equal(normalized.needByDate, undefined);
  assert.deepEqual(normalized.autoPlacements, []);
});

test('Fanatics Strike Off source dates are ignored as spec dates', () => {
  const window = loadFixes();
  const rows = strikeOffRows.map((row) => [...row]);

  rows[2][1] = new Date(2026, 8, 21);
  rows[6][1] = new Date(2026, 9, 4);

  const normalized = window.FanaticsStrikeOffNormalizer.normalize(rows);

  assert.equal(normalized.swoSnapshot.requestDate, undefined);
  assert.equal(normalized.swoSnapshot.needByDate, undefined);
  assert.equal(normalized.swoSnapshot.specDate, undefined);
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

test('StyleVersion tracks spec creation/update metadata separately from SWO dates', () => {
  const window = {};
  const context = vm.createContext({ window, globalThis: window, console });
  vm.runInContext(
    fs.readFileSync(new URL('../../modules/style-version.js', import.meta.url), 'utf8'),
    context
  );

  const version = window.StyleVersion.normalizeStyleVersion({
    number: 1,
    stage: { sampleType: '1st Strike Off', isPPF: false },
    createdAt: '2026-09-24T10:00:00.000Z',
    updatedAt: '2026-09-24T11:30:00.000Z',
    updatedBy: 'Elmer Velez',
    swoSnapshot: {
      sourceFormat: 'FANATICS_STRIKE_OFF'
    }
  });

  assert.equal(version.stage.sampleType, '1st Strike Off');
  assert.equal(version.swoSnapshot.sourceFormat, 'FANATICS_STRIKE_OFF');
  assert.equal(version.swoSnapshot.requestDate, undefined);
  assert.equal(version.swoSnapshot.needByDate, undefined);
  assert.equal(version.createdAt, '2026-09-24T10:00:00.000Z');
  assert.equal(version.updatedAt, '2026-09-24T11:30:00.000Z');
  assert.equal(version.updatedBy, 'Elmer Velez');
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
  assert.equal(result.pattern, '');
  assert.equal(result.baseSize, '');
  assert.equal(result.autoPlacements.length, 0);
  assert.equal(
    window.Store.state.styleVersion.swoSnapshot.sourceFormat,
    'FANATICS_STRIKE_OFF'
  );
});
