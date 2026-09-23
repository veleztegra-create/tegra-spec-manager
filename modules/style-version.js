// style-version.js - canonical style version + SWO stage contract
(function (global) {
    const DEFAULT_VERSION = 1;

    function normalizeNumber(value) {
        const number = Number(value);
        return Number.isFinite(number) && number >= 1 ? Math.floor(number) : DEFAULT_VERSION;
    }

    function isPPF(sampleType = '', pattern = '') {
        return /PPF/i.test(String(sampleType || '')) || /PPF/i.test(String(pattern || ''));
    }

    function normalizeStage(value = {}, snapshot = {}) {
        const sampleType = String(
            value.sampleType ??
            value.stage ??
            snapshot.sampleType ??
            ''
        ).trim();

        const pattern = String(snapshot.pattern || value.pattern || '').trim();

        return {
            sampleType,
            isPPF: typeof value.isPPF === 'boolean'
                ? value.isPPF
                : isPPF(sampleType, pattern)
        };
    }

    function normalizeSwoSnapshot(value = {}, generalData = {}) {
        const source = value && typeof value === 'object' ? value : {};

        return {
            customer: source.customer ?? generalData.customer ?? '',
            style: source.style ?? generalData.style ?? '',
            season: source.season ?? generalData.season ?? '',
            colorway: source.colorway ?? generalData.colorway ?? '',
            po: source.po ?? generalData.po ?? '',
            pattern: source.pattern ?? generalData.pattern ?? '',
            sampleType: source.sampleType ?? generalData.sampleType ?? '',
            specDate: source.specDate ?? generalData.specDate ?? '',
            requestedBy: source.requestedBy ?? source.requestor ?? generalData.requestedBy ?? generalData.requestor ?? '',
            requestor: source.requestor ?? source.requestedBy ?? generalData.requestor ?? generalData.requestedBy ?? '',
            processFlags: source.processFlags ?? generalData.processFlags ?? null
        };
    }

    function normalizeStyleVersion(value = {}, generalData = {}) {
        const source = value && typeof value === 'object' ? value : {};
        const swoSnapshot = normalizeSwoSnapshot(source.swoSnapshot, generalData);
        const stage = normalizeStage(source.stage, swoSnapshot);

        return {
            number: normalizeNumber(source.number ?? source.version),
            label: String(source.label ?? '').trim(),
            parentVersion: source.parentVersion == null ? null : normalizeNumber(source.parentVersion),
            stage,
            swoSnapshot,
            createdAt: source.createdAt || null
        };
    }

    function createStyleVersion(generalData = {}, options = {}) {
        const normalized = normalizeStyleVersion({
            number: options.number ?? DEFAULT_VERSION,
            label: options.label ?? '',
            parentVersion: options.parentVersion ?? null,
            stage: options.stage,
            swoSnapshot: generalData,
            createdAt: options.createdAt
        }, generalData);

        return normalized;
    }

    global.StyleVersion = {
        DEFAULT_VERSION,
        normalizeStyleVersion,
        createStyleVersion,
        normalizeStage,
        normalizeSwoSnapshot,
        isPPF
    };
})(typeof window !== 'undefined' ? window : globalThis);
