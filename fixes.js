// fixes.js - Correcciones y parches

(function installFanaticsStrikeOffNormalizer(global) {
    'use strict';

    const clean = (value) => String(value ?? '').replace(/\s+/g, ' ').trim();

    function normalizeLabel(value) {
        return clean(value)
            .replace(/[\s:#]+$/g, '')
            .trim()
            .toUpperCase();
    }

    function normalizeDate(value) {
        if (value instanceof Date && !Number.isNaN(value.getTime())) {
            const year = value.getFullYear();
            const month = String(value.getMonth() + 1).padStart(2, '0');
            const day = String(value.getDate()).padStart(2, '0');
            return `${year}-${month}-${day}`;
        }

        const text = clean(value);
        const match = text.match(/^(\d{4}-\d{2}-\d{2})/);
        return match ? match[1] : text;
    }

    function findLabelValue(data, labels, options = {}) {
        const wanted = new Set(labels.map(normalizeLabel));

        for (let rowIndex = 0; rowIndex < Math.min(data.length, 40); rowIndex += 1) {
            const row = data[rowIndex];
            if (!Array.isArray(row)) continue;

            for (let col = 0; col < row.length; col += 1) {
                if (!wanted.has(normalizeLabel(row[col]))) continue;

                const candidates = [
                    row[col + 1],
                    row[col + 2],
                    rowIndex + 1 < data.length ? data[rowIndex + 1]?.[col] : ''
                ];

                const value = candidates.find((candidate) => clean(candidate));
                if (value !== undefined && value !== '') {
                    return options.date ? normalizeDate(value) : clean(value);
                }
            }
        }

        return '';
    }

    function isFanaticsStrikeOff(data) {
        if (!Array.isArray(data) || data.length === 0) return false;

        const head = data
            .slice(0, 40)
            .flat()
            .map(clean)
            .join(' ')
            .toUpperCase();

        return head.includes('FANATICS') &&
            head.includes('SUBMIT #') &&
            head.includes('TYPE OF EMBELLISHMENT') &&
            head.includes('REQUESTER');
    }

    function extractStyleFromDescription(description) {
        const match = clean(description).match(/^([A-Z0-9]+(?:-[A-Z0-9]+){2,})\b/i);
        return match ? match[1].toUpperCase() : '';
    }

    function normalize(data) {
        if (!isFanaticsStrikeOff(data)) return null;

        const description = findLabelValue(data, ['DESCRIPTION']);
        const submit = findLabelValue(data, ['SUBMIT']);
        const requester = findLabelValue(data, ['REQUESTER']);

        const snapshot = {
            sourceFormat: 'FANATICS_STRIKE_OFF',
            customer: findLabelValue(data, ['CUSTOMER']),
            style: extractStyleFromDescription(description),
            colorway: findLabelValue(data, ['COLORWAY']),
            season: findLabelValue(data, ['SEASON']),
            po: findLabelValue(data, ['PO']),
            sampleType: submit,
            requestor: requester,
            requestedBy: requester,
            category: findLabelValue(data, ['CATEGORY']),
            description,
            artworkPath: findLabelValue(data, ['ARTWORK PATH']),
            team: findLabelValue(data, ['TEAM NAME'])
        };

        return {
            ...snapshot,
            // Estos campos no existen en el formato Fanatics Strike Off.
            // Se mantienen vacíos para que el importador no los infiera de otros datos.
            pattern: '',
            baseSize: '',
            sample: snapshot.sampleType,
            autoPlacements: [],
            stage: {
                sampleType: snapshot.sampleType,
                isPPF: /PPF/i.test(snapshot.sampleType)
            },
            swoSnapshot: snapshot
        };
    }

    function mergeIntoStore(normalized) {
        if (!normalized || !global.Store?.state) return;

        const current = global.Store.state.styleVersion || {};
        const generalData = global.Store.state.generalData || {};

        if (global.StyleVersion?.normalizeStyleVersion) {
            global.Store.state.styleVersion = global.StyleVersion.normalizeStyleVersion({
                ...current,
                stage: normalized.stage,
                swoSnapshot: {
                    ...(current.swoSnapshot || {}),
                    ...normalized.swoSnapshot
                }
            }, {
                ...generalData,
                ...normalized.swoSnapshot
            });
        } else {
            global.Store.state.styleVersion = {
                ...current,
                stage: normalized.stage,
                swoSnapshot: {
                    ...(current.swoSnapshot || {}),
                    ...normalized.swoSnapshot
                }
            };
        }
    }

    function wrapExcelAutomation() {
        if (!global.ExcelAutomation?.processExcelWithAutomation || global.ExcelAutomation.__fanaticsStrikeOffWrapped) {
            return false;
        }

        const original = global.ExcelAutomation.processExcelWithAutomation;

        global.ExcelAutomation.processExcelWithAutomation = function (worksheet, sheetName = '', workbook = null) {
            const result = original.call(this, worksheet, sheetName, workbook);

            try {
                const sourceSheet = result?.sourceSheet || sheetName;
                const sourceWorksheet = workbook?.Sheets?.[sourceSheet] || worksheet;
                const data = global.XLSX?.utils?.sheet_to_json
                    ? global.XLSX.utils.sheet_to_json(sourceWorksheet, { header: 1, defval: '' })
                    : [];

                const normalized = normalize(data);

                if (normalized) {
                    Object.assign(result, normalized);
                    mergeIntoStore(normalized);
                    console.log('🧩 Fanatics Strike Off normalizado:', normalized);
                }
            } catch (error) {
                console.warn('⚠️ No se pudo normalizar Fanatics Strike Off:', error);
            }

            return result;
        };

        global.ExcelAutomation.__fanaticsStrikeOffWrapped = true;
        return true;
    }

    global.FanaticsStrikeOffNormalizer = {
        isFanaticsStrikeOff,
        extractStyleFromDescription,
        normalize,
        normalizeDate,
        normalizeLabel,
        mergeIntoStore,
        wrapExcelAutomation
    };

    wrapExcelAutomation();
})(typeof window !== 'undefined' ? window : globalThis);

// Asegurar que todas las variables globales existan
document.addEventListener('DOMContentLoaded', function() {
    console.log('Fixes cargados');
    
    if (!window.Config) {
        console.warn('Config no encontrado, creando versión básica');
        window.Config = {
            APP: { VERSION: '1.0.0' },
            COLOR_DATABASES: {},
            TEAM_CODE_MAP: {},
            GENDER_MAP: {},
            METALLIC_CODES: []
        };
    }

    if (!window.Config.APP) {
        window.Config.APP = { VERSION: '1.0.0' };
    }
    
    if (!window.Utils) {
        console.warn('Utils no encontrado, creando versión básica');
        window.Utils = {};
    }
    
    if (!window.errorHandler) {
        console.warn('errorHandler no encontrado, creando versión básica');
        window.errorHandler = {
            log: function() { console.error.apply(console, arguments); },
            getErrors: function() { return []; },
            clear: function() {}
        };
    }
    
    setTimeout(() => {
        if (typeof showTab === 'function') {
            console.log('✅ showTab está disponible');
        } else {
            console.warn('⚠️ showTab aún no está definido');
        }
    }, 1000);
});