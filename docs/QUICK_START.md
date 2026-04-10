# Guide de Demarrage Rapide - Projet Evenements

> Objectif: prendre en main le projet en moins de 30 minutes  
> Etat du depot au 2026-04-04: documentation, services backend, frontend Next.js, portail docs et suites de tests

## 1. Commencer par les 4 documents clefs

Lire dans cet ordre:

1. `docs/livrables-html-evenements.md`
2. `docs/cahier_des_charges_evenements_microservices.pdf`
3. `docs/mvp_scope.md`
4. `docs/planning/roadmap_sprints.md`
5. `docs/user_stories/user_stories_table.md`

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

- Aligner la documentation sur le livrable HTML -> `docs/livrables-html-evenements.md`
- Lire les surfaces UI / application -> `docs/ui-application-surfaces-evenements.md`
- Lire la posture securite -> `docs/security-strategy-evenements.md`
- Lire le guide developpeur -> `docs/developer-guide-evenements.md`
- Lire la strategie de tests -> `docs/testing-strategy-evenements.md`
- Creer ou cadrer un service -> `docs/templates/TemplateBackendServiceSpec.md`
- Definir les conventions backend -> `docs/workflows/Workflow_backend.md`
- Definir les conventions frontend -> `docs/workflows/Workflow_frontend.md`
- Decouper une fonctionnalite transverse -> `docs/workflows/Workflow_backend_event_domain.md`
- Planifier un increment -> `docs/sprints/`
- Repartir le travail Mourad / Ibrahim -> `docs/planning/team_work_split.md`
- Prioriser les besoins -> `docs/backlogs/` + `docs/user_stories/`

## 4. Structure actuelle utile a connaitre

Le depot est deja structure. Les reperes minimums sont:

```txt
services/
  api-gateway/
  identity-access-service/
  event-management-service/
  registration-service/
frontend/
apps/docs-portal/
docs/
tests/
tools/
```

Pour le detail par livrable, voir
`docs/developer-guide-evenements.md`.

## 5. Commandes rapides

- lancer le portail docs -> `npm run docs:start`
- builder le portail docs -> `npm run docs:build`
- lancer la Gateway -> `npm run start:gateway`
- lancer Identity -> `npm run start:identity`
- lancer Event Management -> `npm run start:event-management`
- lancer Registration -> `npm run start:registration`
- lancer le frontend -> `npm run start:frontend`
- rejouer un smoke critique -> `npm run test:s1-m01`

## 6. Definition of Ready minimale avant d'ouvrir un chantier

- Le besoin est relie a une user story.
- Le service proprietaire est identifie.
- Les roles impactes sont connus.
- Les endpoints REST et/ou evenements asynchrones sont listes.
- Les impacts audit, notification, securite et observabilite sont notes.
- Le sprint et la priorite sont traces dans `docs/backlogs/`.

## 7. Definition of Done documentaire

Une fonctionnalite n'est pas consideree prete tant que:

- le backlog de domaine est mis a jour;
- la fiche sprint cible refleche le scope reel;
- `mvp_scope.md` reste coherent;
- les impacts de release/deploiement sont notes uniquement a partir du
  premier lot deployable.
