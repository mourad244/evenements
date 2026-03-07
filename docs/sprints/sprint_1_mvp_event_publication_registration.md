# Sprint 1 - MVP publication & inscription

Sprint centre sur la valeur P1 du produit.

**Statut:** `PLANNED`  
**Periode indicative:** 2026-03-23 -> 2026-04-10

## Objectifs

- Livrer le parcours organisateur: creer, modifier et publier un evenement.
- Livrer le parcours public: consulter le catalogue et le detail.
- Livrer le parcours participant: s'inscrire, voir le statut, rejoindre
  une liste d'attente.
- Poser l'espace personnel avec historique de participations.

## Services cibles

- Identity & Access
- User Profile
- Event Management
- Catalog & Search
- Registration
- API Gateway

## Livrables cibles

- login / inscription / reset mot de passe
- CRUD evenement organisateur
- publication immediate ou differee
- catalogue public filtrable
- inscription `CONFIRMED` ou `WAITLISTED`
- annulation simple et statut visible pour le participant

## Definition of Done

- Un organisateur peut publier un evenement complet sans intervention
  technique.
- Un participant peut s'inscrire et consulter le statut de sa demande.
- La capacite ne depasse jamais la limite definie.
- Les roles bloquent l'acces non autorise au back-office organisateur et
  a l'admin.

## Risques / vigilance

- Cohabitation entre donnees de catalogue et donnees de gestion interne.
- Concurrence sur les inscriptions de derniere place.
- Coherence des statuts evenement / inscription.
