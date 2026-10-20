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
const filterPieces = context.window.PatternPieceShrinkage.filterPieces;

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

test('lee etiquetas en cadenas nativas PostScript de Illustrator', () => {
  const ai = [
    '(Style Name: SAMPLE) Tx',
    '(Piece Name: LF YOKE 3_L X 1.5_W) Tx',
    '(Piece Name: SLV BD) Tx',
    '(Piece Name: FRONT 2_L X 1.5_W) Tx'
  ].join('\n');
  const pieces = parsePieceNames(ai);
  assert.equal(pieces.length, 3);
  assert.equal(pieces[0].pieceName, 'LF YOKE');
  assert.equal(pieces[0].shrinkage, '3_L X 1.5_W');
  assert.equal(pieces[1].pieceName, 'SLV BD');
  assert.equal(pieces[1].hasShrinkage, false);
  assert.equal(pieces[2].pieceName, 'FRONT');
});


test('buscar FT encuentra piezas Front y devuelve su encogimiento', () => {
  const pieces = parsePieceNames([
    'Piece Name: FRONT PANEL 2_L X 1.5_W',
    'Piece Name: BACK PANEL 3_L X 1_W',
    'Piece Name: LF YOKE 3_L X 1.5_W'
  ].join(' '));
  const matches = filterPieces(pieces, 'FT');
  assert.equal(matches.length, 1);
  assert.equal(matches[0].pieceName, 'FRONT PANEL');
  assert.equal(matches[0].shrinkage, '2_L X 1.5_W');
  assert.equal(filterPieces(pieces, 'front').length, 1);
  assert.equal(filterPieces(pieces, '').length, 3);
});

test('la búsqueda normal permite localizar nombres de pieza', () => {
  const pieces = parsePieceNames('Piece Name: LF YOKE 3_L X 1.5_W Piece Name: FRONT 2_L X 1.5_W');
  assert.equal(filterPieces(pieces, 'LF').length, 1);
  assert.equal(filterPieces(pieces, 'YOKE')[0].shrinkage, '3_L X 1.5_W');
});
