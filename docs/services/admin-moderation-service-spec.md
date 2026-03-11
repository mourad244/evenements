# Backend Service Spec - admin-moderation-service

> Conventions: `docs/workflows/Workflow_backend.md`

## 0. Meta

- **Service name**: `admin-moderation-service`
- **Business domain**: Moderation des evenements + actions admin
- **Phase cible**: `P3`

## 1. Domain model

### 1.1 Entites principales

- **ModerationCase**
  - Champs: `caseId`, `eventId`, `organizerId`, `status`, `reasonCode`,
    `reasonNote`, `lastAction`, `lastActionAt`, `lastActionBy`,
    `createdAt`, `updatedAt`, `correlationId?`
  - Source de verite: `admin-moderation-service`
- **ModerationAction** (audit)
  - Champs: `caseId`, `eventId`, `action`, `reasonCode`, `actorId`,
    `timestamp`, `correlationId`
  - Source de verite: `admin-moderation-service`

### 1.2 Statuts / transitions

Statuts: `PENDING`, `CHANGES_REQUESTED`, `APPROVED`, `REJECTED`,
`SUSPENDED`.

Transitions autorisees: voir `Workflow_admin_moderation_contract.md`.

## 2. API surface

### 2.1 `GET /api/admin/moderation-cases`

- Objectif: lister les cas de moderation.
- Query: `status?`, `eventId?`, `organizerId?`, `from?`, `to?`,
  `page`, `pageSize`.
- Succes: `{ success: true, data: [ModerationCase], meta }`
- Erreurs: `401`, `403`, `400`.
- Role: `ADMIN`.

### 2.2 `GET /api/admin/moderation-cases/{caseId}`

- Objectif: detail d'un cas.
- Succes: `{ success: true, data: ModerationCase }`
- Erreurs: `401`, `403`, `404`.
- Role: `ADMIN`.

### 2.3 `POST /api/admin/moderation-cases/{caseId}/actions`

- Objectif: executer `approve`, `reject`, `request_changes`, `suspend`,
  `reopen`.
- Body: `action`, `reasonCode`, `reasonNote?`.
- Succes: `{ success: true, data: ModerationCase }`
- Erreurs: `401`, `403`, `404`, `409` (transition invalide).
- Idempotence: meme `action` sur le meme `status` -> `409`.
- Role: `ADMIN`.

## 3. Evenements asynchrones

Evenements emis:

- `moderation.case_approved`
- `moderation.case_rejected`
- `moderation.case_changes_requested`
- `moderation.case_suspended`
- `moderation.case_reopened`

Payload minimal:

```
{
  "caseId": "...",
  "eventId": "...",
  "organizerId": "...",
  "action": "...",
  "reasonCode": "...",
  "actorId": "...",
  "timestamp": "...",
  "correlationId": "..."
}
```

Consommateurs attendus:

- `event-management-service` (maj statut event)
- `notification-service` (notifier organisateur)
- `audit` (indexation transversale)

## 4. Validation & business rules

- `reasonCode` obligatoire pour `reject` et `suspend`.
- `reasonNote` optionnel, limite 500 chars.
- Les transitions hors matrice renvoient `409`.
- Les actions sont journalisees en `ModerationAction`.

## 5. Securite & audit

- Auth via Gateway, role `ADMIN` requis.
- Journaliser chaque action (actorId, action, caseId).
- `correlationId` recopie depuis la request.

## 6. Observabilite

- `/health`, `/ready`.
- Logs structures: `service`, `action`, `caseId`, `eventId`,
  `correlationId`.
- Metriques: `moderation_actions_total`, `moderation_cases_pending`,
  `moderation_action_latency_ms`.

## 7. Integrations externes

- Lecture event/organizer via `event-management-service` et
  `identity-access-service` (sync, via Gateway).
- Emission async vers notification + audit.

## 8. Tests minimaux

- `401/403` sur toutes les routes.
- `GET` liste + detail OK.
- Transitions `approve/reject/request_changes` OK.
- `409` sur transition invalide.

## 9. Definition of Done

- Spec completee et alignee au contrat `A02.1`.
- API et evenements async explicites.
- Regles de securite, audit, observabilite notees.
