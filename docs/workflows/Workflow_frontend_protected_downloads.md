# Workflow frontend - protected downloads `Sprint 2`

Ce document stabilise le contrat UX/API pour le telechargement protege
des billets (`F06.1`), prealable a `F06.2` et `R05.3`.

Dependances:

- `R04.2` generation ticket PDF/PNG
- `R05.2` historique participant
- `F04.1` contrat ACL frontend
- `F05.1` etats UI partages

## 1. Objectif

Figer le comportement `preview/download` d'un billet sans exposition du
token dans l'URL, avec une gestion explicite des erreurs:

- `401`
- `403`
- `404`
- `502`

## 2. Surfaces frontend concernees

- participant: `/participant/participations`
- organisateur (lecture derivee future): vue inscrits evenement

Principe UI:

- action visible uniquement quand l'inscription est eligible au billet.
- action masquee ou desactivee avec message explicite sinon.

## 3. Conditions d'eligibilite de telechargement

Le bouton `Telecharger billet` est autorise si:

- `registrationStatus = CONFIRMED`
- `canDownloadTicket = true`
- `ticketId` present

Cas non eligibles:

- `WAITLISTED`: afficher `Billet indisponible (liste d'attente)`.
- `CANCELLED`: afficher `Billet indisponible (inscription annulee)`.
- `CONFIRMED` mais ticket pas encore genere:
  afficher `Billet en cours de generation`.

## 4. Contrat API cible (Gateway facade)

### 4.1 Historique participant

`GET /api/profile/participations`

Chaque item doit pouvoir exposer:

- `registrationId`
- `registrationStatus`
- `canDownloadTicket`
- `ticketId?`
- `ticketFormat?` (`PDF` par defaut)

### 4.2 Download protege

`GET /api/tickets/{ticketId}/download`

Regles:

- route protegee `PARTICIPANT` (ou `ORGANIZER` pour vue owner future)
- auth par header `Authorization: Bearer <token>`
- pas de token en query string
- propagation `x-correlation-id`

Succes attendu:

- `200`
- `Content-Type: application/pdf` (ou `image/png`)
- `Content-Disposition: attachment; filename="<ticketRef>.pdf"`

## 5. Mapping erreurs backend -> UX

| Code | Cause typique | UX attendue |
| --- | --- | --- |
| `401` | session absente/expiree | redirect login + retour sur route courante |
| `403` | ticket non autorise (owner mismatch/role) | ecran `403` ou banner acces refuse |
| `404` | ticket absent ou non genere | message `Billet indisponible pour le moment` |
| `502` | ticketing/media indisponible | banner temporaire + bouton `Reessayer` |

Regle:

- aucun code brut expose a l'utilisateur final.

## 6. Comportement client (helper `F06.2`)

Pseudo-contrat:

```ts
type DownloadTicketResult =
  | { ok: true; blob: Blob; filename: string }
  | { ok: false; code: 401 | 403 | 404 | 502; message: string };
```

Pipeline:

1. verifier eligibilite locale (`canDownloadTicket`, `ticketId`).
2. appeler endpoint download via client HTTP authentifie.
3. convertir la reponse en blob + telechargement navigateur.
4. mapper erreur vers message UX standardise.

## 7. Securite et observabilite

- Interdire tout lien de telechargement permanent partageable.
- Journaliser:
  - `ticketId`
  - `registrationId`
  - `userId`
  - `result` (`SUCCESS`, `DENIED`, `NOT_FOUND`, `UPSTREAM_ERROR`)
  - `correlationId`
- Les traces doivent permettre le suivi front -> gateway -> ticketing/media.

## 8. Hors scope de `F06.1`

- implementation du helper frontend
- implementation backend ticketing/media
- generation QR code et watermark

## 9. Sortie attendue

`F06.1` est valide quand:

- l'eligibilite download est explicite et stable
- le endpoint protege et ses regles d'auth sont fixes
- le mapping `401/403/404/502` est defini cote UX
- `F06.2` peut coder sans arbitrage restant
