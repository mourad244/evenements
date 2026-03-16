# Workflow frontend - Admin moderation UI (Sprint 3)

Ce document decrit l'integration UI de la file de moderation admin
(ticket `A02.3`) en s'appuyant sur le contrat `A02.1` et l'API `A02.2`.

## 1. Objectif

- Fournir une vue moderation exploitable par les admins.
- Exposer les actions `approve`, `reject`, `request_changes`, `suspend`,
  `reopen` selon la matrice de transitions.
- Garantir un feedback clair: statut, motif, resultat, erreur.

## 2. Dependencies

- `A02.1`: `docs/workflows/Workflow_admin_moderation_contract.md`
- `A02.2`: `docs/services/admin-moderation-service-spec.md`
- `A01.2`: shell admin
- `A01.3`: route guards admin

## 3. Surface et routing

- Route principale: `/admin/moderation`
- Route detail optionnelle: `/admin/moderation/:caseId`
- Acces reserve `ADMIN` via `useAdminGuard`

## 4. Structure ecran liste

La page liste expose:

- barre filtres: `status`, `eventId`, `organizerId`, date range
- table des cas:
  - `caseId`
  - `eventId`
  - `organizerId`
  - `status`
  - `lastAction`
  - `lastActionAt`
  - action rapide (ouvrir detail)
- pagination (`page`, `pageSize`)

Etats:

- `StateLoading` pendant chargement
- `StateEmpty` si aucun cas
- `StateError` si echec API

## 5. Structure ecran detail

Le detail case affiche:

- resume evenement + organisateur
- statut courant
- dernier motif (`reasonCode`, `reasonNote`)
- timeline actions moderation (`lastActionAt`, `actorId`)
- zone actions admin

## 6. Mapping actions UI

Actions possibles selon `status`:

- `PENDING`: `approve`, `reject`, `request_changes`
- `APPROVED`: `suspend`
- `CHANGES_REQUESTED`: `reopen`
- `REJECTED`: `reopen`
- `SUSPENDED`: `reopen`

Tout bouton non autorise est desactive/invisible.

## 7. Validation formulaire action

Formulaire action:

- `action` (required)
- `reasonCode` (required pour `reject` et `suspend`)
- `reasonNote` (optional, max 500)

UI:

- `ConfirmModal` avant soumission
- toast succes avec nouveau statut
- en erreur `409`: afficher message transition invalide

## 8. Contrat API consomme

- `GET /api/admin/moderation-cases`
- `GET /api/admin/moderation-cases/{caseId}`
- `POST /api/admin/moderation-cases/{caseId}/actions`

Payload action:

```
{
  "action": "reject",
  "reasonCode": "CONTENT_VIOLATION",
  "reasonNote": "details optionnels"
}
```

## 9. Observabilite UI

- Inclure `correlationId` dans messages d'erreur si present.
- Emettre un event frontend a chaque action:
  - `admin.moderation.action.requested`
  - `admin.moderation.action.succeeded`
  - `admin.moderation.action.failed`

## 10. Tests UI minimaux

- Guard admin: non-admin ne voit pas la page.
- Liste moderation: chargement + empty + erreur.
- Detail case: actions rendues selon status.
- Soumission action:
  - success met a jour le status
  - `409` affiche une erreur explicite
  - `403` affiche `StateForbidden`
