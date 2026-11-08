// spec-workflow.js - shared-artwork spec workflow and external review history
(function (global) {
    'use strict';

    const STATUSES = Object.freeze([
        'DRAFT',
        'READY_TO_SEND',
        'AWAITING_REVIEW',
        'RETURNED',
        'CHANGES_ACCEPTED',
        'SUPERVISOR_VALIDATED',
        'CLOSED'
    ]);

    const REVIEW_STATUSES = Object.freeze(['PENDING', 'RETURNED', 'VALIDATED', 'CHANGES_REQUESTED']);
    const DEFAULT_TARGET_ROUNDS = 8;

    function text(value) {
        return String(value ?? '').trim();
    }

    function positiveInteger(value, fallback = null) {
        const parsed = Number(value);
        return Number.isFinite(parsed) && parsed >= 1 ? Math.floor(parsed) : fallback;
    }

    function normalizeOrder(order = {}, index = 0) {
        const po = text(order.po ?? order.purchaseOrder);
        if (!po) return null;

        return {
            id: text(order.id) || `order-${index + 1}`,
            po,
            stage: text(order.stage ?? order.sampleType),
            swoId: text(order.swoId ?? order.swo ?? order.workOrder),
            customer: text(order.customer),
            season: text(order.season),
            colorway: text(order.colorway),
            artworkKey: text(order.artworkKey),
            linkedAtRound: positiveInteger(order.linkedAtRound),
            unlinkedAtRound: positiveInteger(order.unlinkedAtRound),
            status: order.status === 'REMOVED' ? 'REMOVED' : 'ACTIVE'
        };
    }

    function normalizeValidation(value = {}) {
        const status = REVIEW_STATUSES.includes(value.status) ? value.status : 'PENDING';
        return {
            status,
            declaredBy: text(value.declaredBy ?? value.validatedBy),
            role: text(value.role),
            validatedAt: text(value.validatedAt),
            note: text(value.note),
            verification: 'FILE_DECLARATION'
        };
    }

    function normalizeReview(review = {}, index = 0) {
        const round = positiveInteger(review.round, index + 1);
        return {
            id: text(review.id) || `round-${round}`,
            round,
            status: REVIEW_STATUSES.includes(review.status) ? review.status : 'PENDING',
            sentAt: text(review.sentAt),
            sentBy: text(review.sentBy),
            outgoingFileName: text(review.outgoingFileName),
            returnedAt: text(review.returnedAt),
            returnedBy: text(review.returnedBy),
            incomingFileName: text(review.incomingFileName),
            validation: normalizeValidation(review.validation),
            changeSummary: text(review.changeSummary)
        };
    }

    function normalizeWorkflow(value = {}, generalData = {}) {
        const source = value && typeof value === 'object' ? value : {};
        const fallbackOrder = normalizeOrder({
            po: generalData.po,
            stage: generalData.sampleType,
            customer: generalData.customer,
            season: generalData.season,
            colorway: generalData.colorway,
            swoId: generalData.swoId
        }, 0);
        const orders = Array.isArray(source.orders)
            ? source.orders.map(normalizeOrder).filter(Boolean)
            : (fallbackOrder ? [fallbackOrder] : []);

        const status = STATUSES.includes(source.status) ? source.status : 'DRAFT';
        const reviews = Array.isArray(source.reviewHistory)
            ? source.reviewHistory.map(normalizeReview)
            : [];

        return {
            id: text(source.id) || null,
            status,
            sequenceScope: 'SHARED_ARTWORK',
            artwork: {
                key: text(source.artwork?.key ?? source.artworkKey),
                revision: text(source.artwork?.revision ?? source.artworkRevision),
                sharingConfirmed: Boolean(source.artwork?.sharingConfirmed ?? source.sharingConfirmed),
                confirmedBy: text(source.artwork?.confirmedBy),
                confirmedAt: text(source.artwork?.confirmedAt)
            },
            orders,
            currentRound: positiveInteger(source.currentRound, 0),
            targetRounds: positiveInteger(source.targetRounds, DEFAULT_TARGET_ROUNDS),
            reviewHistory: reviews,
            createdAt: text(source.createdAt),
            updatedAt: text(source.updatedAt)
        };
    }

    function createWorkflow(options = {}) {
        return normalizeWorkflow({
            ...options,
            id: options.id || null,
            status: options.status || 'DRAFT',
            currentRound: 0,
            reviewHistory: [],
            createdAt: options.createdAt || new Date().toISOString()
        }, options.generalData || {});
    }

    function orderIdentity(order = {}) {
        return [
            text(order.swoId).toUpperCase(),
            text(order.po).toUpperCase(),
            text(order.stage).toUpperCase()
        ].join('|');
    }

    function linkOrder(workflow = {}, order = {}, options = {}) {
        const normalized = normalizeWorkflow(workflow);
        const nextOrder = normalizeOrder(order, normalized.orders.length);
        if (!nextOrder) throw new Error('No se puede vincular una orden sin PO.');

        const identity = orderIdentity(nextOrder);
        const existing = normalized.orders.find((item) => orderIdentity(item) === identity);
        if (existing && existing.status === 'ACTIVE') return normalized;

        const linked = {
            ...nextOrder,
            status: 'ACTIVE',
            linkedAtRound: normalized.currentRound || 1,
            unlinkedAtRound: null
        };
        const orders = existing
            ? normalized.orders.map((item) => orderIdentity(item) === identity ? linked : item)
            : [...normalized.orders, linked];

        return {
            ...normalized,
            orders,
            artwork: {
                ...normalized.artwork,
                sharingConfirmed: Boolean(options.confirmSameArtwork || normalized.artwork.sharingConfirmed),
                confirmedBy: options.confirmedBy || normalized.artwork.confirmedBy,
                confirmedAt: options.confirmedAt || normalized.artwork.confirmedAt
            },
            updatedAt: options.at || new Date().toISOString()
        };
    }

    function unlinkOrder(workflow = {}, orderRef = {}, options = {}) {
        const normalized = normalizeWorkflow(workflow);
        const target = normalizeOrder(orderRef);
        if (!target) throw new Error('Se requiere una PO para retirar una orden.');
        const identity = orderIdentity(target);
        return {
            ...normalized,
            orders: normalized.orders.map((item) => orderIdentity(item) === identity
                ? { ...item, status: 'REMOVED', unlinkedAtRound: normalized.currentRound || 1 }
                : item),
            updatedAt: options.at || new Date().toISOString()
        };
    }

    function startReviewRound(workflow = {}, options = {}) {
        const normalized = normalizeWorkflow(workflow);
        if (!normalized.orders.some((order) => order.status === 'ACTIVE')) {
            throw new Error('No se puede enviar una Spec sin órdenes activas vinculadas.');
        }
        if (normalized.status === 'AWAITING_REVIEW') {
            throw new Error('La Spec ya está pendiente de revisión.');
        }

        const round = normalized.currentRound + 1;
        const review = normalizeReview({
            id: options.id || `round-${round}`,
            round,
            status: 'PENDING',
            sentAt: options.sentAt || new Date().toISOString(),
            sentBy: options.sentBy,
            outgoingFileName: options.outgoingFileName
        }, round - 1);

        return {
            ...normalized,
            status: 'AWAITING_REVIEW',
            currentRound: round,
            reviewHistory: [...normalized.reviewHistory, review],
            updatedAt: options.sentAt || new Date().toISOString()
        };
    }

    function returnFromReview(workflow = {}, options = {}) {
        const normalized = normalizeWorkflow(workflow);
        const round = positiveInteger(options.round, normalized.currentRound);
        const index = normalized.reviewHistory.findIndex((item) => item.round === round);
        if (index < 0) throw new Error(`No existe la ronda ${round} para esta Spec.`);

        const validation = normalizeValidation(options.validation || {});
        const nextReviews = normalized.reviewHistory.slice();
        nextReviews[index] = {
            ...nextReviews[index],
            status: validation.status === 'VALIDATED' ? 'VALIDATED' :
                (validation.status === 'CHANGES_REQUESTED' ? 'CHANGES_REQUESTED' : 'RETURNED'),
            returnedAt: options.returnedAt || new Date().toISOString(),
            returnedBy: text(options.returnedBy),
            incomingFileName: text(options.incomingFileName),
            validation,
            changeSummary: text(options.changeSummary)
        };

        return {
            ...normalized,
            status: validation.status === 'VALIDATED' ? 'SUPERVISOR_VALIDATED' : 'RETURNED',
            reviewHistory: nextReviews,
            updatedAt: options.returnedAt || new Date().toISOString()
        };
    }

    function acceptReturnedChanges(workflow = {}, options = {}) {
        const normalized = normalizeWorkflow(workflow);
        const latest = normalized.reviewHistory[normalized.reviewHistory.length - 1];
        if (!latest || !latest.returnedAt) {
            throw new Error('No hay una revisión devuelta para aceptar.');
        }
        if (latest.validation.status === 'CHANGES_REQUESTED') {
            throw new Error('La revisión solicita cambios; no puede marcarse como aceptada.');
        }
        return {
            ...normalized,
            status: latest.validation.status === 'VALIDATED' ? 'SUPERVISOR_VALIDATED' : 'CHANGES_ACCEPTED',
            updatedAt: options.at || new Date().toISOString()
        };
    }

    global.SpecWorkflow = {
        STATUSES,
        REVIEW_STATUSES,
        DEFAULT_TARGET_ROUNDS,
        normalizeOrder,
        normalizeReview,
        normalizeWorkflow,
        createWorkflow,
        linkOrder,
        unlinkOrder,
        startReviewRound,
        returnFromReview,
        acceptReturnedChanges
    };
})(typeof window !== 'undefined' ? window : globalThis);
