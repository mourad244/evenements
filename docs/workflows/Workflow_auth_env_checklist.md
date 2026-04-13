# Workflow identity - Auth env/secrets checklist (`I06.1`)

Ce document liste toutes les variables d'environnement critiques du
domaine authentification / securite et leurs valeurs attendues par
environnement (ticket `I06.1`).

Dependances:

- `I03.1` contrat JWT/session

## 1. Objectif

Permettre a n'importe quel membre de l'equipe de:

- verifier que l'environnement cible est correctement configure
  avant un deploiement
- identifier immediatement les variables manquantes ou insecures
- appliquer des valeurs par defaut strictes en dev sans risque de
  fuite en production

## 2. Variables par service

### 2.1 identity-access-service

| Variable | Obligatoire | Dev (defaut acceptable) | Prod | Notes |
| --- | --- | --- | --- | --- |
| `JWT_ACCESS_SECRET` | Oui | `dev-access-secret-min32chars!!` | Secret aleatoire >= 64 caracteres | Generer avec `openssl rand -hex 32` |
| `JWT_REFRESH_SECRET` | Oui | `dev-refresh-secret-min32chars!` | Secret aleatoire >= 64 caracteres | Distinct de `JWT_ACCESS_SECRET` |
| `JWT_ACCESS_TTL` | Non | `900` (15 min) | `900` | En secondes |
| `JWT_REFRESH_TTL` | Non | `604800` (7 j) | `86400` (1 j) | En secondes |
| `ALLOW_INSECURE_JWT_DEFAULTS` | Non | `true` | `false` — NE PAS mettre a `true` | Active les secrets faibles en dev uniquement |
| `DATABASE_URL` | Oui | `postgres://postgres:postgres@127.0.0.1:55432/evenements_s1_m01` | URL complete avec credentials forts | Ne jamais commiter |
| `PORT` | Non | `4001` | `4001` | — |
| `DB_AUTO_MIGRATE` | Non | `true` | `false` (migrations separees) | — |
| `BCRYPT_ROUNDS` | Non | `10` | `12` | Minimum 10 en prod |
| `MAX_LOGIN_ATTEMPTS` | Non | `5` | `5` | Seuil de lockout |
| `LOCKOUT_DURATION_MS` | Non | `900000` (15 min) | `900000` | En ms |

### 2.2 api-gateway

| Variable | Obligatoire | Dev | Prod | Notes |
| --- | --- | --- | --- | --- |
| `JWT_ACCESS_SECRET` | Oui | Meme valeur que identity-service | Meme valeur que identity-service | Les deux services DOIVENT partager la meme cle |
| `ALLOW_INSECURE_JWT_DEFAULTS` | Non | `true` | `false` | — |
| `PORT` | Non | `4000` | `4000` | — |
| `IDENTITY_SERVICE_URL` | Oui | `http://127.0.0.1:4001` | URL interne | — |
| `EVENT_SERVICE_URL` | Oui | `http://127.0.0.1:4002` | URL interne | — |
| `REGISTRATION_SERVICE_URL` | Oui | `http://127.0.0.1:4003` | URL interne | — |
| `CORS_ORIGIN` | Non | `*` | Domaine(s) explicite(s) | NE PAS laisser `*` en prod |

### 2.3 event-management-service

| Variable | Obligatoire | Dev | Prod | Notes |
| --- | --- | --- | --- | --- |
| `DATABASE_URL` | Oui | `postgres://postgres:postgres@127.0.0.1:55432/evenements_s1_m01` | URL complete | — |
| `PORT` | Non | `4002` | `4002` | — |
| `DB_AUTO_MIGRATE` | Non | `true` | `false` | — |
| `REGISTRATION_SERVICE_URL` | Oui | `http://127.0.0.1:4003` | URL interne | — |
| `MEDIA_STORAGE_PATH` | Non | `./uploads` | Chemin absolu sur volume persistant | — |
| `MEDIA_PUBLIC_PREFIX` | Non | `/uploads` | Prefix public | — |
| `MODERATION_ENABLED` | Non | `false` | `true` si Sprint 3 active | — |
| `MODERATION_THRESHOLD_PRICE` | Non | `1000` | Configurable | En MAD |
| `INTERNAL_SERVICE_SECRET` | Si MODERATION_ENABLED | — | Secret partage inter-services | — |

### 2.4 registration-service

| Variable | Obligatoire | Dev | Prod | Notes |
| --- | --- | --- | --- | --- |
| `DATABASE_URL` | Oui | `postgres://postgres:postgres@127.0.0.1:55432/evenements_s1_m01` | URL complete | — |
| `PORT` | Non | `4003` | `4003` | — |
| `DB_AUTO_MIGRATE` | Non | `true` | `false` | — |
| `EVENT_SERVICE_URL` | Oui | `http://127.0.0.1:4002` | URL interne | — |

## 3. Variables communes a tous les services

| Variable | Valeur recommandee | Description |
| --- | --- | --- |
| `NODE_ENV` | `development` / `production` | Controle les comportements securises |
| `LOG_LEVEL` | `info` (prod), `debug` (dev) | Niveau de log |

## 4. Regles de securite par environnement

### Dev local

- `ALLOW_INSECURE_JWT_DEFAULTS=true` est tolere pour accelerer
  le demarrage.
- Les secrets peuvent etre commites dans `.env.example` avec des
  valeurs factices explicitement marquees (`CHANGE_ME`).
- Le fichier `.env` reel ne doit **jamais** etre commite (il est
  dans `.gitignore`).

### CI / staging

- `ALLOW_INSECURE_JWT_DEFAULTS` doit etre `false`.
- Les secrets sont injectes via les variables de CI (GitHub Secrets,
  GitLab CI variables, etc.).
- `DB_AUTO_MIGRATE=true` est acceptable en staging si la base est
  ephemere.

### Production

- `ALLOW_INSECURE_JWT_DEFAULTS=false` obligatoire.
- `JWT_ACCESS_SECRET` et `JWT_REFRESH_SECRET` >= 64 caracteres,
  generes avec `openssl rand -hex 32` (produit 64 chars hex).
- `DB_AUTO_MIGRATE=false` — les migrations sont executees en etape
  separee avec controle humain.
- `CORS_ORIGIN` liste les domaines explicites.
- `NODE_ENV=production`.

## 5. Checklist de validation pre-deploiement

```
[ ] JWT_ACCESS_SECRET present et >= 32 chars
[ ] JWT_REFRESH_SECRET present, distinct de JWT_ACCESS_SECRET
[ ] ALLOW_INSECURE_JWT_DEFAULTS absent ou false
[ ] DATABASE_URL pointe vers la bonne base cible
[ ] DB_AUTO_MIGRATE=false (prod) ou confirme intentionnel
[ ] CORS_ORIGIN ne contient pas * (prod)
[ ] NODE_ENV=production
[ ] MEDIA_STORAGE_PATH pointe vers un volume persistant
[ ] MODERATION_ENABLED coherent avec le sprint deploye
[ ] Aucun secret present dans le code source (grep -r "SECRET" src/)
```

## 6. Procedure de rotation (voir I06.3)

La procedure complete de rotation des secrets JWT et des credentials
de base de donnees est specifiee dans `I06.3`
(`docs/workflows/Workflow_auth_secret_rotation.md`).

En cas d'urgence: changer `JWT_ACCESS_SECRET`, redemarrer les
services `identity-access-service` et `api-gateway` dans cet ordre.
Toutes les sessions existantes seront invalidees.
