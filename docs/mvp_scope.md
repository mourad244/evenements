pui# Perimetre MVP Microservices - Plateforme Evenements

## Resume

Le produit cible est une plateforme web de gestion d'evenements avec
inscription en ligne, decoupee en microservices metier et appuyee sur une
API Gateway, un bus de messages, un stockage objet et une couche
d'observabilite.

Le cadrage du 2026-03-07 retient:

- `P1` comme socle obligatoire: authentification, publication
  d'evenements, catalogue public, inscription, gestion de capacite et
  liste d'attente, espace personnel.
- `P2` comme lot de valeur immediate: billet electronique, QR code,
  export des inscrits, notifications.
- `P3` comme lot d'industrialisation metier: moderation, audit,
  tableaux de bord, statistiques.
- `P4` comme lot d'extension: paiement, connecteurs externes, mobile,
  analytique avancee.

## Contexte et vision

- Trois acteurs: participant, organisateur, administrateur.
- Evenements gratuits ou payants, publics ou prives, a capacite limitee.
- Architecture cible inspiree SOA: contrats explicites, faible couplage,
  orchestration, flux synchrones et asynchrones, decouvrabilite.
- Objectif principal: evolutivite sans monolithe deguise.

## Perimetre fonctionnel par composant

### API Gateway

- Point d'entree unique pour le web public, le back-office organisateur
  et la console admin.
- Fonctions: routage, versionnement des API, rate limiting, auth
  centralisee, CORS, propagation correlation-id.
- Exemples de prefixes:
  - `/api/auth/*`
  - `/api/profile/*`
  - `/api/events/*`
  - `/api/catalog/*`
  - `/api/registrations/*`
  - `/api/tickets/*`
  - `/api/notifications/*`
  - `/api/admin/*`
  - `/api/media/*`
  - `/api/payments/*`

### Identity & Access

- Authentification, tokens, sessions, gestion des roles.
- Roles minimum: `PARTICIPANT`, `ORGANIZER`, `ADMIN`.
- Capacites: inscription, connexion, reset mot de passe,
  activation/desactivation de compte, verification des droits.
- Flux: REST synchrone via Gateway.

### User Profile

- Profil utilisateur, preferences, historique de participation,
  donnees de contact et tableau de bord personnel.
- Donnees principales: identite, preferences, historique, consentements.
- Flux: REST synchrone, lecture/edition par l'utilisateur connecte.

### Event Management

- Creation, edition, publication et cycle de vie des evenements.
- Statuts minimum: `DRAFT`, `PUBLISHED`, `FULL`, `CLOSED`, `ARCHIVED`,
  `CANCELLED`.
- Champs fonctionnels: titre, description, theme, image, lieu,
  date/heure, capacite, visibilite, tarification, consignes.
- Supporte publication immediate ou differee.

### Catalog & Search

- Exposition publique du catalogue d'evenements.
- Filtres: theme, date, lieu, type, texte libre.
- Vue calendrier et fiche detaillee des evenements publics.
- Recoit les changements publies depuis Event Management.

### Registration

- Inscriptions, capacite, quotas, eligibilite, liste d'attente,
  annulations, promotions automatiques.
- Statuts minimum d'inscription:
  `CONFIRMED`, `WAITLISTED`, `CANCELLED`, `REJECTED`.
- Service coeur du MVP car il pilote la capacite.
- Combine appels sync pour verification immediate et evenements async
  pour les traitements derives.

### Ticketing

- Generation des billets electroniques PDF/PNG.
- QR code facultatif pour pointage ou controle d'acces.
- Emission apres confirmation ou promotion depuis la liste d'attente.
- Hors P1, en cible P2.

### Notification

- Confirmation d'inscription, mise en attente, promotion, rappel
  evenement, annulation.
- Email obligatoire en premiere cible, SMS en mode simulation initiale.
- Journalisation des envois, erreurs et reprises.
- Service principalement asynchrone.

### Admin & Moderation

- Tableau de bord d'administration.
- Moderation des evenements, audit des actions, supervision,
  recherche multi-criteres, indicateurs clefs.
- Hors MVP strict mais prioritaire en P3.

### Media

- Stockage et distribution des images evenement et des artefacts de
  billet.
- Gere fichiers et metadonnees; peut etre internalise dans un lot
  technique au depart puis isole ensuite.

### Payment (optionnel)

- Paiement et rapprochement pour les evenements payants.
- Statuts de paiement, webhooks, validation de paiement avant emission
  definitive si necessaire.
- Reserve a P4 dans ce cadrage.

## Flux synchrones et asynchrones

### Flux synchrones recommandes

- Authentification et verification de session.
- Lecture du catalogue et du detail evenement.
- Creation/modification d'evenement.
- Soumission d'inscription et validation immediate de capacite.
- Consultation de profil, participations et statut d'inscription.
- Paiement et verification de transaction quand le lot P4 sera ouvert.

### Evenements asynchrones recommandes

- `event.published`
- `event.cancelled`
- `registration.confirmed`
- `registration.waitlisted`
- `registration.promoted`
- `ticket.generated`
- `notification.email.requested`
- `notification.email.sent`
- `notification.sms.simulated`
- `audit.action.recorded`

## Infrastructure et cross-cutting

- API Gateway.
- Registre de services / discovery.
- Bus de messages pour les evenements metier.
- Configuration centralisee par environnement.
- Observabilite: logs, metriques, traces distribuees, alerting.
- Stockage objet pour images et billets.
- Conteneurisation par service et environnements distincts:
  developpement, integration, preproduction, production.

## Securite et conformite

- Authentification par jetons securises.
- Autorisation fine par role et par ressource.
- TLS/HTTPS.
- Validation stricte des entrees.
- Protection contre l'abus d'API et brute force.
- Audit des creations, validations, annulations et notifications.
- Sauvegarde et restauration des donnees critiques.

## Donnees metier de haut niveau

- `Utilisateur`: identite, contact, role, etat compte.
- `Evenement`: titre, description, categorie, lieu, date, capacite,
  visibilite, tarification, statut.
- `Inscription`: participant, evenement, statut, horodatage,
  eligibility/quotas.
- `Billet`: reference, QR code, etat d'emission, fichier.
- `Notification`: canal, contenu, date d'envoi, statut technique.
- `Audit`: acteur, action, cible, resultat, horodatage.

## Hors perimetre immediat

- Mobile natif.
- Analytics avancee.
- Connecteurs SI externes complexes.
- ESB lourd: non requis tant que Gateway + bus de messages suffisent.

## Rappel des criteres de recette du cahier des charges

- Un organisateur peut creer et publier un evenement complet.
- Un participant peut s'inscrire, suivre son statut et telecharger son
  billet.
- La capacite et la liste d'attente fonctionnent sans doublons ni depassement.
- Les notifications attendues sont declenchees.
- Les droits d'acces bloquent les actions admin non autorisees.
- Les journaux et metriques permettent de retracer un incident.

## Historique des versions

| Date       | Version / Phase     | Auteur | Description                                                                        |
| ---------- | ------------------- | ------ | ---------------------------------------------------------------------------------- |
| 2026-03-07 | Baseline de cadrage | Codex  | Structuration documentaire du projet evenements a partir du cahier des charges PDF |
