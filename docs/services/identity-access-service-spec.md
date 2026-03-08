# Identity Access Service - Spec P1

> Lire `docs/workflows/Workflow_backend.md` avant implementation.

## 0. Meta

- **Service name**
  `identity-access-service`

- **Business domain**
  Authentifier les utilisateurs, gerer les sessions, les roles MVP,
  l'initialisation du reset mot de passe et le contrat de contexte auth
  consomme par la Gateway et les autres services.

- **Phase cible**
  `P1`

- **Backlog refs**
  `I01.1`, `I01.2`, `I01.3`, `I02.1`, `I02.2`, `I03.1`, `I04.1`,
  `I05.1`, `I06.1`

- **Sprint de cadrage**
  `Sprint 0`

## 1. Domain model

### Entites principales

#### `User`

- Champs clefs:
  `userId`, `email`, `passwordHash`, `displayName`, `role`,
  `accountStatus`, `createdAt`, `updatedAt`, `lastLoginAt`
- Relations:
  un `User` possede zero ou plusieurs `Session`
- Source de verite:
  `identity-access-service`

#### `Session`

- Champs clefs:
  `sessionId`, `userId`, `refreshTokenHash`, `expiresAt`, `revokedAt`,
  `createdAt`
- Relations:
  plusieurs sessions possibles par `User`
- Source de verite:
  `identity-access-service`

#### `PasswordResetToken`

- Champs clefs:
  `resetTokenId`, `userId`, `tokenHash`, `expiresAt`, `consumedAt`,
  `createdAt`
- Relations:
  lie a un `User`
- Source de verite:
  `identity-access-service`

### Statuts / transitions

#### Etats de compte

- Enum:
  `PENDING`, `ACTIVE`, `DISABLED`, `LOCKED`
- Transitions autorisees:
  - `PENDING -> ACTIVE`
  - `ACTIVE -> DISABLED`
  - `ACTIVE -> LOCKED`
  - `LOCKED -> ACTIVE`
  - `DISABLED -> ACTIVE`
- Transitions interdites:
  - toute connexion si `DISABLED`
  - toute connexion si `LOCKED`
  - reset reussi qui contourne explicitement `DISABLED`

#### Etat de session

Etat derive de la combinaison:

- `active` si `revokedAt = null` et `expiresAt > now`
- `revoked` si `revokedAt != null`
- `expired` si `expiresAt <= now`

Le service n'expose pas un enum de session distinct au MVP; il deduit
cet etat a la lecture.

## 2. API surface

### Principes

- Toutes les routes sont exposees via la Gateway sous `/api/auth/*`.
- Les routes `register`, `login`, `refresh`, `forgot-password`,
  `reset-password` sont publiques.
- Les reponses suivent:
  - succes: `{ success: true, data, meta? }`
  - erreur: `{ success: false, error, code?, details? }`

### `POST /api/auth/register`

- Objectif:
  creer un compte `PARTICIPANT` ou `ORGANIZER`
- Body:
  - `email`
  - `password`
  - `displayName`
  - `role`
- Reponse de succes:
  `201` avec `userId`, `email`, `displayName`, `role`,
  `accountStatus`, `nextAction`
- Erreurs attendues:
  - `400` payload invalide
  - `409` email deja utilise
  - `422` role non autorise en self-service
- Role ou permission requis:
  public
- Idempotence:
  non stricte; les doublons sont bloques par unicite email

### `POST /api/auth/login`

- Objectif:
  authentifier un utilisateur et ouvrir une session
- Body:
  - `email`
  - `password`
- Reponse de succes:
  `200` avec `accessToken`, `refreshToken`, `expiresIn`, `sessionId`,
  `user`
- Erreurs attendues:
  - `400` payload invalide
  - `401` credentials invalides
  - `401` avec `code = ACCOUNT_LOCKED`
  - `401` avec `code = ACCOUNT_DISABLED`
- Role ou permission requis:
  public
- Idempotence:
  non; chaque succes cree ou renouvelle une session explicite

### `POST /api/auth/refresh`

- Objectif:
  emettre un nouvel access token et un nouveau refresh token a partir
  d'une session valide
- Body:
  - `refreshToken`
- Reponse de succes:
  `200` avec nouveaux tokens, `expiresIn`, `sessionId`, `user`
- Erreurs attendues:
  - `400` payload invalide
  - `401` token invalide, revoque ou expire
- Role ou permission requis:
  public
- Idempotence:
  oui fonctionnelle si le client rejoue la meme intention; un ancien
  refresh token peut etre invalide selon la politique de rotation

### `POST /api/auth/forgot-password`

- Objectif:
  ouvrir un flux de reset sans enumerer les comptes
- Body:
  - `email`
- Reponse de succes:
  `202` avec message generique
- Erreurs attendues:
  - `400` payload invalide
- Role ou permission requis:
  public
- Idempotence:
  oui dans l'intention; plusieurs demandes restent acceptables

### `POST /api/auth/reset-password`

- Objectif:
  consommer un token de reset et modifier le mot de passe
- Body:
  - `token`
  - `newPassword`
- Reponse de succes:
  `200` avec confirmation
- Erreurs attendues:
  - `400` payload invalide
  - `401` token invalide ou expire
  - `422` token deja consomme ou mot de passe non conforme
- Role ou permission requis:
  public
- Idempotence:
  oui sur token consomme; un second appel doit echouer proprement

### Contrat JWT et contexte auth

Claims minimums de l'access token:

- `sub`: `userId`
- `sid`: `sessionId`
- `role`: role utilisateur
- `account_status`: etat du compte
- `iat`
- `exp`

Headers propages par la Gateway apres validation:

- `x-user-id`
- `x-user-role`
- `x-session-id`
- `x-correlation-id`

TTL recommande:

