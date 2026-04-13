# Workflow event - Moderation hooks (`E06.3`)

Ce document specifie les cas "publication soumise a moderation" et
"demande de correction" pour l'integration entre l'event-management-service
et la file de moderation admin (ticket `E06.3`).

Dependances:

- `E06.1` contrat d'annulation evenement
- `A02.1` contrat de moderation (`ModerationCase`, etats, transitions)
- `E03.1` contrat de publication evenement

## 1. Objectif

Definir precisement:

- dans quels cas une publication declenche une soumission a moderation
  plutot qu'un passage direct a `PUBLISHED`
- comment l'event-management-service reagit a une action `request_changes`
  emise par l'admin
- les evenements metier emis et les transitions d'etat resultantes

## 2. Quand la moderation est-elle declenchee ?

### 2.1 Regles de declenchement (MVP Sprint 3)

La moderation est **optionnelle en MVP** et activee par une variable
d'environnement:

```
MODERATION_ENABLED=true   # defaut: false
```

Quand `MODERATION_ENABLED=false`, la publication est immediate
(`DRAFT → PUBLISHED`) comme en Sprint 1.

Quand `MODERATION_ENABLED=true`, les regles suivantes s'appliquent:

| Critere | Soumettre a moderation ? |
| --- | --- |
| Premier evenement de l'organisateur | Oui |
| Evenement d'un organisateur ayant un antecedent de rejet/suspension | Oui |
| Evenement dont `pricingType = PAID` et `price > 1000` | Oui |
| Tous les autres cas | Non (publication directe) |

> Sprint 4+: la liste des criteres sera configurable par l'admin sans
> redeploi.

### 2.2 Flux de publication avec moderation active

```
Organisateur
  POST /events/drafts/:eventId/publish
        │
        ▼
  [validation draft OK]
        │
        ├─ critere moderation ? ──Oui──► status = PENDING_REVIEW
        │                                 emit event.submitted_for_review
        │                                 creer ModerationCase (PENDING)
        │                                 reponse 202
        │
        └─ Non ──────────────────────► status = PUBLISHED
                                        emit event.published
                                        reponse 200
```

## 3. Statut evenement `PENDING_REVIEW`

Un nouveau statut est ajoute a la machine d'etat evenement:

| Statut | Description |
| --- | --- |
| `PENDING_REVIEW` | Publication soumise, en attente de decision admin |

### 3.1 Regles sur `PENDING_REVIEW`

- Un evenement `PENDING_REVIEW` n'est **pas visible** dans le catalogue
  public (traite comme `DRAFT` pour les consumers externes).
- L'organisateur voit son evenement avec le statut `PENDING_REVIEW` dans
  `GET /events/me` et `GET /events/drafts/:eventId`.
- L'organisateur **ne peut pas** editer un evenement `PENDING_REVIEW`
  (retourne `409 EVENT_NOT_EDITABLE`).
- L'admin voit tous les evenements `PENDING_REVIEW` dans
  `GET /admin/events` et dans la file `GET /api/admin/moderation-cases`.

### 3.2 Transitions depuis `PENDING_REVIEW`

| Action admin | Transition evenement | Effet |
| --- | --- | --- |
| `approve` | `PENDING_REVIEW → PUBLISHED` | emit `event.published` |
| `reject` | `PENDING_REVIEW → CANCELLED` | emit `event.rejected` |
| `request_changes` | `PENDING_REVIEW → CHANGES_REQUESTED` | emit `event.changes_requested` |
| `suspend` | impossible depuis `PENDING_REVIEW` | 409 |

## 4. Statut evenement `CHANGES_REQUESTED`

Un second nouveau statut pour les retours organisateur:

| Statut | Description |
| --- | --- |
| `CHANGES_REQUESTED` | L'admin a demande des modifications |

### 4.1 Regles sur `CHANGES_REQUESTED`

- Visible uniquement par l'organisateur et l'admin (meme visibilite que
  `PENDING_REVIEW`).
- L'organisateur **peut editer** un evenement `CHANGES_REQUESTED`
  (seuls les champs autorises en DRAFT sont modifiables).
- Apres edition, l'organisateur peut re-soumettre via
  `POST /events/drafts/:eventId/publish`, ce qui:
  - repasse le statut a `PENDING_REVIEW`
  - cree un nouveau `ModerationEvent` de type `reopen`
  - incremente `submissionCount` dans `ModerationCase`

### 4.2 Transitions depuis `CHANGES_REQUESTED`

| Action | Transition | Effet |
| --- | --- | --- |
| Organisateur re-soumet | `CHANGES_REQUESTED → PENDING_REVIEW` | emit `event.submitted_for_review` |
| Admin `reject` | `CHANGES_REQUESTED → CANCELLED` | emit `event.rejected` |
| Admin `approve` | `CHANGES_REQUESTED → PUBLISHED` | emit `event.published` |

