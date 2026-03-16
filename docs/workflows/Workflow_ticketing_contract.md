# Workflow ticketing - contract `Sprint 0`

Ce document stabilise le contrat fonctionnel et technique de `R04.1`
pour la generation de billets electroniques.

Dependances:

- `R01.1` contrat de creation inscription
- `R03.1` contrat annulation/promotion
- catalogue async `ticket.generated`
- contrat frontend download protege `F06.1`

## 1. Objectif

Figer les decisions minimales pour que `R04.2` et `R04.3` puissent
implementer la generation de billet sans nouvel arbitrage sur:

- la reference unique du billet
- le modele `Ticket`
- le format de l'artefact genere
- le statut de disponibilite cote participant
- l'evenement async `ticket.generated`

## 2. Invariants metier

- un billet n'existe que pour une inscription `CONFIRMED`
- un billet est rattache a une seule `registrationId`
- un billet ne doit pas etre regenere en doublon sur replay
- une inscription `WAITLISTED` ou `CANCELLED` ne peut pas exposer de
  billet telechargeable
- l'option QR code reste facultative et ne change pas la reference
  canonique du billet

## 3. Ownership

- `ticketing-service` est owner du modele `Ticket`, de la reference
  billet et de la generation d'artefact
- `registration-service` reste owner du statut d'inscription et de
  l'exposition `canDownloadTicket` dans l'historique participant
- `media` ou stockage fichier reste owner du binaire servi au download
- `notification-service` consomme l'information billet sans devenir
  source de verite du ticket

## 4. Modele canonique `Ticket`

| Champ | Type | Requis | Notes |
| --- | --- | --- | --- |
| `ticketId` | `UUID` | oui | identifiant interne unique |
| `ticketRef` | `string` | oui | reference lisible et stable |
| `registrationId` | `UUID` | oui | relation 1 billet -> 1 inscription |
| `eventId` | `UUID` | oui | copie de contexte |
| `participantId` | `UUID` | oui | owner logique du billet |
| `status` | `PENDING \| ISSUED \| VOIDED` | oui | `ISSUED` uniquement apres generation effective |
| `artifactFormat` | `PDF \| PNG` | oui | `PDF` par defaut |
| `artifactUrl` | `string` | non | URL technique de stockage, jamais exposee brute au public |
| `qrCodeEnabled` | `boolean` | oui | `false` par defaut |
| `issuedAt` | `datetime` | non | renseigne si `ISSUED` |
| `voidedAt` | `datetime` | non | renseigne si `VOIDED` |
| `correlationId` | `string` | oui | suivi sync/async |

## 5. Reference billet

Format cible:

`TCK-<EVENT_SHORT>-<YYYYMMDD>-<SHORT_ID>`

Exemple:

`TCK-TECHDAY-20260402-A8F31C`

Regles:

- la reference est generee une seule fois par `ticketId`
- elle doit etre stable entre replays et re-downloads
- elle doit etre suffisante pour support et audit sans exposer de
  donnees personnelles
- `SHORT_ID` peut etre derive d'un identifiant aleatoire ou d'un hash
  tronque, mais doit rester unique dans l'evenement

## 6. Artefact et formats

Format initial retenu:

- `PDF` obligatoire pour `R04.2`
- `PNG` autorise comme variante future ou export derive
- QR code optionnel en surcouche de rendu (`R04.3`)

Contenu minimal du billet:

- `ticketRef`
- `eventTitle`
- `eventStartAt`
- `eventLocation`
- `participantDisplayName` ou equivalent
- `registrationId`

Contraintes:

- aucun secret, token ou URL signee ne doit etre embarque dans le rendu
- le nom de fichier telecharge s'aligne sur `ticketRef`
- la generation doit rester idempotente pour une meme inscription

## 7. Cycle de vie et exposition download

### 7.1 Transitions ticket

| Etat source | Trigger | Etat cible | Regle |
| --- | --- | --- | --- |
| `PENDING` | demande generation acceptee | `ISSUED` | artefact cree avec succes |
| `PENDING` | annulation avant emission | `VOIDED` | aucun download possible |
| `ISSUED` | annulation/remboursement invalide billet | `VOIDED` | download coupe apres propagation |

### 7.2 Exposition cote participant

`registration-service` ne passe `canDownloadTicket = true` que si:

- `registrationStatus = CONFIRMED`
- `Ticket.status = ISSUED`
- `ticketId` est resolu

Sinon:

- `CONFIRMED` sans billet emis -> `Billet en cours de generation`
- `WAITLISTED` -> pas de billet
- `CANCELLED` -> pas de billet

## 8. Evenement async `ticket.generated`

Producteur:

- `ticketing-service`

Emis quand:

- un billet passe a `ISSUED` apres generation effective de l'artefact

Payload minimal:

```json
{
  "ticketId": "22a4d1ce-6d18-48aa-920d-7a6de6a55f52",
  "ticketRef": "TCK-TECHDAY-20260402-A8F31C",
  "registrationId": "832486ad-700d-4b21-b9ae-fd3c37e99f0a",
  "eventId": "e5ff7702-f3f0-458b-a819-a1ca5b56cb0e",
  "participantId": "7c17c4b1-0ea7-4eb7-8143-7e972fd6ace6",
  "artifactFormat": "PDF",
  "artifactUrl": "https://media/tickets/22a4d1ce.pdf",
  "qrCodeEnabled": false,
  "issuedAt": "2026-04-02T08:45:00Z"
}
```

Consommateurs cibles:

- `registration-service` pour exposer `canDownloadTicket` et `ticketId`
- `notification-service` pour enrichir les messages de confirmation ou
  promotion

Regles d'idempotence:

- deduplication minimale sur `messageId`
- un replay ne doit pas creer un second billet
- un replay peut rejouer la projection participant sans effet de bord

## 9. ACL, securite et observabilite

- le download public direct d'un `artifactUrl` est interdit
- le telechargement passe par une facade authentifiee
  `GET /api/tickets/{ticketId}/download`
- les logs minimaux conservent:
  `ticketId`, `ticketRef`, `registrationId`, `eventId`, `participantId`,
  `result`, `correlationId`
- le QR code, s'il est active, ne doit contenir qu'une reference billet
  ou un pointeur opaque, jamais des donnees sensibles brutes

## 10. Hors scope de `R04.1`

- rendu graphique final du template billet
- implementation du moteur PDF/PNG
- validation a l'entree evenement par scan
- liens de partage ou wallet mobile

## 11. Sortie attendue

`R04.1` est valide quand:

- le modele `Ticket` est stabilise
- la reference billet et le format artefact sont fixes
- les conditions d'exposition `canDownloadTicket` sont explicites
- le payload `ticket.generated` est assez precis pour `R04.2`, `R05.3`
  et `N02.*`
