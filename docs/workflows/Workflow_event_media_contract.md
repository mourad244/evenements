# Workflow event - Media contract (`E04.1`)

Ce document stabilise le contrat fonctionnel et technique pour l'upload
et l'exposition des medias evenement (ticket `E04.1`).

Dependances:

- `E01.1` schema logique evenement
- `E02.1` contrat CRUD brouillon
- `F01.2` portail public catalogue

## 1. Objectif

Figer les decisions minimales pour que `E04.2` (upload) et `E04.3`
(exposition catalogue) puissent etre implementes sans nouvel arbitrage sur:

- les formats et limites de fichier acceptes
- le modele `MediaAsset`
- la reference exposee dans les reponses evenement
- les regles de securite et de cycle de vie

## 2. Modele `MediaAsset`

| Champ | Type | Requis | Notes |
| --- | --- | --- | --- |
| `assetId` | `UUID` | oui | identifiant interne unique |
| `eventId` | `UUID` | oui | relation 1 asset -> 1 evenement (MVP) |
| `organizerId` | `UUID` | oui | ownership de l'upload |
| `filename` | `string` | oui | nom original sanitise |
| `mimeType` | `string` | oui | ex: `image/jpeg` |
| `sizeBytes` | `number` | oui | taille en octets |
| `storagePath` | `string` | oui | chemin interne (local ou object-store) |
| `publicUrl` | `string` | oui | URL accessible en lecture par le catalogue |
| `createdAt` | `ISO-8601` | oui | horodatage de l'upload |

## 3. Formats acceptes

| Format | MIME type | Extension |
| --- | --- | --- |
| JPEG | `image/jpeg` | `.jpg`, `.jpeg` |
| PNG | `image/png` | `.png` |
| WebP | `image/webp` | `.webp` |

Tout autre type MIME doit etre rejete avec `400 UNSUPPORTED_MEDIA_TYPE`.

## 4. Limites de validation

| Contrainte | Valeur MVP |
| --- | --- |
| Taille maximale | 5 Mo (5 242 880 octets) |
| Dimensions minimales recommandees | 800 x 450 px (non bloquant, avertissement) |
| Nombre d'images par evenement | 1 (MVP; remplacement d'une precedente) |

Un fichier depassant la taille maximale est rejete avec
`413 FILE_TOO_LARGE`.

## 5. Contrat API

### 5.1 Upload

```
POST /events/drafts/:eventId/media
Content-Type: multipart/form-data
Authorization: Bearer <organizer-token>

field: image  (file)
```

Reponses:

| Code | Body | Situation |
| --- | --- | --- |
| `201` | `{ success: true, data: MediaAsset }` | Upload reussi |
| `400` | `VALIDATION_ERROR` | Champ manquant ou format invalide |
| `401` | `MISSING_AUTH_CONTEXT` | Token absent |
| `403` | `FORBIDDEN` | Pas l'organisateur proprietaire |
| `404` | `EVENT_NOT_FOUND` | Evenement inexistant |
| `409` | `EVENT_NOT_EDITABLE` | Statut != `DRAFT` |
| `413` | `FILE_TOO_LARGE` | Fichier > 5 Mo |
| `415` | `UNSUPPORTED_MEDIA_TYPE` | Format non accepte |

### 5.2 Suppression (optionnel MVP)

```
DELETE /events/drafts/:eventId/media
Authorization: Bearer <organizer-token>
```

Reponses: `204` (suppression OK) ou `404` (pas d'image existante).

## 6. Exposition catalogue

Le champ `imageUrl` est ajoute aux reponses catalog:

- `GET /catalog/events` → chaque item inclut `imageUrl: string | null`
- `GET /catalog/events/:eventId` → detail inclut `imageUrl: string | null`
- `GET /events/drafts` et `GET /events/drafts/:eventId` → incluent `imageUrl`
- `GET /events/me` → inclut `imageUrl`

Regles:

- Si aucun media n'a ete uploade: `imageUrl = null`.
- Le `publicUrl` stocke dans `MediaAsset` est servi directement sans
  transformation.
- Le catalogue ne doit jamais exposer `storagePath` (chemin interne).

## 7. Cycle de vie

- Un media est lie a un evenement; il est supprime logiquement si
  l'evenement est annule ou supprime.
- Un nouvel upload remplace l'asset existant (pas de galerie en MVP).
- Le remplacement ne supprime pas physiquement l'ancien fichier en MVP
  (nettoyage different).

## 8. Securite

- Seul l'organisateur proprietaire peut uploader ou supprimer un media
  pour son evenement.
- L'admin peut supprimer n'importe quel media (moderation).
- Le `publicUrl` est en lecture publique (pas d'authentification
  necessaire pour afficher l'image dans le catalogue).
- Le nom de fichier original est sanitise (strip path traversal,
  caracteres speciaux).

## 9. Stockage MVP

En MVP, les fichiers sont stockes sur le systeme de fichiers local du
service dans un repertoire configure par variable d'environnement
`MEDIA_STORAGE_PATH` (defaut: `./uploads`).

Le `publicUrl` est servi par une route statique ou un middleware
`express.static` sur le meme service.

Transition vers un object-store (S3 ou compatible) est prevue en Sprint 6.
