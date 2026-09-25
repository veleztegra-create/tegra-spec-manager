// style-version.js - canonical style version + SWO stage contract
(function (global) {
    const DEFAULT_VERSION = 1;

    function normalizeNumber(value) {
        const number = Number(value);
        return Number.isFinite(number) && number >= 1 ? Math.floor(number) : DEFAULT_VERSION;
    }

    function normalizeActor(value) {
        const text = String(value ?? '').trim();
        return text || null;
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
            category: source.category ?? generalData.category ?? '',
            description: source.description ?? generalData.description ?? '',
            artworkPath: source.artworkPath ?? generalData.artworkPath ?? '',
            sourceFormat: source.sourceFormat ?? generalData.sourceFormat ?? '',
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
            // This is the spec/version creation date, not the SWO request date.
            createdAt: source.createdAt || null,
            // Updated whenever the spec data is intentionally changed.
            updatedAt: source.updatedAt || null,
            updatedBy: normalizeActor(source.updatedBy)
        };
    }

    function nextVersion(value = {}) {
        return normalizeNumber(value.number ?? value.version) + 1;
    }

    function createDerivedVersion(current = {}, options = {}) {
        const source = normalizeStyleVersion(current, current.swoSnapshot || {});
        const authorized = Boolean(options.authorized);
        const override = Boolean(options.override);

        if (['DEVELOPMENT_APPROVED', 'PRODUCTION_LOCKED'].includes(options.currentStatus) && !(authorized && override)) {
            throw new Error('No se puede crear una nueva versión desde un estado bloqueado sin autorización explícita.');
        }

        return normalizeStyleVersion({
            number: nextVersion(source),
            label: options.label ?? '',
            parentVersion: source.number,
            stage: options.stage || source.stage,
            swoSnapshot: options.swoSnapshot || source.swoSnapshot,
            createdAt: options.createdAt || null,
            updatedAt: options.updatedAt || null,
            updatedBy: options.updatedBy || null
        }, options.swoSnapshot || source.swoSnapshot);
    }

    function createStyleVersion(generalData = {}, options = {}) {
        const normalized = normalizeStyleVersion({
            number: options.number ?? DEFAULT_VERSION,
            label: options.label ?? '',
            parentVersion: options.parentVersion ?? null,
            stage: options.stage,
            swoSnapshot: generalData,
            createdAt: options.createdAt,
            updatedAt: options.updatedAt,
            updatedBy: options.updatedBy
        }, generalData);

        return normalized;
    }

    global.StyleVersion = {
        DEFAULT_VERSION,
        normalizeStyleVersion,
        createStyleVersion,
        createDerivedVersion,
        nextVersion,
        normalizeStage,
        normalizeSwoSnapshot,
        isPPF
    };
})(typeof window !== 'undefined' ? window : globalThis);
