# Workflow admin - Moderation contract (Sprint 3)

Ce document stabilise le contrat de moderation evenement pour
l'implementation backend et la UI admin (ticket `A02.1`).

## 1. Objectif

- Definir les etats de moderation, actions, motifs et transitions.
- Standardiser les champs exposes a la console admin.
- Aligner moderation, audit et tracking.

## 2. Entites et identifiants

### 2.1 ModerationCase

Champs minimums:

- `caseId` (string, unique)
- `eventId` (string)
- `organizerId` (string)
- `status` (enum, voir 3)
- `createdAt`, `updatedAt`
- `lastAction` (enum, voir 4)
- `lastActionAt` (timestamp)
- `lastActionBy` (adminId)
- `reasonCode` (enum, voir 5)
- `reasonNote` (string, optionnel)
- `correlationId` (string, optionnel)

### 2.2 ModerationEvent (audit)

Trace d'action admin:

- `caseId`, `eventId`
- `action`
- `reasonCode`
- `actorId`
- `timestamp`
- `correlationId`

## 3. Etats (status)

- `PENDING`: a valider (nouvel evenement, modification majeure).
- `CHANGES_REQUESTED`: retour organisateur en attente.
- `APPROVED`: evenement publie.
- `REJECTED`: evenement refuse.
- `SUSPENDED`: evenement suspendu (signalement critique).

## 4. Actions admin

- `approve`
- `reject`
- `request_changes`
- `suspend`
- `reopen` (retour a `PENDING`)

## 5. Motifs (reasonCode)

Codes minimums:

- `CONTENT_VIOLATION`
- `INCOMPLETE_INFO`
- `DUPLICATE_EVENT`
- `SPAM`
- `FRAUD_RISK`
- `OTHER`

## 6. Transitions autorisees

| From | Action | To |
| --- | --- | --- |
| `PENDING` | `approve` | `APPROVED` |
| `PENDING` | `reject` | `REJECTED` |
| `PENDING` | `request_changes` | `CHANGES_REQUESTED` |
| `APPROVED` | `suspend` | `SUSPENDED` |
| `CHANGES_REQUESTED` | `reopen` | `PENDING` |
| `REJECTED` | `reopen` | `PENDING` |
| `SUSPENDED` | `reopen` | `PENDING` |

Toute action hors matrice renvoie une erreur `409`.

## 7. API (contrat minimal)

- `GET /api/admin/moderation-cases`
  - filtres: `status`, `eventId`, `organizerId`, `from`, `to`
  - pagination: `page`, `pageSize`
- `POST /api/admin/moderation-cases/{caseId}/actions`
  - body: `action`, `reasonCode`, `reasonNote`
  - reponse: `ModerationCase` mis a jour

## 8. Regles d'audit

- Chaque action admin produit un `ModerationEvent`.
- `correlationId` est requis pour les actions `suspend` et `reject`.
- L'audit expose `actorId` et `reasonCode`.

## 9. UI attentes

La console affiche:

- statut courant + dernier changement
- action disponible selon matrice
- motif obligatoire si `reject` ou `suspend`
- `correlationId` visible dans les erreurs
