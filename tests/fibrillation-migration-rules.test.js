import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import vm from 'node:vm';

const [rulesSource, sequenceSource, normalizerSource] = await Promise.all([
    readFile(new URL('../core/rules-engine.js', import.meta.url), 'utf8'),
    readFile(new URL('../core/sequence-builder.js', import.meta.url), 'utf8'),
    readFile(new URL('../core/layer-normalizer.js', import.meta.url), 'utf8')
]);

function createEngine(colorRegistry = null) {
    const window = {
        ProductionConditionEngine: {
            evaluatePlacement: () => ({ directToBlocker: false, matchedConditions: [], reason: '' })
        },
        ...(colorRegistry ? { ColorRegistry: colorRegistry } : {})
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

function assertMigrationSequence(engine, garmentColor, customer = 'FANATICS') {
    const sequence = engine.generarSecuencia({
        customer,
        garmentColor,
        inkType: 'WATER',
        designColors: [{ val: 'RED' }]
    });
    assert.equal(sequence[0].nombre, 'AQUARIUS MIGRATION BLOCKER STOP');
    assert.ok(sequence.some(step => step.tipo === 'HOT_HEAD'));
    return sequence;
}

test('Fanatics WATERBASE BLACK, COLLEGE NAVY and FIR trigger migration treatment with code suffixes', () => {
    const engine = createEngine();
    for (const garmentColor of ['BLACK 001', 'COLLEGE NAVY 41S', 'FIR 123']) {
        const sequence = assertMigrationSequence(engine, garmentColor);
        assert.equal(sequence.filter(step => step.purpose === 'migration-screen-2').length, 1);
        assert.equal(sequence.filter(step => step.purpose === 'migration-screen-3').length, 1);
        assert.equal(sequence.filter(step => step.tipo === 'WHITE_BASE').length, 2);
    }
});

test('Fanatics colorway codes resolve through ColorRegistry when the name is not entered', () => {
    const engine = createEngine({
        find: value => value === '41S'
            ? { name: 'COLLEGE NAVY', aliases: ['COLLEGE NAVY 41S'] }
            : null
    });
    assertMigrationSequence(engine, '41S');
});

test('migration treatment is restricted to Fanatics customers', () => {
    const engine = createEngine();
    for (const customer of ['NCAA', 'GFS', 'OTHER CUSTOMER', '']) {
        const sequence = engine.generarSecuencia({
            customer,
            garmentColor: 'COLLEGE NAVY 41S',
            inkType: 'WATER',
            designColors: [{ val: 'RED' }]
        });
        assert.equal(sequence[0].nombre === 'AQUARIUS MIGRATION BLOCKER STOP', false, customer);
        assert.equal(sequence.some(step => step.tipo === 'HOT_HEAD'), false, customer);
    }
});

test('migration treatment does not activate for other inks or unrelated color names', () => {
    const engine = createEngine();
    const plastisol = engine.generarSecuencia({
        customer: 'FANATICS',
        garmentColor: 'BLACK',
        inkType: 'PLASTISOL',
        designColors: [{ val: 'RED' }]
    });
    const unrelated = engine.generarSecuencia({
        customer: 'FANATICS',
        garmentColor: 'FIRE RED',
        inkType: 'WATER',
        designColors: [{ val: 'RED' }]
    });

    assert.equal(plastisol.some(step => step.tipo === 'HOT_HEAD'), false);
    assert.equal(unrelated.some(step => step.tipo === 'HOT_HEAD'), false);
});

test('migration curing is 320 F for 1 minute 30 seconds only for Fanatics WATERBASE target fabrics', () => {
    const engine = createEngine();
    assert.deepEqual(
        { ...engine.getCuringConditions('WATER', 'FANATICS', 'BLACK') },
        { temperatura: '320 °F', tiempo: '1:30 min' }
    );
    assert.equal(engine.getCuringConditions('WATER', 'FANATICS', 'FIR').tiempo, '1:30 min');
    assert.notEqual(engine.getCuringConditions('PLASTISOL', 'FANATICS', 'BLACK').tiempo, '1:30 min');
    assert.notEqual(engine.getCuringConditions('WATER', 'NCAA', 'BLACK').tiempo, '1:30 min');
    assert.notEqual(engine.getCuringConditions('WATER', 'FANATICS', 'NAVY').tiempo, '1:30 min');
});
