# Sprint 1 - MVP publication & inscription

Sprint centre sur la livraison du premier vertical slice executable du
MVP `P1`, avec un lot principal porte par `Mourad`.

**Statut:** `READY TO START`  
**Periode indicative:** `2026-03-23 -> 2026-04-10`  
**Equipe:** `Mourad` + `Ibrahim`  
**Owner principal du sprint:** `Mourad`

## But du sprint

Livrer un socle backend et transverse assez complet pour que:

- un utilisateur puisse creer un compte et se connecter;
- un organisateur puisse creer un brouillon, le publier et relire ses
  evenements;
- un participant puisse consulter le catalogue, s'inscrire et voir son
  statut;
- l'equipe puisse tracer et verifier les flux critiques du MVP.

## Perimetre confirme

### Dans le sprint

- endpoints auth MVP et middleware Gateway;
- propagation du contexte utilisateur aux services backend;
- CRUD brouillon organisateur et publication immediate;
- listing organisateur cote backend;
- inscription `CONFIRMED` / `WAITLISTED`;
- annulation d'inscription et promotion automatique waitlist;
- historique participant cote backend;
- baseline operabilite: `/health`, `/ready`, correlation-id.

### Hors sprint

- publication differee;
- upload media riche;
- generation billet / QR code;
- console admin et moderation;
- paiement;
- observabilite avancee, traces distribuees et dashboards.

## Resultat attendu

En fin de sprint, Mourad doit avoir livre le coeur backend permettant a
Ibrahim d'integrer les ecrans MVP sans contrat bloquant sur:

- auth et session;
- create/update/publish event;
- list organizer events;
- create/cancel registration;
- waitlist et participant history.

## Baseline verrouillee `Sprint 0`

`Sprint 1` execute les tickets sur une baseline de cadrage deja figee.
Les references ci-dessous deviennent la source de verite a ne pas
re-ouvrir implicitement pendant l'implementation:

- [`docs/api-contracts-p1.md`](../api-contracts-p1.md)
- [`docs/async-events-p1.md`](../async-events-p1.md)
- [`docs/services/identity-access-service-spec.md`](../services/identity-access-service-spec.md)
- [`docs/services/event-management-service-spec.md`](../services/event-management-service-spec.md)
- [`docs/services/catalog-search-service-spec.md`](../services/catalog-search-service-spec.md)
- [`docs/services/registration-service-spec.md`](../services/registration-service-spec.md)
- [`docs/diagrams/architecture_global.mmd`](../diagrams/architecture_global.mmd)
- [`docs/diagrams/flow_event_publication.mmd`](../diagrams/flow_event_publication.mmd)
- [`docs/diagrams/flow_registration_waitlist.mmd`](../diagrams/flow_registration_waitlist.mmd)

Regle de sprint:

- toute evolution `Sprint 1` qui change un payload, un header Gateway,
  un statut, un owner de service ou un event async doit d'abord mettre a
  jour cette baseline documentaire et le backlog associe avant de coder;
- les diagrammes ci-dessus servent de support de revue pour la
  publication evenement, l'inscription, la waitlist et la promotion.

## Lot principal Mourad

### Board d'execution

| ID sprint | Bloc | Backlog refs | Owner | Support | Priorite | Sortie attendue |
| --- | --- | --- | --- | --- | --- | --- |
| S1-M01 | Auth MVP et Gateway | `I02.3`, `I03.2`, `I03.3` | Mourad | Ibrahim | P0 | Endpoints auth operationnels et contexte utilisateur propage |
| S1-M02 | CRUD brouillon evenement | `E02.2`, `E02.3`, `I04.2` | Mourad | Ibrahim | P0 | Un organisateur peut creer, modifier et securiser ses brouillons |
| S1-M03 | Publication et listing organisateur | `E03.2`, `E05.2` | Mourad | Ibrahim | P0 | Un brouillon valide peut etre publie et retrouve dans "Mes evenements" |
| S1-M04 | Inscriptions confirmees et waitlist | `R01.2`, `R01.3`, `R02.2` | Mourad | Ibrahim | P0 | Une inscription reserve une place ou bascule en attente sans doublon |
| S1-M05 | Annulation, promotion et historique participant | `R03.2`, `R03.3`, `R05.2` | Mourad | Ibrahim | P0 | Une place liberee promeut correctement la waitlist et reste visible cote participant |
| S1-M06 | Operabilite transverse | `M01.2`, `M02.2`, `M02.3` | Mourad | Ibrahim | P1 | Les services MVP exposent sante et correlation-id sur les flux critiques |

