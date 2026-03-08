# Matrice de recette et d'acceptation par phase

## Objet

Relier les user stories `P1` a `P4` a une liste courte de scenarios de
recette, afin que chaque ouverture de phase ait un gate de sortie clair
et partage.

## Sources de verite

- `docs/user_stories/user_stories_table.md`
- `docs/mvp_scope.md`
- `docs/api-contracts-p1.md`
- `docs/async-events-p1.md`
- specs de service dans `docs/services/`

## Regles d'usage

- une phase n'est pas consideree "acceptee" tant que tous ses scenarios
  `Must` sont verts
- les preuves minimales attendues sont:
  - resultat fonctionnel visible
  - statut ou payload conforme
  - trace ou log exploitable si le flux traverse plusieurs services
- les tests smoke et les regressions ACL completent cette matrice mais
  ne la remplacent pas

## Vue d'ensemble

| Phase | User stories couvertes | Gate de sortie minimal |
| --- | --- | --- |
| `P1` | `US01` a `US07` | auth, publication, catalogue, inscription, waitlist, historique stables |
| `P2` | `US08` a `US10` | billet, export et notifications de base stables |
| `P3` | `US11` a `US13` | moderation, recherche admin et audit incident exploitables |
| `P4` | `US14` a `US15` | paiement et eligibilite evenement prive stabilises |

## Matrice detaillee

### `P1` - MVP publication & inscription

| ID | Story | Acteur | Scenario de recette | Resultat attendu | Preuve minimale |
| --- | --- | --- | --- | --- | --- |
| `ACC-P1-01` | `US01` | participant/organizer | creer un compte, se connecter, renouveler la session, demander un reset de mot de passe | auth et session fonctionnent sans fuite d'information | `201/200/202` conformes, compte actif, refresh valide |
| `ACC-P1-02` | `US02` | organizer | creer un brouillon avec titre, lieu, date, capacite et visibilite | brouillon persiste en `DRAFT` avec ownership correct | payload de creation et lecture coherents |
| `ACC-P1-03` | `US03` | organizer | publier un brouillon valide | `DRAFT -> PUBLISHED`, emission `event.published` et visibilite publique derivee | `publishedAt` renseigne + trace async |
| `ACC-P1-04` | `US04` | public | consulter la liste publique, filtrer par theme/date/ville et ouvrir le detail | seuls les evenements publics sont visibles, detail coherent, brouillons caches | resultat liste/detail + `404` sur ressource non publique |
| `ACC-P1-05` | `US05` | participant | s'inscrire a un evenement avec places disponibles | inscription `CONFIRMED` sans depassement de capacite | payload `CONFIRMED` + trace `registration.confirmed` |
| `ACC-P1-06` | `US06` | participant | s'inscrire a un evenement complet puis liberer une place | inscription `WAITLISTED`, position lisible, promotion atomique a l'annulation | payload waitlist + trace `registration.promoted` |
| `ACC-P1-07` | `US07` | participant | consulter mon historique de participations | seules mes inscriptions sont visibles avec statuts coherents | reponse `/api/profile/participations` filtree par owner |

Gate `P1`:

- tous les scenarios `ACC-P1-*` passent
- la smoke checklist `docs/test-plan-smoke-mvp.md` est verte
- aucune regression bloquante `401/403` n'est ouverte sur les routes MVP

### `P2` - Ticketing & notifications

| ID | Story | Acteur | Scenario de recette | Resultat attendu | Preuve minimale |
| --- | --- | --- | --- | --- | --- |
| `ACC-P2-01` | `US08` | participant | telecharger mon billet apres confirmation effective | billet unique disponible uniquement pour une inscription eligible | artefact de billet accessible et lie a `registrationId` |
| `ACC-P2-02` | `US09` | organizer | exporter la liste des inscrits d'un evenement | export filtre sur l'evenement owner avec statuts coherents | fichier ou payload export valide |
| `ACC-P2-03` | `US10` | participant/system | declencher confirmation, attente, promotion et rappel | les notifications attendues sont envoyees ou journalisees sans doublon logique | traces `notification` et correlation-id exploitables |

Gate `P2`:

- aucun billet n'est genere avant confirmation effective
- les notifications critiques sont dedoublonnees
- l'export organisateur ne fuit aucune donnee hors ownership

### `P3` - Admin, moderation et audit

| ID | Story | Acteur | Scenario de recette | Resultat attendu | Preuve minimale |
| --- | --- | --- | --- | --- | --- |
| `ACC-P3-01` | `US11` | admin | moderer un evenement signale ou en attente | approbation/rejet journalises avec motif et acteur | trace d'audit + etat final visible |
| `ACC-P3-02` | `US12` | admin | rechercher un utilisateur ou evenement sur plusieurs criteres | recherche multicriteres navigable et filtree correctement | resultats pagines + filtres applicables |
| `ACC-P3-03` | `US13` | admin | retracer un incident publish/registration par correlation-id | chronologie exploitable de bout en bout | logs, audit et entites cibles reliees |

Gate `P3`:

- les actions admin sont reservees au role `ADMIN`
- les traces d'audit critiques sont consultables
- un incident majeur peut etre reconstruit sans requete manuelle en base

### `P4` - Paiement & eligibilite evenement prive

| ID | Story | Acteur | Scenario de recette | Resultat attendu | Preuve minimale |
| --- | --- | --- | --- | --- | --- |
| `ACC-P4-01` | `US14` | participant | payer un evenement payant et suivre le statut de paiement | statut de paiement visible et coherent avec l'inscription | timeline paiement + statut inscription alignes |
| `ACC-P4-02` | `US15` | organizer/participant | gerer un evenement prive avec regle d'eligibilite | seuls les utilisateurs eligibles peuvent etre confirmes | cas accepte/refuse traces proprement |

Gate `P4`:

- aucun billet final n'est emis sans condition de paiement satisfaite
- les webhooks ou callbacks de paiement restent idempotents
- l'eligibilite privee est appliquee cote service, pas seulement en UI

## Sortie attendue

- une recette produit lisible par phase
- une passerelle claire entre user stories, specs et execution test
- une base commune pour valider l'ouverture ou la fermeture d'un sprint
