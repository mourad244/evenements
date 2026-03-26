# Workflow monitoring - Restore drill validation (Sprint 5)

Ce document formalise l'exercice de restauration et sa preuve
operationnelle (ticket `M06.3`).

## 1. Objectif

- Verifier qu'une restauration complete est executable dans les delais cibles.
- Mesurer le respect des objectifs `RPO/RTO` definis dans `M06.1`.
- Produire une trace d'execution exploitable par audit et post-mortem.

## 2. Dependances

- `M06.1`: strategie backup/restore.
- `M06.2`: procedure technique backup/restore.
- `M05.3`: runbooks ops (escalade et journal incident).

## 3. Scenario de drill cible

Scenario recommande `DRILL-RS-01`:

- type:
  perte partielle des donnees transactionnelles `registration/payment`.
- scope:
  restauration point-in-time sur environnement de restauration isole.
- fenetre de reference:
  backup `T-30 min` (verification `RPO <= 15 min` pour `T0`).
- objectif de duree:
  retour operationnel en `<= 60 min` pour composants `T0`.

## 4. Preconditions obligatoires

- dernier manifest backup disponible avec checksums valides.
- environnement de restauration isole et vide de trafic utilisateur reel.
- acces operateur valide (roles restore + audit).
- checklist des etapes `RS-01` a `RS-07` disponible (issue de `M06.2`).
- canal escalation ouvert (`L1`, `L2`, `L3`).

## 5. Execution pas a pas

### 5.1 Preparation (`T-15` -> `T0`)

1. Ouvrir un ticket incident de test (`type=RESTORE_DRILL`).
2. Nommer l'owner exercice et le validateur independant.
3. Capturer l'etat initial:
   versions services, horodatage backup, volume de donnees cible.

### 5.2 Restauration (`T0` -> `T+45`)

1. Executer la procedure `RS-01` a `RS-05` dans l'ordre impose.
2. Enregistrer pour chaque etape:
   `startedAt`, `endedAt`, acteur, resultat, preuves.
3. Bloquer tout contournement manuel non documente.

### 5.3 Validation (`T+45` -> `T+60`)

1. Executer `RS-06`:
   integrite schema, comptages critiques, coherence inter-domaines.
2. Executer `RS-07`:
   reouverture progressive et verification metriques stabilisees.
3. Capturer le statut final:
   `PASS` ou `FAIL` avec cause racine.

## 6. Controles de succes

Le drill est `PASS` seulement si:

- toutes les etapes critiques `RS-*` sont executees sans omission.
- `RPO` observe respecte l'objectif du tier cible.
- `RTO` observe respecte l'objectif du tier cible.
- aucune incoherence bloquante `payment <-> registration <-> ticket`.
- un rapport d'execution complet est archive.

Le drill est `FAIL` si:

- une etape critique est sautee ou executee hors ordre.
- un controle d'integrite metier est en erreur non corrigee.
- le `RPO` ou `RTO` cible est depasse sans derogation approuvee.

## 7. Evidence et template de rapport

Artefacts minimums a joindre:

- ticket incident de test et timeline.
- manifest backup utilise + checksums.
- logs d'execution procedure restore.
- resultat des controles integrite metier/technique.
- decision finale `PASS/FAIL` signee par owner + validateur.

Template minimal:

```md
# Restore Drill Report - <drillId>
- Date: <YYYY-MM-DD>
- Owner: <name>
- Validator: <name>
- Scenario: DRILL-RS-01
- Backup reference: <artifact-id>
- Target tier: <T0|T1|T2>

## Timeline
- Start: <timestamp>
- End: <timestamp>
- Duration: <minutes>

## Objectives vs Observed
- RPO target / observed: <...>
- RTO target / observed: <...>

## Step Execution
- RS-01: <OK/KO + note>
- RS-02: <OK/KO + note>
- RS-03: <OK/KO + note>
- RS-04: <OK/KO + note>
- RS-05: <OK/KO + note>
- RS-06: <OK/KO + note>
- RS-07: <OK/KO + note>

## Integrity Checks
- Payment/Registration/Ticket coherence: <OK/KO>
- Critical record counts: <OK/KO>
- Service health after restore: <OK/KO>

## Final Decision
- Result: <PASS/FAIL>
- Blockers: <list>
- Corrective actions: <list>
```

## 8. Gouvernance

- Frequence minimale:
  1 drill par mois ou apres changement majeur infra/data.
- Responsable execution:
  `Mourad`.
- Responsable validation:
  `Ibrahim`.
- Suivi:
  toute action corrective ouvre un ticket backlog date et priorise.

## 9. Criteres d'acceptation (`M06.3`)

- un exercice de restauration est execute sur un scenario explicite.
- les resultats attendus (`RPO/RTO`, integrite) sont verifies.
- la preuve d'execution est documentee dans un rapport lisible.
