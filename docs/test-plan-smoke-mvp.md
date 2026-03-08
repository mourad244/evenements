# Plan de smoke tests MVP - P1

## Objet

Fournir une checklist courte, rejouable et partagee pour valider les
contrats critiques du MVP `P1` avant et pendant `Sprint 1`.

## Perimetre

- auth et session
- creation/publication d'evenement
- catalogue public
- inscription, waitlist, annulation, promotion
- historique participant
- health checks et correlation-id

## Preconditions minimales

- la Gateway route correctement vers les services `P1`;
- chaque service expose `/health` et `/ready`;
- un environnement de test ou local existe avec persistence propre;
- les statuts et payloads suivent `docs/api-contracts-p1.md`;
- les events async suivent `docs/async-events-p1.md`.

## Jeu de donnees recommande

- `organizer-1`: compte `ORGANIZER` actif
- `participant-1`: compte `PARTICIPANT` actif
- `participant-2`: compte `PARTICIPANT` actif
- `event-open-1`: evenement publiable puis publie avec capacite `1`
- `event-invalid-1`: brouillon incomplet pour tester `422`

## Verifications transverses

Avant les parcours metier:

- verifier `GET /health` et `GET /ready` sur chaque service `P1`;
- verifier qu'un `X-Correlation-ID` entrant est retrouve en logs;
- verifier que les erreurs exposent `success: false` et un `code`
  coherent.

## Scenarios smoke

| ID | Parcours | Acteur | Routes clefs | Resultat attendu |
| --- | --- | --- | --- | --- |
| `SMK-01` | register -> login -> refresh | public | `/api/auth/register`, `/api/auth/login`, `/api/auth/refresh` | session utilisable et payloads homogenes |
| `SMK-02` | forgot/reset password | public | `/api/auth/forgot-password`, `/api/auth/reset-password` | reponses non enumerantes et reset fonctionnel |
| `SMK-03` | create draft | organizer | `/api/events/drafts` | brouillon cree en `DRAFT` |
| `SMK-04` | validation draft invalide | organizer | `/api/events/drafts`, `/api/events/drafts/{id}` | `400` ou `422` selon le cas |
| `SMK-05` | publish event | organizer | `/api/events/drafts/{id}/publish` | transition `DRAFT -> PUBLISHED` + trace event |
| `SMK-06` | public catalog list/detail | public | `/api/catalog/events`, `/api/catalog/events/{id}` | evenement publie visible, brouillon invisible |
| `SMK-07` | registration confirmed | participant | `/api/registrations` | premiere inscription en `CONFIRMED` |
| `SMK-08` | registration waitlisted | participant | `/api/registrations` | seconde inscription en `WAITLISTED` |
| `SMK-09` | cancel -> promote | participant | `/api/registrations/{id}/cancel` | annulation + promotion de la waitlist |
| `SMK-10` | participant history | participant | `/api/profile/participations` | historique coherent avec les statuts |
| `SMK-11` | ACL minimal | public/participant/organizer | routes protegees `events`, `registrations`, `profile` | `401/403` corrects selon le cas |
| `SMK-12` | traceability | organizer/participant | flux publish et registration | meme `correlation-id` visible dans les logs critiques |

## Detail des checks

### `SMK-01` - register -> login -> refresh

- `POST /api/auth/register` retourne `201`
- `POST /api/auth/login` retourne `200` avec `accessToken`,
  `refreshToken`, `sessionId`
- `POST /api/auth/refresh` retourne `200` avec un nouvel
  `accessToken`

Checks:

- le `role` et le `userId` restent stables entre login et refresh
- un mot de passe invalide renvoie `401`
- un email deja pris renvoie `409`

### `SMK-02` - forgot/reset password

- `POST /api/auth/forgot-password` retourne `202` sur email existant ou
  non existant
- `POST /api/auth/reset-password` retourne `200` pour un token valide

Checks:

- aucune enumeration de compte dans la reponse
- un token invalide ou expire renvoie `401` ou `422`

### `SMK-03` - create draft

- `POST /api/events/drafts` en tant qu'organisateur retourne `201`

Checks:

- `status = DRAFT`
- `organizerId` = utilisateur authentifie
- les champs obligatoires sont conserves tels que saisis

### `SMK-04` - validation draft invalide

Tester au moins:

- `capacity <= 0`
- `startAt` manquant
- `endAt < startAt`

Checks:

- la reponse retourne `400` ou `422`
- `details` liste les champs en erreur

### `SMK-05` - publish event

- `POST /api/events/drafts/{id}/publish` retourne `200`

Checks:

- `status = PUBLISHED`
- `publishedAt` renseigne
- un log ou message prouve l'emission de `event.published`

### `SMK-06` - public catalog list/detail

- `GET /api/catalog/events` retourne la ressource publiee
- `GET /api/catalog/events/{id}` retourne le detail public

Checks:

- un brouillon n'apparait jamais dans le catalogue
- les filtres `theme`, `city`, `from`, `to` ne cassent pas la pagination
- le detail d'un `eventId` non public retourne `404`

### `SMK-07` - registration confirmed

- `POST /api/registrations` par `participant-1` retourne `201`

Checks:

- `status = CONFIRMED`
- aucun doublon actif ne peut etre cree pour le meme couple
  participant/evenement
- un event trace `registration.confirmed` est visible

### `SMK-08` - registration waitlisted

- `POST /api/registrations` par `participant-2` sur le meme event
  retourne `201`

Checks:

- `status = WAITLISTED`
- `waitlistPosition = 1`
- un event trace `registration.waitlisted` est visible

### `SMK-09` - cancel -> promote

- annuler l'inscription `CONFIRMED` via
  `POST /api/registrations/{id}/cancel`

Checks:

- l'inscription initiale passe a `CANCELLED`
- la premiere entree waitlist passe a `CONFIRMED`
- un event `registration.promoted` est visible

### `SMK-10` - participant history

- `GET /api/profile/participations` retourne les inscriptions du
  participant connecte

Checks:

- aucun participant ne voit les inscriptions d'un autre
- les statuts `CONFIRMED`, `WAITLISTED`, `CANCELLED` sont coherents avec
  les actions precedentes

### `SMK-11` - ACL minimal

Verifier au moins:

- un public ne peut pas appeler `/api/events/drafts`
- un participant ne peut pas publier un event
- un organisateur ne peut pas lire l'historique d'un autre participant

Checks:

- absence de token -> `401`
- role incorrect ou ownership invalide -> `403`

### `SMK-12` - traceability

Sur un flux `publish` puis un flux `registration`:

- envoyer un `X-Correlation-ID` connu
- verifier sa presence cote Gateway et services metier

Checks:

- le meme identifiant est retrouve dans les logs critiques
- les logs mentionnent le service, la route et le resultat

## Sortie attendue de la smoke checklist

- une liste courte de scenarios rejouables a chaque increment `P1`;
- une base commune backend/frontend pour les tests croises;
- une preuve documentaire que `Sprint 1` peut commencer sans contrat
  flou.
