# Workflow frontend - Sprint 2 integration plan

Ce document decrit comment integrer les helpers Sprint 2 dans les vues
frontend une fois le shell applicatif disponible.

## 1. Objectif

Converger les livraisons partielles `F06.3`, `N03.3`, `R05.3`, `R06.3`,
`F07.3` vers une integration UI complete.

## 2. Pre-requis backend

- `R04.2` ticket generation (ticketing-service)
- `R05.2` participant history endpoint
- `R06.2` organizer export endpoint
- `N03.2` SMS simulation + logs

## 3. Surfaces frontend cibles

- Participant: `/participant/participations`
- Organisateur: `/organizer/events/:eventId/registrations`
- Admin/notification: vue logs (Sprint 3+)

## 4. Modules partages a brancher

| Module | Usage principal | Ticket |
| --- | --- | --- |
| `services/shared/ticketDownloadHelper.js` | fetch blob protege | `F06.2` |
| `services/shared/ticketDownloadUx.js` | mapping UX erreurs download | `F06.3` |
| `services/shared/participantTicketUi.js` | CTA billet dashboard participant | `R05.3` |
| `services/shared/organizerExportUi.js` | CTA export organisateur | `R06.3` |
| `services/shared/notificationStatusUx.js` | filtres statut notification | `N03.3` |
| `services/shared/a11yFieldHelper.js` | a11y form labels/erreurs | `F07.3` |

## 5. Integration participant (R05.3 + F06.3)

1. Appeler `GET /api/profile/participations`.
2. Mapper chaque entree via `mapParticipationRow`.
3. Si `ticketCta.show`:
   - afficher bouton `Download ticket`
   - utiliser `downloadTicketWithUx` au click
4. Si `ticketCta.show` est faux:
   - afficher `ticketCta.message`

## 6. Integration organisateur export (R06.3)

1. Charger la vue inscrits pour un evenement.
2. Recuperer l'etat export via `R06.2` (payload `status`, `exportUrl`).
3. Mapper le CTA via `resolveExportCta`.
4. Afficher action:
   - `DOWNLOAD` -> bouton download
   - `WAIT` -> message attente + loader
   - `RETRY` -> bouton retry

## 7. Integration notification status (N03.3)

1. Lister les logs notification (`N06.2`).
2. Afficher le status via `mapNotificationStatusToUx`.
3. Exposer un filtre `SIMULATED` dans la UI admin.

## 8. Integration accessibilite (F07.3)

Pour chaque champ formulaire:

- generer `hintId` + `errorId` via `buildA11yMessageIds`
- injecter les props `buildA11yFieldProps`
- garantir un focus visible et lecture coherent via screen readers

## 9. Verification rapide

- Tests unitaires helper: `npm run test:s2-t03`, `test:s2-t04`,
  `test:s2-t05`, `test:s2-t06`, `test:s2-t07`, `test:s2-t08`
- Smoke UI:
  - participant telecharge un billet confirme
  - organisateur telecharge un export
  - admin filtre `SIMULATED`