## 5. Evenements metier emis

| Type | Emis par | Moment | Payload minimal |
| --- | --- | --- | --- |
| `event.submitted_for_review` | event-management-service | Soumission initiale ou re-soumission | `eventId`, `organizerId`, `caseId`, `submittedAt` |
| `event.published` | event-management-service | Approbation admin ou publication directe | `eventId`, `organizerId`, `publishedAt` |
| `event.rejected` | event-management-service | Rejet admin | `eventId`, `organizerId`, `reasonCode`, `rejectedAt` |
| `event.changes_requested` | event-management-service | Action `request_changes` | `eventId`, `organizerId`, `reasonCode`, `caseId`, `requestedAt` |

Les evenements sont emis vers la notification-service via l'endpoint
`/notifications/emit` (meme mecanique qu'`event.published` en Sprint 1).

## 6. API evenement cote event-management-service

### 6.1 Publication avec moderation potentielle

```
POST /events/drafts/:eventId/publish
Authorization: Bearer <organizer-token>
```

Reponses:

| Code | Body | Situation |
| --- | --- | --- |
| `200` | `{ success: true, data: Event }` avec `status: PUBLISHED` | Publication directe (moderation inactive ou criteres non atteints) |
| `202` | `{ success: true, data: Event }` avec `status: PENDING_REVIEW` | Soumis a moderation |
| `404` | `EVENT_NOT_FOUND` | Evenement inexistant |
| `409` | `EVENT_NOT_PUBLISHABLE` | Statut source invalide |
| `403` | `FORBIDDEN` | Pas le proprietaire |

### 6.2 Edition en `CHANGES_REQUESTED`

```
PATCH /events/drafts/:eventId
Authorization: Bearer <organizer-token>
```

Comportement: identique a l'edition d'un brouillon (`DRAFT`).
Statut `CHANGES_REQUESTED` est traite comme editable.

### 6.3 Rappel: endpoint de reconciliation admin

Defini dans `A02.1` / `Workflow_admin_moderation_contract.md`:

```
POST /api/admin/moderation-cases/:caseId/actions
body: { action, reasonCode, reasonNote }
```

L'admin-moderation-service met a jour le `ModerationCase` puis appelle
l'event-management-service pour propager le changement de statut.

## 7. Flux de communication inter-services

```
Admin UI
  │  POST /api/admin/moderation-cases/:caseId/actions
  ▼
API Gateway
  │
  ▼
admin-moderation-service
  │  1. valide la transition (matrice A02.1)
  │  2. met a jour ModerationCase
  │  3. PATCH /internal/events/:eventId/moderation-status
  ▼
event-management-service
     1. met a jour le statut evenement
     2. emet l'evenement metier correspondant
     3. retourne le Event mis a jour
```

L'endpoint interne `/internal/events/:eventId/moderation-status` est
protege par un secret partage (`INTERNAL_SERVICE_SECRET`) — pas de token
utilisateur.

## 8. Variables d'environnement

| Variable | Defaut | Description |
| --- | --- | --- |
| `MODERATION_ENABLED` | `false` | Active le flux de moderation |
| `MODERATION_THRESHOLD_PRICE` | `1000` | Prix au-dessus duquel la moderation est forcee |
| `INTERNAL_SERVICE_SECRET` | _(requis si MODERATION_ENABLED)_ | Secret partage inter-services |

## 9. Machine d'etat complete mise a jour

```
DRAFT
  ├── publish (direct)    → PUBLISHED
  ├── publish (moderation)→ PENDING_REVIEW
  └── delete              → (suppression logique)

PENDING_REVIEW
  ├── approve             → PUBLISHED
  ├── reject              → CANCELLED
  └── request_changes     → CHANGES_REQUESTED

CHANGES_REQUESTED
  ├── re-submit           → PENDING_REVIEW
  ├── approve             → PUBLISHED
  └── reject              → CANCELLED

PUBLISHED
  ├── cancel              → CANCELLED
  └── suspend (admin)     → SUSPENDED

SUSPENDED
  └── reopen (admin)      → PENDING_REVIEW

CANCELLED / ARCHIVED
  └── (terminaux)
```

## 10. Criteres d'acceptation (E06.3)

- Les cas "publication soumise a moderation" et "publication directe"
  sont explicitement separes par la variable `MODERATION_ENABLED`.
- Les transitions `PENDING_REVIEW → PUBLISHED/REJECTED/CHANGES_REQUESTED`
  et `CHANGES_REQUESTED → PENDING_REVIEW` sont documentees avec leur
  evenement metier associe.
- Le flux inter-services (admin-moderation → event-management) est
  explicite, incluant l'endpoint interne et le mecanisme d'authentification.
- La machine d'etat mise a jour integre les deux nouveaux statuts sans
  rompre les transitions existantes.