- access token: `15 min`
- refresh token: `7 jours` en dev/integration, variable par
  environnement

## 3. Evenements asynchrones

Le service n'a pas d'evenement metier `P1` obligatoire pour le runtime
MVP. En revanche, il reserve un hook d'audit transverse.

### `audit.action.recorded`

- Nom d'evenement:
  `audit.action.recorded`
- Producteur:
  `identity-access-service`
- Consommateurs attendus:
  futur `admin/audit-store`
- Payload minimal:
  - `actorId`
  - `actorRole`
  - `action`
  - `targetType`
  - `targetId`
  - `result`
  - `occurredAt`
  - `correlationId`
- Conditions d'emission:
  - login succes
  - login echec
  - forgot-password demande
  - reset-password succes/echec critique
  - lockout eventuel
- Comportement sur retry:
  dedoublonnage par `messageId`; un replay ne doit pas creer plusieurs
  entrees d'audit finales

## 4. Validation & business rules

### Register

- `email` obligatoire, normalise et unique
- `password` obligatoire avec politique minimale de complexite
- `displayName` obligatoire, non vide
- `role` limite a `PARTICIPANT` ou `ORGANIZER` en self-service

### Login

- refuser si `accountStatus != ACTIVE`
- ne pas distinguer publiquement "email inconnu" et "mot de passe faux"
- mettre a jour `lastLoginAt` sur succes

### Refresh

- un refresh token revoque ou expire est inutilisable
- la session cible doit appartenir a un `User` toujours actif
- le refresh ne doit jamais elever le role

### Forgot / Reset password

- `forgot-password` repond toujours `202` si le payload est valide
- le token de reset est a usage unique
- la rotation du mot de passe invalide les tokens de reset actifs
- le reset peut revoquer les refresh tokens existants selon la politique
  de securite retenue

### Regles inter-entites

- un `Session.userId` doit toujours referencer un `User` existant
- un `PasswordResetToken.userId` doit toujours referencer un `User`
  existant
- la suppression physique de `User` n'est pas necessaire en `P1`; le
  service privilegie les changements d'etat

### Verifications de concurrence / unicite

- unicite stricte sur `User.email`
- invalidation atomique d'un `refreshToken`
- consommation atomique d'un `PasswordResetToken`

## 5. Securite & audit

### Type d'auth

- Auth primaire du service: publique sur les routes d'entree auth
- Auth secondaire: validation JWT par la Gateway pour les futures routes
  protegees

### Roles / permissions

- `PARTICIPANT`
  - se connecter
  - rafraichir sa session
  - demander un reset
- `ORGANIZER`
  - memes droits auth que `PARTICIPANT`
- `ADMIN`
  - hors routes auth publiques au MVP; reserve pour suites admin

### Actions a journaliser

- tentative de `register`
- `login` succes / echec
- `refresh` echec critique
- `forgot-password`
- `reset-password` succes / echec
- verrouillage ou reactivation de compte quand ces flux seront exposes

### Donnees sensibles a proteger

- `passwordHash`
- `refreshTokenHash`
- `tokenHash`
- secrets JWT et parametres de rotation
- email a masquer partiellement dans certains logs si necessaire

## 6. Observabilite

### Health checks

- `GET /health`
  - retourne `ok` si le service repond
- `GET /ready`
  - retourne `ready` si la base auth et les dependances critiques sont
    joignables

### Logs structures

Champs minimums:

- `service = identity-access-service`
- `route`
- `method`
- `result`
- `userId` si connu
- `sessionId` si connu
- `correlationId`

### Metriques metier minimales

- nombre de `register` reussis / echoues
- nombre de `login` reussis / echoues
- nombre de `refresh` reussis / echoues
- nombre de demandes de reset
- latence des endpoints auth

### Correlation-id

- le service consomme `x-correlation-id` depuis la Gateway
- il le reproduit dans tous les logs et events d'audit

## 7. Integrations externes

### API Gateway

- mode:
  synchrone
- usage:
  exposition des routes, validation d'access token, propagation des
  headers de contexte

### Base de donnees auth

- mode:
  synchrone
- usage:
  persister `User`, `Session`, `PasswordResetToken`

### Notification service

- mode:
  aucun appel direct obligatoire en `P1`
- usage:
  reserve pour `P2` si `forgot-password` ou autres emails transactionnels
  sont externalises

### Admin / audit store

- mode:
  async reserve via `audit.action.recorded`
- usage:
  consultation centralisee des actions sensibles a partir de `P3`

## 8. Tests minimaux

### Smoke routes principales

- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/refresh`
- `POST /api/auth/forgot-password`
- `POST /api/auth/reset-password`

### Tests `401/403/200`

- `login` invalide -> `401`
- `refresh` avec token expire -> `401`
- compte `LOCKED` ou `DISABLED` -> `401` avec `code` metier stable

### Tests des transitions critiques

- `PENDING -> ACTIVE`
- `ACTIVE -> LOCKED`
- `LOCKED -> ACTIVE`
- session active -> session revoquee
- reset token cree -> consomme

### Tests de non-regression metier

- un email ne peut pas etre cree deux fois
- un refresh token revoque n'est plus reutilisable
- un reset token consomme ne peut pas etre rejoue
- le `role` retourne par `refresh` reste identique a celui du `User`

## 9. Definition of Done

- spec completee et reliee au `Sprint 0`
- endpoints auth/JWT clairs et coherents avec `docs/api-contracts-p1.md`
- ownership `User`, `Session`, `PasswordResetToken` explicite
- headers de contexte auth/Gateway stabilises
- audit, observabilite et security notes sans angle mort critique
- base suffisante pour ouvrir `feature/auth-endpoints-mvp`,
  `feature/gateway-auth-middleware` et `feature/auth-context-propagation`
