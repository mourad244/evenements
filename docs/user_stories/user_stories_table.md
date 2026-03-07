# User Stories - Projet Evenements (table consolidee)

Table de reference pour la priorisation initiale.

| ID | Role | Besoin / Fonctionnalite | Service / Module | Priorite | Sprint cible | Critere d'acceptation (resume) |
| --- | --- | --- | --- | --- | --- | --- |
| US01 | Participant | Creer un compte et se connecter de maniere securisee | Identity & Access + Frontend | Must | S1 | Inscription, login, reset mot de passe et session valides |
| US02 | Organisateur | Creer un brouillon d'evenement avec metadonnees completes | Event Management + Media | Must | S1 | Brouillon sauvegarde avec titre, lieu, date, capacite et visibilite |
| US03 | Organisateur | Publier un evenement immediatement ou en differe | Event Management | Must | S1 | L'evenement passe a `PUBLISHED` et devient visible au catalogue selon regle choisie |
| US04 | Participant | Consulter le calendrier public et filtrer les evenements | Catalog & Search + Frontend | Must | S1 | Recherche texte et filtres theme/date/lieu fonctionnent |
| US05 | Participant | S'inscrire a un evenement quand des places sont disponibles | Registration | Must | S1 | L'inscription passe a `CONFIRMED` sans depasser la capacite |
| US06 | Participant | Etre place automatiquement sur liste d'attente si l'evenement est complet | Registration | Must | S1 | L'inscription passe a `WAITLISTED` et sa position est consultable |
| US07 | Participant | Voir mon historique de participations et le statut de mes demandes | User Profile + Registration | Must | S1 | Le tableau de bord montre les inscriptions et leurs statuts |
| US08 | Participant | Telecharger mon billet electronique apres confirmation | Ticketing + Frontend | Should | S2 | Un billet PDF/PNG unique est disponible apres confirmation |
| US09 | Organisateur | Exporter la liste des inscrits d'un evenement | Registration + Ticketing | Should | S2 | Export telechargeable avec statut d'inscription et references utiles |
| US10 | Participant | Recevoir un email de confirmation, d'attente, de promotion et de rappel | Notification | Should | S2 | Les emails attendus sont journalises et envoyes au bon moment |
| US11 | Administrateur | Moderer un evenement signale ou en attente de validation | Admin & Moderation + Event Management | Should | S3 | Validation/rejet journalises avec acteur, motif et date |
| US12 | Administrateur | Rechercher un utilisateur ou un evenement sur plusieurs criteres | Admin & Moderation | Should | S3 | Recherche multicriteres exploitable sur comptes et evenements |
| US13 | Administrateur | Retracer un incident de bout en bout via logs et audit | Admin & Moderation + Monitoring | Must | S3 | Les actions critiques sont retrouvables par correlation-id ou entite |
| US14 | Participant | Payer un evenement payant et connaitre le statut de paiement | Payment + Registration | Could | S4 | Le statut de paiement est visible et coherent avec l'inscription |
| US15 | Organisateur | Gerer un evenement prive avec controle d'eligibilite | Event Management + Registration | Could | S4 | Seuls les utilisateurs eligibles peuvent confirmer leur inscription |

## Rappels

- Aligner les priorites avec `docs/planning/roadmap_sprints.md`.
- Relier chaque story au backlog de domaine avant implementation.
- Completer les criteres d'acceptation detailles dans les specs de service
  lorsque le developpement commencera.
