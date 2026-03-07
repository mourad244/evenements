# Sprint 2 - Ticketing & notifications

Sprint de completion du parcours post-inscription.

**Statut:** `PLANNED`  
**Periode indicative:** 2026-04-13 -> 2026-05-01

## Objectifs

- Generer les billets electroniques.
- Integrer le QR code facultatif.
- Envoyer les notifications email du cycle d'inscription.
- Ajouter l'export des inscrits pour l'organisateur.

## Services cibles

- Ticketing
- Notification
- Media
- Registration
- Frontend participant / organisateur

## Livrables cibles

- billet PDF/PNG telechargeable
- QR code sur le billet si active
- emails de confirmation, attente, promotion, rappel
- historique technique d'envoi
- export des inscrits par evenement

## Definition of Done

- Le billet n'est genere qu'apres confirmation effective.
- Une promotion depuis la waitlist regenere correctement le parcours
  ticket + notification.
- Les echecs de notification sont journalises et exploitables.

## Risques / vigilance

- Idempotence de generation des billets.
- Multiplication des emails en cas de retry mal configure.
- Gestion des fichiers et duree de vie des URLs.
