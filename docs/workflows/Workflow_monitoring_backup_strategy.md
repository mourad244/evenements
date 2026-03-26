# Workflow monitoring - Backup/restore strategy (Sprint 5)

Ce document formalise la strategie de sauvegarde et restauration
(ticket `M06.1`).

## 1. Objectif

- Definir les donnees critiques a proteger.
- Fixer periodicites de sauvegarde et politiques de retention.
- Clarifier objectifs de restauration (`RPO`, `RTO`) par domaine.

## 2. Scope

Composants couverts:

- bases transactionnelles des services critiques
  (`identity`, `event-management`, `registration`, `payment`).
- stockage media (images evenement, artefacts billets).
- configurations operationnelles critiques
  (secrets references, variables environnement, schemas).

Hors scope:

- sauvegardes poste developpeur local.
- dumps ad hoc non traces.

## 3. Classification des donnees

| Tier | Domaine | Exemples | Criticite |
| --- | --- | --- | --- |
| `T0` | Auth & sessions | comptes, roles, sessions actives | critique |
| `T0` | Registration | inscriptions, waitlist, capacite | critique |
| `T0` | Payment | transactions, reconciliation, audit paiement | critique |
| `T1` | Event management | drafts, publications, politiques event | elevee |
| `T1` | Ticketing/media | billets, QR, fichiers media | elevee |
| `T2` | Logs analytiques derives | agrégats ops non source de verite | moyenne |

## 4. Objectifs de restauration

| Tier | RPO cible | RTO cible | Priorite restauration |
| --- | --- | --- | --- |
| `T0` | `<= 15 min` | `<= 60 min` | priorite 1 |
| `T1` | `<= 60 min` | `<= 4 h` | priorite 2 |
| `T2` | `<= 24 h` | `<= 24 h` | priorite 3 |

Definitions:

- `RPO`:
  perte maximale de donnees acceptable.
- `RTO`:
  delai maximal pour retour operationnel.

## 5. Politique de sauvegarde

### 5.1 Bases transactionnelles (`T0`/`T1`)

- snapshots incrementaux:
  toutes les `15 min` (`T0`), toutes les `60 min` (`T1`).
- full backup:
  quotidienne (nuit locale).
- journal WAL/binlog:
  active pour restauration point-in-time.

### 5.2 Stockage objet (`T1`)

- versioning active sur bucket.
- replication cross-zone quotidienne.
- inventaire hebdomadaire des objets orphelins.

### 5.3 Configurations critiques

- export chiffre quotidien des manifests/config references.
- rotation cle de chiffrement selon politique securite.

## 6. Retention et archivage

- retention chaude:
  `30 jours` (restauration rapide).
- retention froide:
  `180 jours` archivee (cout optimise).
- retention legale/audit:
  selon contraintes metier et conformite en vigueur.

## 7. Securite des sauvegardes

- chiffrement at-rest et in-transit obligatoire.
- acces restreint principe moindre privilege.
- separation des roles:
  operateur backup != validateur restore.
- aucune cle/secret stockee dans depot source.

## 8. Strategie de restauration

Ordre de reprise recommande:

1. `identity-access` (authentification et ACL).
2. `registration` (etat capacite/inscriptions).
3. `payment` (coherence transactionnelle).
4. `event-management`.
5. `ticketing/media`.
6. services derives (`catalog`, dashboards).

Controles apres restore:

- integrite schema et contraintes.
- verification compte d'enregistrements critiques.
- verification coherence inter-domaines
  (`payment <-> registration <-> ticket`).

## 9. Gouvernance et responsabilites

- Owner strategie:
  `Mourad`.
- Reviewer operationnel:
  `Ibrahim`.
- frequence revue strategie:
  mensuelle ou apres incident majeur.

Livrables associes:

- `M06.2`: procedure technique pas a pas.
- `M06.3`: exercice de restauration documente.

## 10. Observabilite et audit

Metriques minimales:

- `backup_jobs_total`
- `backup_jobs_failed_total`
- `backup_duration_ms`
- `restore_tests_total`
- `restore_tests_failed_total`

Audit minimal:

- `BACKUP_JOB_STARTED`
- `BACKUP_JOB_COMPLETED`
- `BACKUP_JOB_FAILED`
- `RESTORE_TEST_EXECUTED`

## 11. Criteres d'acceptation

- les donnees critiques sont identifiees et classees.
- periodicites de sauvegarde et retention sont explicites.
- objectifs `RPO/RTO` sont definis par tier.
- priorites et ordre de restauration sont connus.
