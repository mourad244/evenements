---
title: Strategie de tests Evenements
description: Lecture unifiee du livrable HTML "Tests" et de la couverture automatisee reelle du depot.
docKind: catalog
domain: testing
phase: P1-P5
owner: Mourad
status: DONE
tags:
  - tests
  - strategy
  - quality
  - events
slug: testing-strategy-evenements
---

# Strategie de tests - Evenements

## Objet

Le HTML `AgendaGo` presente une pyramide de tests lisible
`unit / integration / E2E`.

Le depot courant couvre deja:

- des smoke tests backend;
- des tests ACL et securite;
- des tests unitaires metier par increment;
- des tests frontend de routes et d'etats UI via Vitest.

Ce document relie ces deux lectures.

## Comment lire la couverture actuelle

| Couche | Intention | Sources canoniques | Exemples |
| --- | --- | --- | --- |
| Smoke / parcours critiques | verifier la stack MVP et les contrats majeurs | [Plan smoke MVP](./test-plan-smoke-mvp.md) | `npm run test:s1-m01`, `tests/mvp-backend-critical.smoke.test.js` |
| ACL / securite | bloquer regressions auth, role, ownership | [Plan ACL](./test-plan-role-regression.md), [Strategie securite](./security-strategy-evenements.md) | `npm run test:s1-t02`, `npm run test:s1-t07` |
| Backend metier | waitlist, tickets, notifications, monitoring | `tests/` + scripts racine | `test:s2-t09`, `test:s2-t10`, `test:s2-t11`, `test:s2-t12`, `test:s2-t15` |
| Frontend unit / route | surfaces UI, route guards, raffinements | `frontend/src/**/*.test.tsx`, `frontend/package.json` | `cd frontend && npm run test:run` |
| Recette par phase | couverture attendue par lot produit | [Matrice de recette](./test-plan-acceptance-matrix.md) | `P1` a `P4` |

## Scenarios critiques qui doivent rester verts

### P1 - publication et inscription

- register / login / refresh;
- CRUD drafts organisateur;
- catalogue public;
- inscription et annulation;
- historique participant;
- propagation `correlation-id`.

References:

- [Plan smoke MVP](./test-plan-smoke-mvp.md)
- `tests/s1-t05.event-drafts.smoke.test.js`
- `tests/s1-t06.gateway-events.smoke.test.js`

### ACL et securite

- public ne peut pas ecrire sur les routes protegees;
- participant ne peut pas agir comme organisateur;
- ownership evenement et ownership inscription restent stricts.

References:

- [Plan ACL](./test-plan-role-regression.md)
- `tests/s1-t02.gateway-acl-matrix.unit.test.js`
- `tests/s1-t07.auth-security-audit.smoke.test.js`

### Ticketing / QR / participant history

- generation d'artefact billet;
- exposition des champs de telechargement;
- QR et verification associee;
- comportement waitlist cote participant;
- export organisateur.

References:

- `tests/s2-t03.frontend-blob-download-helper.unit.test.js`
- `tests/s2-t04.ticket-download-ux.unit.test.js`
- `tests/s2-t06.participant-ticket-ui.unit.test.js`
- `tests/s2-t09.ticket-artifact-generation.unit.test.js`
- `tests/s2-t10.ticket-qr-code.unit.test.js`
- `tests/s2-t11.participant-history-api.unit.test.js`
- `tests/s2-t12.organizer-registrants-export-api.unit.test.js`
- `tests/s2-t13.participant-participations-view.unit.test.js`
- `tests/s2-t14.organizer-registrations-view.unit.test.js`

### Notification et observabilite

- worker email et journal de livraison;
- emission metriques notification;
- alertes monitoring.

References:

- `tests/s2-t15.notification-email-worker.unit.test.js`
- `tests/s2-t16.notification-delivery-log.unit.test.js`
- `tests/s5-t02.monitoring-metrics-emission.unit.test.js`
- `tests/s5-t03.monitoring-alert-rules.unit.test.js`

## Frontend: lecture pratique

Le HTML parle d'E2E naviguant dans l'application. Dans le repo actuel,
la couverture frontend la plus visible passe par:

- tests de routes publiques `events`;
- tests dashboard/admin;
- tests des etats UI et composants partages;
- tests des helpers frontend relies aux APIs.

Exemples:

- `frontend/src/app/(public)/events/__tests__/events-routes.test.tsx`
- `frontend/src/app/(dashboard)/__tests__/dashboard-routes.test.tsx`
- `frontend/src/app/(dashboard)/admin/__tests__/admin-routes.test.tsx`
- `frontend/src/components/ui/__tests__/page-states.test.tsx`

## Ecart utile avec le HTML

- le HTML montre une pyramide `Jest / Supertest / Cypress`;
- le depot actuel utilise surtout `node --test` a la racine et `Vitest`
  cote frontend;
- des dependances `Cypress` ou `Playwright` peuvent exister dans les
  lockfiles, mais la reference documentaire actuelle du repo reste la
  suite automatisee effectivement branchee dans `package.json`.

## Regle documentaire

Quand la doc parle de `tests E2E`, preciser s'il s'agit:

- d'un objectif de livrable issu du HTML;
- d'un smoke test backend orchestre;
- ou d'un vrai test navigateur branche dans le repo.
