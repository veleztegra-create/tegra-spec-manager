import test from 'node:test';
import assert from 'node:assert/strict';

globalThis.window = {};
await import('../js/nikeTechPackExtractor.js');

const extractor = new window.NikeTechPackExtractor();

test('extracts only the product category from first-page descriptions', () => {
    const cases = [
        ['Description:: Jordan College Football Limited 3.0 Jersey', 'LIMITED'],
        ['Description:: A/SS Game Jersey', 'GAME'],
        ['Description:: Nike College Football Game Crop Top', 'GAME'],
        ['Description:: NFL Nike Limited Sewn-Down Twill Jerseys', 'LIMITED'],
        ['Description:: Nike Elite Jersey', 'ELITE']
    ];

    for (const [description, expected] of cases) {
        assert.equal(extractor.extractProductCategory(description), expected, description);
    }

    const firstPage = [
        'Seasonal Plan Fall 2027',
        'Nike College PID #',
        'Product Status Concept',
        'Description::',
        'Nike College Football Game Crop Top'
    ].join('\n');

    assert.equal(extractor.extractProductCategory(firstPage), 'GAME');
    assert.equal(extractor.extractProductCategory('Seasonal Plan Fall 2027 Football Game Crop Top'), '',
        'must not infer Category from Seasonal Plan/header text');
});

test('does not use the Tech Pack Style field as the Spec Style source', () => {
    const info = extractor.extractGeneralInfo(
        'Style # 381892F_JAG_RVLY_PPF\nSeasonal Plan FA27',
        'Seasonal Plan Fall 2027\nDescription:: Nike College Football Game Crop Top'
    );

    assert.equal(info.category, 'GAME');
    assert.equal(info.season, 'FA27');
    assert.equal(Object.hasOwn(info, 'styleNumber'), false);
});

test('extracts the main fabric composition first from Bill of Material', () => {
    const text = [
        'Bill of Material',
        'Main body fabric 100% Polyester',
        'Collar rib 100% Cotton',
        'Measurement',
        'Graphic Placement'
    ].join('\n');

    const fabrics = extractor.extractFabrics(text);

    assert.equal(fabrics[0]?.composicion, '100% Polyester');
    assert.equal(fabrics[1]?.composicion, '100% Cotton');
});

test('preserves recycled content and multi-fiber composition', () => {
    const text = [
        'Bill of Materials',
        'Main body 100% Recycled Polyester',
        'Sleeve panel 92% Polyester / 8% Spandex',
        'Measurement'
    ].join('\n');

    const fabrics = extractor.extractFabrics(text);

    assert.equal(fabrics[0]?.composicion, '100% Recycled Polyester');
    assert.equal(fabrics[1]?.composicion, '92% Polyester / 8% Spandex');
});
