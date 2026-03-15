# Workflow registration - organizer export contract `Sprint 0`

Ce document stabilise le contrat de `R06.1` pour l'export des inscrits
par organisateur.

Dependances:

- `E05.1` vue inscrits organisateur
- `R05.1` projection historique/lecture registration
- `F03.3` vues organisateur

## 1. Objectif

Figer le format minimal de l'export organisateur afin que `R06.2` et
`R06.3` puissent implementer:

- la demande d'export
- l'etat de generation
- le telechargement du fichier
- les colonnes visibles cote organisateur

## 2. Ownership et ACL

- `registration-service` reste owner des donnees d'inscription exportees
- l'organisateur ne peut exporter que les inscrits de ses evenements
- `ADMIN` peut consulter ou relancer au besoin, mais l'usage cible reste
  l'organisateur owner
- aucune donnee d'un autre evenement ou d'un autre organisateur ne doit
  fuiter dans le fichier ou le payload d'etat

## 3. Format cible

Format initial retenu:

- `CSV` obligatoire pour `R06.2`
- `XLSX` reste une extension future, hors scope du lot courant

Nom de fichier cible:

`registrants-<eventId>-<YYYYMMDDHHMMSS>.csv`

## 4. Colonnes obligatoires

| Colonne | Requis | Notes |
| --- | --- | --- |
| `registrationId` | oui | reference interne support/audit |
| `eventId` | oui | scope export |
| `eventTitle` | oui | lisibilite fichier |
| `participantName` | oui | nom affiche organisateur |
| `participantEmail` | oui | contact principal |
| `registrationStatus` | oui | `CONFIRMED`, `WAITLISTED`, `CANCELLED`, `REJECTED` |
| `waitlistPosition` | non | renseigne si en attente |
| `ticketRef` | non | present uniquement si billet emis |
| `ticketStatus` | non | utile pour support organisateur |
| `registeredAt` | oui | horodatage creation |
| `updatedAt` | oui | dernier changement connu |

## 5. Contrat API cible

### 5.1 Demande d'export

`POST /api/organizer/events/{eventId}/registrations/export`

Succes:

- `202 Accepted`
- payload minimal:
  - `exportId`
  - `status = RUNNING`
  - `format = csv`
  - `exportUrl = null`

Erreurs:

- `401`
- `403`
- `404`
- `400` si le format demande n'est pas supporte

### 5.2 Consultation de l'etat export

`GET /api/organizer/events/{eventId}/registrations/export/{exportId}`

Succes:

- `200`
- payload minimal:
  - `exportId`
  - `status` dans `RUNNING | READY | FAILED`
  - `format`
  - `exportUrl?`
  - `expiresAt?`

## 6. Regles metier

- un export doit etre scope a un seul `eventId`
- le fichier inclut uniquement les inscriptions visibles par
  l'organisateur owner
- `ticketRef` reste vide si aucun billet n'a ete emis
- le statut export `READY` n'est retourne que si un fichier est
  effectivement disponible
- `FAILED` doit etre exploitable cote UI via un retry simple

## 7. Observabilite et audit

- journaliser `exportId`, `eventId`, `organizerId`, `format`, `status`
- conserver `correlationId` sur demande et consultation
- tracer les erreurs de generation et le nombre de lignes exportees

## 8. Hors scope de `R06.1`

- format `XLSX`
- planification recurrente d'exports
- filtres avances multi-evenements

## 9. Sortie attendue

`R06.1` est valide quand:

- le format cible est fixe
- les colonnes obligatoires sont definies
- le payload d'etat (`status`, `exportUrl`) est stable pour `R06.3`
- le scope ACL organisateur est explicite
