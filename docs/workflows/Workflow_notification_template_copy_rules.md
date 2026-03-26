# Workflow notification - template copy rules `Sprint 2`

Ce document stabilise les regles de contenu et fallback UI pour `N01.3`.

Dependances:

- `N01.1` catalogue des templates transactionnels
- flux metier `registration.confirmed`, `registration.waitlisted`,
  `registration.promoted`, `event.cancelled`

## 1. Objectif

Definir une convention unique pour:

- sujet email
- corps de message
- ton redactionnel
- placeholders dynamiques
- fallback si une donnee est manquante

afin que `N01.2` puisse implementer les templates sans ambiguite.

## 2. Ton et style editoriaux

- ton clair, rassurant, orientee action
- phrases courtes, vocabulaire simple
- une action principale par message
- aucune information technique brute exposee a l'utilisateur final

Regles de redaction:

- sujet `<= 70 caracteres`
- preheader `<= 120 caracteres`
- bloc principal structure: contexte -> statut -> action -> aide
- heure/date affichees dans le fuseau evenement quand connu

## 3. Placeholders standards

| Placeholder | Sens | Source attendue | Fallback |
| --- | --- | --- | --- |
| `{{first_name}}` | prenom destinataire | profile/user | `Participant` |
| `{{event_title}}` | titre evenement | event-management | `votre evenement` |
| `{{event_date}}` | date evenement | event-management | `date a confirmer` |
| `{{event_time}}` | heure evenement | event-management | `horaire a confirmer` |
| `{{event_location}}` | lieu evenement | event-management | `lieu a confirmer` |
| `{{registration_status}}` | statut inscription | registration | `en cours` |
| `{{ticket_download_url}}` | lien billet protege | ticketing/media | masquer bloc billet |
| `{{support_contact}}` | contact support | notification config | `support@evenements.local` |

## 4. Regles fallback globales

- Si `first_name` absent: salutation neutre `Bonjour`.
- Si `event_title` absent: remplacer par `votre evenement`.
- Si date/heure/lieu absents: afficher un message explicite
  `Les details pratiques seront confirmes prochainement.`
- Si `ticket_download_url` absent:
  ne jamais afficher de bouton inactif, afficher un texte de statut:
  `Votre billet sera disponible des sa generation.`
- Si plusieurs donnees critiques sont absentes:
  conserver le mail mais ajouter la consigne contact support.

## 5. Matrice des templates transactionnels MVP

| Template ID | Trigger | Sujet type | CTA principal | Placeholders obligatoires |
| --- | --- | --- | --- | --- |
| `EMAIL_REGISTRATION_CONFIRMED` | `registration.confirmed` | `Inscription confirmee - {{event_title}}` | `Telecharger mon billet` (si dispo) | `event_title`, `registration_status` |
| `EMAIL_REGISTRATION_WAITLISTED` | `registration.waitlisted` | `Vous etes en liste d'attente - {{event_title}}` | `Voir mon statut` | `event_title`, `registration_status` |
| `EMAIL_REGISTRATION_PROMOTED` | `registration.promoted` | `Bonne nouvelle: votre place est confirmee` | `Acceder a mon billet` | `event_title`, `registration_status` |
| `EMAIL_EVENT_REMINDER` | rappel planifie | `Rappel: {{event_title}} approche` | `Voir les details` | `event_title`, `event_date` |
| `EMAIL_EVENT_CANCELLED` | `event.cancelled` | `Mise a jour importante - evenement annule` | `Voir les alternatives` | `event_title` |

## 6. Regles CTA et lisibilite

- un seul bouton principal par email
- texte CTA commence par un verbe d'action (`Voir`, `Telecharger`,
  `Consulter`)
- inclure un lien alternatif en texte brut sous le bouton
- si action indisponible, remplacer le bouton par une information claire

## 7. Alignement front/back et observabilite

- Backend Notification reste owner du rendu final des templates.
- Frontend (participant/organizer/admin) doit reutiliser les memes labels
  de statut: `CONFIRMED`, `WAITLISTED`, `CANCELLED`, `SIMULATED`.
- Les logs `NotificationLog` doivent conserver:
  `template_id`, `channel`, `status`, `fallback_used` (bool), `correlation_id`.

## 8. Hors scope de `N01.3`

- implementation HTML/CSS des templates
- internationalisation multi-langues
- AB testing des sujets ou contenus

## 9. Sortie attendue

`N01.3` est valide quand:

- les regles de ton/sujet/corps sont explicites
- les placeholders et leurs fallback sont documentes
- chaque template MVP a un sujet, un CTA et des champs obligatoires
