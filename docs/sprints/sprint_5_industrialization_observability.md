# Sprint 5 - Industrialization & observability advanced

Sprint centre sur la readiness production:
observabilite, alerting ops et procedures de reprise.

**Statut:** `DONE`  
**Periode indicative:** 2026-06-15 -> 2026-07-03

## Objectifs

- Stabiliser la detection proactive des incidents critiques.
- Formaliser des runbooks actionnables pour l'equipe ops.
- Preparer le lot `v1.1-prod-ready` (alertes, runbooks, backup/restore).

## Services cibles

- API Gateway
- Registration
- Ticketing
- Notification
- Payment
- Admin & Moderation (surfaces ops)

## Livrables cibles

- matrice alertes/runbooks pour incidents critiques
- regles d'alerte exploitables (`M05.2`)
- runbooks pas a pas (`M05.3`)
- procedure backup/restore (`M06.2`) + exercice de restauration (`M06.3`)

## Definition of Done

- chaque incident critique a un seuil et un runbook associe.
- les alertes prioritaires peuvent etre declenchees automatiquement.
- les procedures de reprise sont lisibles, testees et tracables.

## Livrables realises

- matrice alertes/runbooks (`M05.1`)
- regles d'alerte implementables (`M05.2`)
- runbooks ops pas a pas (`M05.3`)
- strategie backup/restore (`M06.1`)
- procedure backup/restore technique (`M06.2`)
- exercice de restauration documente (`M06.3`)

## Verification finale

Verification executee le `2026-03-11`:

- `npm run test:s5-t02` -> `7 passed`, `0 failed`
- `npm run test:s5-t03` -> `6 passed`, `0 failed`
- `npm run test:s5-t06` -> `7 passed`, `0 failed`

## Risques / vigilance

- bruit d'alerte si seuils mal calibres.
- runbooks trop generiques donc peu actionnables en incident reel.
- ecart entre procedure documentee et environnement effectivement deploye.
