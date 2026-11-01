import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { runInNewContext } from 'node:vm';
import { fileURLToPath } from 'node:url';
import { test } from 'node:test';

const rendererPath = fileURLToPath(new URL('../features/approved-spec-renderer.js', import.meta.url));
const rendererSource = await readFile(rendererPath, 'utf8');

function renderFixture() {
  const window = {
    Config: {
      INK_PRESETS: {
        WATER: {
          color: { durometer: '70', speed: '35', angle: '15', strokes: '2', pressure: '40', mesh: '157/48', additives: '3% cross-linker' },
          blocker: { mesh1: '122/55', additives: 'N/A' },
          white: { mesh1: '198/40', additives: 'N/A' }
        },
        PLASTISOL: {
          color: { durometer: '65', speed: '35', angle: '15', strokes: '1', pressure: '40', mesh: '156/64', additives: '1% catalyst' },
          blocker: { mesh1: '110/64', additives: 'N/A' },
          white: { mesh1: '156/64', additives: 'N/A' }
        }
      }
    }
  };

  runInNewContext(rendererSource, { window });
  return window.TegraApprovedSpecRenderer.render({
    customer: 'TEST',
    style: 'STYLE-01',
    folder: '12345',
    specType: 'CUT',
    blankPatternName: 'BLANK-AI',
    styleVersion: { number: 2, stage: { sampleType: 'PPF' } },
    fabric: '100% Polyester',
    patternPieces: [{ pieceName: 'Legacy Piece', shrinkage: '1%' }],
    placements: [
      {
        id: 1,
        name: 'Placement 1',
        type: 'FRONT',
        inkType: 'WATER',
        curing: { temperature: '320 F', time: '1:40' },
        specialInstructions: 'Print front logo centered 2 inches below collar.',
        patternPieces: [{ pieceName: 'Front Panel', shrinkage: '2%' }],
        sequence: [
          { type: 'COLOR', val: 'RED', screenLetter: '1', post: ['FLASH', 'COOL'] },
          { type: 'HOT_HEAD', val: 'HOT HEAD' },
          { type: 'FLASH', val: 'FLASH' },
          { type: 'COOL', val: 'COOL' }
        ]
      },
      {
        id: 2,
        name: 'Placement 2',
        type: 'BACK',
        inkType: 'PLASTISOL',
        curing: { temperature: '330 F', time: '1:00' },
        specialInstructions: 'Back graphic must align with center seam.',
        patternPieces: [],
        sequence: [
          {
            type: 'SPECIAL_EFFECT',
            val: 'SHINY SILICONE',
            specialEffect: {
              components: [
                { producto: 'PART A', porcentaje: 50 },
                { producto: 'PART B', porcentaje: 50 }
              ]
            }
          }
        ]
      }
    ]
  });
}

