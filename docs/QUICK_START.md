# Guide de Demarrage Rapide - Projet Evenements

> Objectif: prendre en main le projet en moins de 30 minutes  
> Etat du depot au 2026-03-07: documentation de cadrage, pas encore de code executable

## 1. Commencer par les 4 documents clefs

Lire dans cet ordre:

1. `docs/cahier_des_charges_evenements_microservices.pdf`
2. `docs/mvp_scope.md`
3. `docs/planning/roadmap_sprints.md`
4. `docs/user_stories/user_stories_table.md`

## 2. Identifier la phase de travail

Le projet est decoupe en 4 grandes phases fonctionnelles:

- `P1` - MVP: authentification, gestion d'evenements, inscription,
  liste d'attente, portail public, espace personnel.
- `P2` - Billetterie: billet electronique, QR code, export des inscrits,
  notifications email.
- `P3` - Administration avancee: moderation, audit, statistiques,
  tableaux de bord.
- `P4` - Monnetisation et extensions: paiement, mobile, connecteurs,
  analytique avancee.

Avant toute implementation, noter la phase et le sprint cible dans le
backlog de domaine.

## 3. Utiliser les bons documents selon le besoin

- Creer ou cadrer un service -> `docs/templates/TemplateBackendServiceSpec.md`
- Definir les conventions backend -> `docs/workflows/Workflow_backend.md`
- Definir les conventions frontend -> `docs/workflows/Workflow_frontend.md`
- Decouper une fonctionnalite transverse -> `docs/workflows/Workflow_backend_event_domain.md`
- Planifier un increment -> `docs/sprints/`
- Repartir le travail Mourad / Ibrahim -> `docs/planning/team_work_split.md`
- Prioriser les besoins -> `docs/backlogs/` + `docs/user_stories/`

## 4. Structure cible recommandee du futur projet

Le cahier des charges pointe vers une architecture microservices avec
contrats explicites et flux synchrones/asynchrones. Une structure cible
coherente serait:

```txt
services/
  api-gateway/
  identity-access-service/
  user-profile-service/
  event-management-service/
  catalog-search-service/
  registration-service/
  ticketing-service/
  notification-service/
  admin-moderation-service/
  media-service/
  payment-service/
frontend/
  public-portal/
  organizer-backoffice/
  admin-console/
shared/
  contracts/
  observability/
  auth/
infra/
  docker/
  kubernetes/
  messaging/
  monitoring/
```

Cette structure n'existe pas encore dans le depot; elle sert de cible de
conception.

## 5. Definition of Ready minimale avant d'ouvrir un chantier

- Le besoin est relie a une user story.
- Le service proprietaire est identifie.
- Les roles impactes sont connus.
- Les endpoints REST et/ou evenements asynchrones sont listes.
- Les impacts audit, notification, securite et observabilite sont notes.
- Le sprint et la priorite sont traces dans `docs/backlogs/`.

## 6. Definition of Done documentaire

Une fonctionnalite n'est pas consideree prete tant que:

- le backlog de domaine est mis a jour;
- la fiche sprint cible refleche le scope reel;
- `mvp_scope.md` reste coherent;
- les impacts de release/deploiement sont notes uniquement a partir du
  premier lot deployable.
