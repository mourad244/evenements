# Workflow monitoring - Backup/restore procedure (Sprint 5)

Ce document formalise la procedure technique pas a pas
backup/restauration (ticket `M06.2`).

## 1. Objectif

- Executer une sauvegarde complete ou critique de l'environnement cible.
- Restaurer de maniere controlee en cas d'incident.
- Standardiser les preuves d'execution et d'audit.

## 2. Dependances

- `M06.1`: strategie backup/restore
- `M05.3`: runbooks ops

## 3. Procedure backup (resume)

Ordre d'execution:

1. `BK-01`:
   precheck sante services critiques.
2. `BK-02`:
   geler les ecritures critiques.
3. `BK-03`:
   snapshot PIT des bases transactionnelles.
4. `BK-04`:
   sauvegarde stockage objet (media + ticket).
5. `BK-05`:
   export config/manifests references.
6. `BK-06`:
   verification checksums + inventaire.
7. `BK-07`:
   lever le gel ecriture + publier rapport.

## 4. Procedure restore (resume)

Ordre d'execution:

1. `RS-01`:
   confirmer scope incident + point de restauration.
2. `RS-02`:
   preparer workspace de restauration isole.
3. `RS-03`:
   restaurer `identity`, `registration`, `payment`.
4. `RS-04`:
   restaurer event + artefacts ticket/media.
5. `RS-05`:
   reappliquer configs et redemarrer services.
6. `RS-06`:
   checks d'integrite metier et technique.
7. `RS-07`:
   reouverture progressive trafic + surveillance.

## 5. Artefacts de preuve

- manifest backup (liste artefacts + checksums)
- horodatage debut/fin procedure
- rapport validation integrite
- journal actions operateur
- audit event final (`BACKUP_JOB_COMPLETED` ou `RESTORE_PROCEDURE_COMPLETED`)

## 6. Mapping implementation

Implementation partagee:

- `services/shared/monitoringBackupRestoreProcedure.js`

Fonctions:

- `buildBackupProcedurePlan`
- `buildRestoreProcedurePlan`
- `validateProcedureExecution`
- `buildProcedureExecutionReport`

## 7. Criteres d'acceptation

- une procedure pas a pas permet de sauvegarder puis restaurer.
- l'ordre critique des etapes de restoration est explicite.
- la validation d'execution detecte manques et erreurs d'ordre.
- un rapport d'execution audit-ready est produit.
