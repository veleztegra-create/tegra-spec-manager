// spec-lifecycle.js - workflow/versioning contract for Tegra Specs
(function (global) {
    const STATUS = Object.freeze({
        DRAFT: 'DRAFT',
        DEVELOPMENT: 'DEVELOPMENT',
        DEVELOPMENT_APPROVED: 'DEVELOPMENT_APPROVED',
        PRODUCTION_LOCKED: 'PRODUCTION_LOCKED'
    });

    const SOURCE = Object.freeze({
        RULE_ENGINE: 'RULE_ENGINE',
        DEVELOPMENT: 'DEVELOPMENT',
        PRODUCTION: 'PRODUCTION'
    });

    const EDITABLE_STATUSES = new Set([STATUS.DRAFT, STATUS.DEVELOPMENT]);
    const LOCKED_STATUSES = new Set([STATUS.DEVELOPMENT_APPROVED, STATUS.PRODUCTION_LOCKED]);

    function normalizeLifecycle(value = {}) {
        return {
            status: Object.values(STATUS).includes(value.status) ? value.status : STATUS.DRAFT,
            source: Object.values(SOURCE).includes(value.source) ? value.source : SOURCE.RULE_ENGINE,
            version: Math.max(1, Number(value.version) || 1),
            approvedBy: value.approvedBy || null,
            approvedAt: value.approvedAt || null,
            lockedAt: value.lockedAt || null,
            parentVersion: value.parentVersion ?? null
        };
    }

    function normalizeAuditEntry(entry = {}) {
        return {
            id: entry.id || null,
            action: entry.action || 'CHANGE',
            actor: entry.actor || null,
            authorizedBy: entry.authorizedBy || null,
            reason: entry.reason || '',
            at: entry.at || null,
            path: entry.path || null,
            oldValue: entry.oldValue,
            newValue: entry.newValue,
            fromVersion: entry.fromVersion ?? null,
            toVersion: entry.toVersion ?? null
        };
    }

    function normalizeAuditTrail(entries) {
        return Array.isArray(entries) ? entries.map(normalizeAuditEntry) : [];
    }

    function canEditSequence(lifecycle = {}, permission = {}) {
        const normalized = normalizeLifecycle(lifecycle);
        if (EDITABLE_STATUSES.has(normalized.status)) return true;
        return Boolean(permission.canEditLockedSequence);
    }

    function nextVersion(lifecycle = {}) {
        return normalizeLifecycle(lifecycle).version + 1;
    }

    function createDerivedVersion(lifecycle = {}, options = {}) {
        const current = normalizeLifecycle(lifecycle);
        const authorized = Boolean(options.authorized);
        const override = Boolean(options.override);

        if (LOCKED_STATUSES.has(current.status) && !(authorized && override)) {
            throw new Error('No se puede crear una nueva versión desde un estado bloqueado sin autorización explícita.');
        }

        const version = nextVersion(current);
        return {
            status: options.status || STATUS.DEVELOPMENT,
            source: options.source || SOURCE.DEVELOPMENT,
            version,
            parentVersion: current.version,
            approvedBy: null,
            approvedAt: null,
            lockedAt: null
        };
    }

    function appendAuditEntry(auditTrail, entry) {
        const next = normalizeAuditTrail(auditTrail);
        next.push(normalizeAuditEntry(entry));
        return next;
    }

    global.SpecLifecycle = {
        STATUS,
        SOURCE,
        normalizeLifecycle,
        normalizeAuditEntry,
        normalizeAuditTrail,
        canEditSequence,
        nextVersion,
        createDerivedVersion,
        appendAuditEntry
    };
})(typeof window !== 'undefined' ? window : globalThis);
