import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import vm from 'node:vm';

const source = await readFile(new URL('../modules/production-alerts.js', import.meta.url), 'utf8');
const window = {};
vm.runInNewContext(source, { window });

test('PPF token detection does not match unrelated words', () => {
    assert.equal(window.ProductionAlerts.hasPpfToken('STYLE_PPF'), true);
    assert.equal(window.ProductionAlerts.hasPpfToken('PPF sleeve'), true);
    assert.equal(window.ProductionAlerts.hasPpfToken('APPF'), false);
    assert.equal(window.ProductionAlerts.hasPpfToken('PPFISH'), false);
});

test('PPF without HOT HEAD produces a manual-action warning', () => {
    const alerts = window.ProductionAlerts.evaluate({
        style: 'STYLE_PPF',
        placements: [{ id: 1, type: 'FRONT', sequence: [{ type: 'COLOR', val: 'BLACK' }] }]
    });
    assert.equal(alerts.length, 1);
    assert.equal(alerts[0].code, 'PPF_HOT_HEAD_MISSING');
    assert.match(alerts[0].message, /manualmente/i);
});

test('HOT HEAD is recognized but remains a review warning, not an approval', () => {
    const alerts = window.ProductionAlerts.evaluate({
        pattern: 'PPF',
        placements: [{
            id: 1, type: 'FRONT',
            sequence: [
                { type: 'COLOR', val: 'BLACK' },
                { type: 'FLASH', val: 'FLASH' },
                { type: 'COOL', val: 'COOL' },
                { type: 'HOT_HEAD', val: 'HOT HEAD', mesh: 'TEFLÓN' },
                { type: 'COOL', val: 'COOL' }
            ]
        }]
    });
    assert.equal(alerts[0].code, 'PPF_HOT_HEAD_PRESENT');
    assert.match(alerts[0].message, /no equivale a aprobación/i);
});
