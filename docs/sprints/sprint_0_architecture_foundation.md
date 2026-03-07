# Sprint 0 - Fondations architecture & contrats

Sprint de preparation du projet microservices evenements.

**Statut:** `PLANNED`  
**Periode indicative:** 2026-03-09 -> 2026-03-20

## Objectifs

- Verrouiller le decoupage microservices et leurs responsabilites.
- Definir les contrats API et les evenements asynchrones critiques.
- Poser les regles de securite transverse, d'observabilite et de
  correlation-id.
- Transformer le cahier des charges en backlog executable.

## Livrables cibles

- nomenclature definitive des services:
  Identity, Profile, Event Management, Catalog, Registration, Ticketing,
  Notification, Admin, Media, Payment.
- spec initiale des endpoints et evenements critiques.
- diagramme macro d'architecture.
- conventions backend/frontend et template de service valides.

## Definition of Done

- Chaque user story P1 a un service proprietaire.
- Les flux sync/async sont explicites pour publication, inscription,
  promotion waitlist et ticket.
- Les roles et droits minimum sont documentes.
- Les risques majeurs de couplage et de donnees sont identifies.

## Risques / vigilance

- Risque de decoupage trop fin ou trop monolithique.
- Ambiguite possible entre Catalog et Event Management.
- Ambiguite possible entre Registration, Ticketing et Payment.