### Stretch goals Mourad

| ID sprint | Bloc | Backlog refs | Condition d'entree | Sortie attendue |
| --- | --- | --- | --- | --- |
| S1-M07 | Audit securite auth | `I05.2` | `S1-M01` stabilise et smoke teste | Les actions auth critiques sont journalisees |
| S1-M08 | Upload media evenement | `E04.2`, `E04.3` | `S1-M02` et `S1-M03` termines | Le portail peut consommer une image evenement |
| S1-M09 | Hygiene d'environnement auth | `I06.2` | Pas de blocage backend fonctionnel | Les secrets et variables sensibles suivent une convention stable |

## Dependances cote Ibrahim

Le sprint reste backend-led, mais Mourad depend d'Ibrahim sur ces points
de verrouillage:

- validation UX des payloads auth et session;
- validation du contrat formulaire evenement et de la vue "Mes
  evenements";
- validation du wording des statuts `CONFIRMED`, `WAITLISTED`,
  `CANCELLED`;
- execution croisee des smoke tests front -> back.

Tickets UI relies:

- `F02.2`, `F04.2`, `F04.3`
- `F03.2`, `F03.3`
- `F01.2`, `F01.3`
- `F05.2`, `F05.3`

## Sequencement recommande

### Semaine 1

1. `S1-M01` - auth MVP et Gateway
2. `S1-M06` - baseline health/correlation-id
3. revue croisee des reponses d'erreur et headers attendus

### Semaine 2

1. `S1-M02` - CRUD brouillon evenement
2. `S1-M03` - publication et listing organisateur
3. smoke tests organisateur: create -> update -> publish -> list

### Semaine 3

1. `S1-M04` - inscriptions confirmees et waitlist
2. `S1-M05` - annulation, promotion et historique participant
3. hardening final, logs, cas `401/403/409/422`

## Branches conseillees

- `feature/auth-endpoints-mvp`
- `feature/gateway-auth-middleware`
- `feature/auth-context-propagation`
- `feature/event-draft-crud`
- `feature/event-publish-now`
- `feature/organizer-events-list-api`
- `feature/registration-confirmed-flow`
- `feature/registration-waitlist-flow`
- `feature/registration-cancel-flow`
- `feature/registration-waitlist-promotion`
- `feature/participant-history-endpoint`
- `feature/monitoring-health-endpoints`
- `feature/monitoring-correlation-propagation`

## Recette minimale du sprint

1. `register -> login -> refresh` fonctionne avec erreurs homogenes.
2. Un organisateur authentifie cree un brouillon puis le publie.
3. Le listing "Mes evenements" retourne uniquement les evenements de
   l'organisateur courant.
4. Un participant s'inscrit a un evenement disponible et obtient
   `CONFIRMED`.
5. Un participant s'inscrit a un evenement plein et obtient
   `WAITLISTED`.
6. Une annulation libere une place et peut promouvoir la waitlist.
7. Le participant retrouve ses inscriptions dans son historique.
8. Les flux critiques sont lisibles dans les logs avec correlation-id.

## Definition of Done

Le sprint est considere termine seulement si:

- les blocs `S1-M01` a `S1-M05` sont livres ou explicitement de-scopes;
- aucun endpoint MVP livre ne contourne les regles auth/ACL minimales;
- les cas d'erreur principaux `400`, `401`, `403`, `404`, `409`, `422`
  sont definis et testes sur les flux critiques;
- Ibrahim peut integrer le front MVP sans demander de refonte de
  contrat backend sur les parcours cibles;
- les endpoints `/health` et `/ready` existent sur les services livres;
- au moins un jeu de logs permet de suivre `login`, `publish event` et
  `registration`.

## Risques a surveiller

- surcharge de scope si Mourad attaque en parallele media, audit et
  registration complexe;
- ambiguite entre catalogue public et donnees internes organisateur;
- concurrence sur la derniere place disponible;
- retard d'integration front si les contrats changent en cours de
  sprint;
- dette transverse si correlation-id et health checks sont repousses.

## Arbitrages proposes si retard

1. Garder `S1-M01` a `S1-M05` en scope.
2. Passer `S1-M06` en version minimale si necessaire.
3. Sortir `S1-M07` a `S1-M09` du sprint sans hesiter.
4. Reporter la publication differee et le media riche, deja hors scope.
