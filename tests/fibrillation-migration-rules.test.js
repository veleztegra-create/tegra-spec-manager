import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import vm from 'node:vm';

const [rulesSource, sequenceSource, normalizerSource] = await Promise.all([
    readFile(new URL('../core/rules-engine.js', import.meta.url), 'utf8'),
    readFile(new URL('../core/sequence-builder.js', import.meta.url), 'utf8'),
    readFile(new URL('../core/layer-normalizer.js', import.meta.url), 'utf8')
]);

function createEngine() {
    const window = {
        ProductionConditionEngine: {
            evaluatePlacement: () => ({ directToBlocker: false, matchedConditions: [], reason: '' })
        }
    };
    vm.runInNewContext(normalizerSource, { window });
    vm.runInNewContext(sequenceSource, { window });
    vm.runInNewContext(rulesSource, {
        window,
        document: { addEventListener() {} },
        console: { log() {} }
    });
    return window.RulesEngine;
}

test('WATERBASE BLACK uses migration blockers, automatic press, two AquaFlex bases and then colors', () => {
    const engine = createEngine();
    const sequence = engine.generarSecuencia({
        garmentColor: 'BLACK',
        inkType: 'WATER',
        designColors: [{ val: 'RED' }]
    });

    assert.deepEqual(sequence.map(step => step.tipo), [
        'BLOCKER', 'FLASH', 'COOL',
        'HOT_HEAD', 'COOL',
        'BLOCKER', 'FLASH', 'COOL',
        'BLOCKER', 'FLASH', 'COOL',
        'WHITE_BASE', 'FLASH', 'COOL',
        'WHITE_BASE', 'FLASH', 'COOL',
        'COLOR', 'FLASH', 'COOL', 'COLOR'
    ]);
    assert.equal(sequence[0].nombre, 'AQUARIUS MIGRATION BLOCKER STOP');
    assert.equal(sequence[0].additives, '10% Aquaflex V2 Neutral · 0.75% Aquarius Thickener');
    assert.equal(sequence[3].nombre, 'PLANCHADOR AUTOMÁTICO · 120 °F');
    assert.equal(sequence[3].mesh, 'TEFLÓN');
    assert.equal(sequence[5].nombre, 'MAGNA MIGRATION BLOCKER BLACK');
    assert.equal(sequence[8].nombre, 'MAGNA MIGRATION BLOCKER BLACK');
    assert.equal(sequence[11].mesh, '122/55');
    assert.equal(sequence[14].mesh, '198/40');
});

test('COLLAGE NAVY and FIR trigger the WATERBASE migration rule', () => {
    const engine = createEngine();
    for (const garmentColor of ['COLLAGE NAVY', 'FIR']) {
        const sequence = engine.generarSecuencia({
            garmentColor,
            inkType: 'WATER',
            designColors: [{ val: 'RED' }]
        });
        assert.equal(sequence[0].nombre, 'AQUARIUS MIGRATION BLOCKER STOP');
        assert.ok(sequence.some(step => step.tipo === 'HOT_HEAD'));
    }
});

test('migration treatment does not activate for other inks or unrelated colors', () => {
    const engine = createEngine();
    const plastisol = engine.generarSecuencia({
        garmentColor: 'BLACK',
        inkType: 'PLASTISOL',
        customer: 'GFS',
        designColors: [{ val: 'RED' }]
    });
    const unrelated = engine.generarSecuencia({
        garmentColor: 'FIRE RED',
        inkType: 'WATER',
        designColors: [{ val: 'RED' }]
    });

    assert.equal(plastisol.some(step => step.tipo === 'HOT_HEAD'), false);
    assert.equal(unrelated.some(step => step.tipo === 'HOT_HEAD'), false);
});

test('migration curing is 320 F for 1 minute 30 seconds only for WATERBASE target fabrics', () => {
    const engine = createEngine();
    assert.deepEqual(
        { ...engine.getCuringConditions('WATER', '', 'BLACK') },
        { temperatura: '320 °F', tiempo: '1:30 min' }
    );
    assert.equal(engine.getCuringConditions('WATER', '', 'FIR').tiempo, '1:30 min');
    assert.notEqual(engine.getCuringConditions('PLASTISOL', 'GFS', 'BLACK').tiempo, '1:30 min');
    assert.notEqual(engine.getCuringConditions('WATER', '', 'NAVY').tiempo, '1:30 min');
});
