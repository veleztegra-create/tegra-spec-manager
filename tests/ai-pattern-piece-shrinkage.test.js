import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const context = { window: {} };
vm.runInNewContext(fs.readFileSync(path.join(root, 'features/ai-pattern-piece-shrinkage.js'), 'utf8'), context);
const parsePieceNames = context.window.PatternPieceShrinkage.parsePieceNames;

test('extrae nombre y encogimiento de una etiqueta Piece Name', () => {
  const pieces = parsePieceNames('Piece Name: LF YOKE 3_L X 1.5_W Piece Name: FRONT 2_L X 1.5_W');
  assert.equal(pieces.length, 2);
  assert.equal(pieces[0].pieceName, 'LF YOKE');
  assert.equal(pieces[0].shrinkage, '3_L X 1.5_W');
  assert.equal(pieces[0].fullText, 'Piece Name: LF YOKE 3_L X 1.5_W');
  assert.equal(pieces[1].pieceName, 'FRONT');
});

test('normaliza variaciones de espacios y evita duplicados exactos', () => {
  const pieces = parsePieceNames('Piece Name: LF YOKE 3 _ L X 1.5 _ W Piece Name: LF YOKE 3_L X 1.5_W');
  assert.equal(pieces.length, 1);
  assert.equal(pieces[0].shrinkage, '3_L X 1.5_W');
});

test('admite etiquetas sin encogimiento legible', () => {
  const pieces = parsePieceNames('Piece Name: SLV BD Piece Name: FRONT 2_L X 1.5_W');
  assert.equal(pieces.length, 2);
  assert.equal(pieces[0].pieceName, 'SLV BD');
  assert.equal(pieces[0].hasShrinkage, false);
});
