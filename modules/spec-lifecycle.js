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
            approvedBy: value.approvedBy || null,
            approvedAt: value.approvedAt || null,
            lockedAt: value.lockedAt || null,
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

    function deriveOverallStatus(placements = []) {
        const statuses = Array.isArray(placements)
            ? placements.map((placement) => normalizeLifecycle(placement?.sequenceLifecycle).status)
            : [];

        if (statuses.length === 0) return STATUS.DRAFT;

        const allLocked = statuses.every((status) => status === STATUS.PRODUCTION_LOCKED);
        if (allLocked) return STATUS.PRODUCTION_LOCKED;

        const allApprovedOrLocked = statuses.every((status) =>
            status === STATUS.DEVELOPMENT_APPROVED || status === STATUS.PRODUCTION_LOCKED
        );
        if (allApprovedOrLocked) return STATUS.DEVELOPMENT_APPROVED;

        if (statuses.includes(STATUS.DEVELOPMENT)) return STATUS.DEVELOPMENT;

        // A placement still in DRAFT means the complete spec is not ready
        // for Development approval, even if another placement is already approved.
        return STATUS.DRAFT;
    }

    function createLifecycle(options = {}) {
        return normalizeLifecycle({
            status: options.status || STATUS.DRAFT,
            source: options.source || SOURCE.RULE_ENGINE,
            approvedBy: options.approvedBy || null,
            approvedAt: options.approvedAt || null,
            lockedAt: options.lockedAt || null
        });
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
        deriveOverallStatus,
        appendAuditEntry
    };
})(typeof window !== 'undefined' ? window : globalThis);
