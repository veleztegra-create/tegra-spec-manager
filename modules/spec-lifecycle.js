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

    // Lifecycle transitions are intentionally forward-only. Reverting an
    // approved/locked Spec should happen through a new version, not by
    // rewriting the historical state in place.
    const TRANSITIONS = Object.freeze({
        [STATUS.DRAFT]: Object.freeze([STATUS.DEVELOPMENT]),
        [STATUS.DEVELOPMENT]: Object.freeze([STATUS.DEVELOPMENT_APPROVED]),
        [STATUS.DEVELOPMENT_APPROVED]: Object.freeze([STATUS.PRODUCTION_LOCKED]),
        [STATUS.PRODUCTION_LOCKED]: Object.freeze([])
    });

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

    function createAuditEntry(options = {}) {
        return normalizeAuditEntry({
            id: options.id || null,
            action: options.action || 'CHANGE',
            actor: options.actor || null,
            authorizedBy: options.authorizedBy || null,
            reason: options.reason || '',
            at: options.at || new Date().toISOString(),
            path: options.path || null,
            oldValue: options.oldValue,
            newValue: options.newValue,
            fromVersion: options.fromVersion ?? null,
            toVersion: options.toVersion ?? null
        });
    }

    function createVersionAuditEntry(fromVersion, toVersion, options = {}) {
        return createAuditEntry({
            action: 'CREATE_VERSION',
            actor: options.actor || null,
            authorizedBy: options.authorizedBy || null,
            reason: options.reason || 'Nueva versión de Spec',
            at: options.at,
            fromVersion,
            toVersion,
            oldValue: options.oldValue,
            newValue: options.newValue,
            path: options.path || 'styleVersion'
        });
    }

    function canEditSequence(lifecycle = {}, permission = {}) {
        const normalized = normalizeLifecycle(lifecycle);
        if (EDITABLE_STATUSES.has(normalized.status)) return true;
        return Boolean(permission.canEditLockedSequence);
    }

    function canTransition(fromStatus, toStatus, permission = {}) {
        const from = Object.values(STATUS).includes(fromStatus) ? fromStatus : STATUS.DRAFT;
        if (!Object.values(STATUS).includes(toStatus)) return false;

        const allowedTargets = TRANSITIONS[from] || [];
        if (!allowedTargets.includes(toStatus)) return false;

        if (from === STATUS.DEVELOPMENT && toStatus === STATUS.DEVELOPMENT_APPROVED) {
            return Boolean(permission.canApproveDevelopment);
        }

        if (from === STATUS.DEVELOPMENT_APPROVED && toStatus === STATUS.PRODUCTION_LOCKED) {
            return Boolean(permission.canLockProduction);
        }

        return true;
    }

    function transitionLifecycle(lifecycle = {}, toStatus, options = {}) {
        const current = normalizeLifecycle(lifecycle);
        const permission = options.permission || {};
        if (!canTransition(current.status, toStatus, permission)) {
            throw new Error(`Transición de lifecycle no autorizada: ${current.status} → ${toStatus}`);
        }

        const at = options.at || new Date().toISOString();
        const actor = options.actor || null;
        const next = {
            ...current,
            status: toStatus
        };

        if (toStatus === STATUS.DEVELOPMENT_APPROVED) {
            next.approvedBy = actor;
            next.approvedAt = at;
        }

        if (toStatus === STATUS.PRODUCTION_LOCKED) {
            next.lockedAt = at;
        }

        return next;
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

    function touchVersionMetadata(styleVersion, options = {}) {
        const target = styleVersion && typeof styleVersion === 'object' ? styleVersion : {};
        const at = options.at || new Date().toISOString();
        target.updatedAt = at;
        target.updatedBy = options.actor || null;
        target.auditTrail = appendAuditEntry(target.auditTrail, options.entry || createAuditEntry({
            actor: options.actor || null,
            at,
            path: options.path || null,
            oldValue: options.oldValue,
            newValue: options.newValue,
            reason: options.reason || ''
        }));
        return target;
    }

    global.SpecLifecycle = {
        STATUS,
        SOURCE,
        TRANSITIONS,
        normalizeLifecycle,
        normalizeAuditEntry,
        normalizeAuditTrail,
        createAuditEntry,
        createVersionAuditEntry,
        canEditSequence,
        canTransition,
        transitionLifecycle,
        deriveOverallStatus,
        appendAuditEntry,
        touchVersionMetadata
    };
})(typeof window !== 'undefined' ? window : globalThis);