test('approved spec keeps placement data separate and complete', () => {
  const html = renderFixture();
  const count = (value) => html.split(value).length - 1;

  assert.ok(html.includes('.seq tr{break-inside:avoid;page-break-inside:avoid}'), 'individual sequence rows should remain intact without preventing the table body from splitting across pages');
  assert.ok(!html.includes('.seq tbody{break-inside:avoid'), 'the complete sequence body must not be forced to stay on one page');
  assert.ok(html.includes('.pr{display:grid;grid-template-rows:59.6pt auto minmax(14.4pt,auto) 1fr;min-width:0}'), 'placement color and specialty areas should grow when their content wraps');
  assert.ok(html.includes('.bar.cm{margin-top:5.9pt;height:11.8pt;break-after:avoid;page-break-after:avoid}.notes{border:1px solid var(--line);border-top:0;padding:3pt 5pt;font-size:8.55pt;line-height:11.1pt}.notes ol{margin:0;padding:0;list-style:none}.notes li{break-inside:avoid;page-break-inside:avoid}'), 'long comments should flow across pages while keeping individual comments intact');

  assert.equal(count('<main class="sheet placement-sheet">'), 2, 'each placement must render as its own printable sheet');
  assert.equal(count('<header class="hdr">'), 2, 'each independent sheet repeats the identifying header');
  assert.equal(count('<div class="meta">'), 2, 'each independent sheet repeats the spec metadata');
  assert.equal(count('<table class="seq">'), 2, 'each placement must own a separate sequence table');
  assert.ok(html.includes('class="pn">Front</span>'));
  assert.ok(html.includes('class="pn">Back</span>'));
  assert.ok(html.includes('<div class="rt">Front</div>'));
  assert.ok(html.includes('<div class="rt">Back</div>'));
  assert.ok(html.includes('Pattern pieces / Piezas del patrón:'));
  assert.ok(html.includes('.placement-sheet{break-after:page;page-break-after:always}.placement-sheet:last-child{break-after:auto;page-break-after:auto}'), 'each placement sheet starts on a new printed page');
  const sequenceTables = html.split('<table class="seq">').slice(1).map(table => table.split('</table>')[0]);
  assert.equal(sequenceTables.length, 2);
  assert.ok(sequenceTables[0].includes('RED'), 'Front sequence stays in the Front table');
  assert.ok(!sequenceTables[0].includes('SHINY SILICONE'), 'Back sequence must not continue the Front table');
  assert.ok(sequenceTables[1].includes('SHINY SILICONE'), 'Back sequence stays in the Back table');
  assert.ok(!sequenceTables[1].includes('RED'), 'Front sequence must not leak into the Back table');
  assert.ok(sequenceTables[0].includes('3% cross-linker'), 'automatic preset additives remain on print-color rows');
  const hotHeadRow = sequenceTables[0].split('<tr class="print">').find(row => row.includes('HOT HEAD'))?.split('</tr>')[0] || '';
  assert.ok(hotHeadRow, 'Hot Head remains a print step');
  assert.equal(hotHeadRow.split('<td class="add">')[1]?.split('</td>')[0]?.trim(), '', 'Hot Head has no additives');
  const auxiliaryRows = sequenceTables[0].split(/<tr class="(?:flash|cool)">/).slice(1).map(row => row.split('</tr>')[0]);
  assert.ok(auxiliaryRows.length >= 4, 'standalone and post-print Flash/Cool rows are present in the fixture');
  assert.ok(auxiliaryRows.every(row => {
    const cells = [...row.matchAll(/<td[^>]*>(.*?)<\\/td>/g)].map(match => match[1].trim());
    return cells.length === 3
      ? cells[2] === ''
      : cells[3] === '' && cells.slice(6, 11).every(value => value === '');
  }), 'Flash and Cool rows keep additives, durometer, speed, angle, strokes and pressure empty');
  assert.equal(count('class="proc-group"'), 2);
  assert.equal(count('class="n">1</td>'), 2, 'station numbering restarts for each placement');

  assert.equal(count('Front Panel'), 1);
  assert.equal(count('Legacy Piece'), 1);
  const legacyBlock = html.indexOf('<section class="legacy-pattern-pieces">');
  assert.ok(legacyBlock > html.lastIndexOf('</section>', legacyBlock), 'legacy pieces stay outside placement sections');

  assert.ok(html.includes('320 F'));
  assert.ok(html.includes('330 F'));
  assert.ok(html.includes('Print front logo centered 2 inches below collar.'));
  assert.ok(html.includes('Back graphic must align with center seam.'));
  assert.equal(count('Special instructions / Instrucciones especiales:'), 2, 'each placement keeps its own production instructions');
  assert.ok(html.includes('WATER'));
  assert.ok(html.includes('PLASTISOL'));
  assert.ok(html.includes('PART A 50%'));
  assert.ok(html.includes('PART B 50%'));

  assert.ok(html.includes('BLANK-AI'));
  assert.ok(html.includes('Version: 2'));
  assert.ok(html.includes('Stage: PPF'));
  assert.ok(html.includes('PARTES CORTADAS'));
  assert.ok(html.includes('70'));
  assert.ok(html.includes('65'));
  assert.equal(count('Pattern file:</b>'), 0, 'exported pattern is not repeated');
});
