# Workflow admin - KPI catalog `Sprint 0`

Ce document stabilise le catalogue KPI admin pour `A05.1`.

Dependances:

- `A01.1` shell routes console admin
- `M03.1` baseline metriques et instrumentation

## 1. Objectif

Figer les KPI MVP admin avant implementation backend (`A05.2`) et dashboard
UI (`A05.3`) pour garantir:

- definition fonctionnelle unique
- source de verite explicite
- periodicite de calcul connue

## 2. Principes de cadrage

- Chaque KPI a un service owner principal (source-of-truth).
- Les KPI admin sont des vues de lecture consolidees, pas des nouvelles
  sources metier.
- Les calculs privilegient des fenetres temporelles glissantes (`D1`, `D7`,
  `D30`).
- Le dashboard admin affiche une date de rafraichissement explicite.

## 3. Catalogue KPI MVP

| KPI ID | KPI | Definition fonctionnelle | Source de verite | Calcul de reference | Periodicite |
| --- | --- | --- | --- | --- | --- |
| `KPI-ADM-01` | Evenements publies | Nombre d'evenements au statut `PUBLISHED` sur la fenetre | Event Management | `count(events where status=PUBLISHED and published_at in window)` | Horaire |
| `KPI-ADM-02` | Taux de remplissage moyen | Ratio moyen entre inscriptions confirmees et capacite des evenements publies | Registration + Event Management | `sum(confirmed)/sum(capacity)` sur evenements eligibles | Horaire |
| `KPI-ADM-03` | Attente active | Nombre d'inscriptions au statut `WAITLISTED` en cours | Registration | `count(registrations where status=WAITLISTED)` | 15 min |
| `KPI-ADM-04` | Promotions waitlist | Nombre de promotions de liste d'attente vers `CONFIRMED` | Registration | `count(registration.promoted in window)` | Horaire |
| `KPI-ADM-05` | Notifications en echec | Nombre de notifications avec resultat d'echec technique ou metier | Notification | `count(notification where delivery_status in [FAILED, BOUNCED])` | 15 min |

## 4. Surface de lecture cible (Sprint 3)

Route admin cible:

- `/admin/kpi` (deja figee par `A01.1`)

Contrat lecture backend cible (`A05.2`):

- `GET /api/admin/kpi?window=D7`
- Reponse contient:
  - `kpi_id`
  - `label`
  - `value`
  - `unit`
  - `window`
  - `computed_at`
  - `data_status` (`OK`, `DEGRADED`, `DELAYED`)

## 5. Permissions et audit

- Acces lecture reserve au role `ADMIN`.
- Toute consultation de dashboard peut etre tracee via un evenement
  `audit.action.recorded` (action `ADMIN_KPI_VIEWED`).
- Aucun endpoint KPI n'est expose aux roles `ORGANIZER` et `PARTICIPANT`.

## 6. Comportement en degradation

- Si une source est indisponible, le KPI passe en `DEGRADED` au lieu de
  masquer la carte.
- Si `computed_at` depasse la tolerance (`> 2x periodicite`), statut
  `DELAYED`.
- L'UI admin doit afficher la derniere valeur connue avec son etat de
  fraicheur.

## 7. Hors scope de `A05.1`

- implementation des jobs d'agregation backend
- stockage materialise des KPI
- rendu visuel final des cartes KPI

## 8. Sortie attendue

`A05.1` est valide quand:

- chaque KPI MVP possede une definition fonctionnelle stable
- la source de verite est explicite
- la periodicite de calcul est connue
- les contraintes de permission admin sont explicites
