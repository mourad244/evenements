# Workflow event - Visibility, pricing & eligibility rules (`E01.3`)

Ce document formalise les regles metier de visibilite, de tarification et
d'eligibilite des evenements (ticket `E01.3`).

Dependances:

- `E01.1` schema logique evenement
- `E01.2` machine d'etat evenement (`DRAFT/PUBLISHED/FULL/CLOSED/CANCELLED`)
- `E02.1` contrat CRUD brouillon
- `E03.1` contrat de publication

## 1. Objectif

Lever les ambiguitees sur:

- qui peut voir un evenement et a quel stade
- comment le prix est exprime et valide
- quelles conditions d'eligibilite s'appliquent a l'inscription

Ces regles s'appliquent a l'event-management-service et au catalog-search-service.

## 2. Visibilite

### 2.1 Valeurs acceptees

| Valeur | Libelle | Description |
| --- | --- | --- |
| `PUBLIC` | Ouvert a tous | Visible dans le catalogue sans authentification |
| `PRIVATE` | Sur invitation | Non indexe dans le catalogue public; accessible uniquement par lien direct ou invitation |

### 2.2 Regles de visibilite par statut

| Statut evenement | PUBLIC | PRIVATE |
| --- | --- | --- |
| `DRAFT` | Invisible catalogue | Invisible catalogue |
| `PUBLISHED` | Visible catalogue | Non indexe; accessible par lien direct (auth requise) |
| `FULL` | Visible catalogue (badge complet) | Non indexe; accessible par lien direct |
| `CLOSED` | Visible catalogue (inscriptions fermees) | Non indexe |
| `CANCELLED` | Masque du catalogue | Masque |

Regles complementaires:

- Un evenement `DRAFT` n'est jamais expose hors du back-office organisateur.
- Un evenement `PRIVATE` ne doit pas apparaitre dans les resultats de
  recherche globale ni dans les listes paginaes du catalogue public.
- L'organisateur et l'admin voient toujours leurs evenements independamment
  du statut.

### 2.3 Comportement d'acces pour un evenement PRIVATE

1. Un participant tente d'acceder a `/catalog/events/:eventId`.
2. Si l'evenement est `PRIVATE` et que le participant n'est pas invite:
   - reponse `404` (pas de fuite d'existence).
3. Si le participant est invite (notion future, hors MVP):
   - acces autorise apres authentification.

> MVP: l'invitation n'est pas implementee. Un evenement `PRIVATE` en MVP
> retourne `404` pour tout participant non authentifie et `403` pour un
> participant authentifie qui n'est pas l'organisateur ou un admin.

## 3. Tarification

### 3.1 Types de tarification

| Valeur `pricingType` | Description |
| --- | --- |
| `FREE` | Gratuit; aucun paiement requis a l'inscription |
| `PAID` | Payant; le montant est defini dans le champ `price` |

### 3.2 Champs associes

| Champ | Type | Requis si PAID | Requis si FREE | Contraintes |
| --- | --- | --- | --- | --- |
| `pricingType` | `enum` | oui | oui | `FREE` ou `PAID` |
| `price` | `number` | oui | non (0 ou absent) | >= 0, max 2 decimales |
| `currency` | `string` | oui | non | code ISO 4217 (ex: `MAD`, `EUR`) |

### 3.3 Regles de validation

- Si `pricingType = FREE`: `price` doit etre `0` ou absent; `currency` est
  optionnel.
- Si `pricingType = PAID`: `price` > 0 obligatoire; `currency` obligatoire.
- Un changement de `pricingType` apres publication est interdit
  (necessite une annulation puis republication).
- Le prix est fige au moment de la publication; les inscriptions
  confirmees apres ce point utilisent le prix publie.

### 3.4 Affichage catalogue

- `FREE` → afficher "Gratuit" / "Free".
- `PAID` → afficher le montant formate avec la devise (ex: "200 MAD").
- Le prix affiche est celui enregistre au moment de la publication.

## 4. Eligibilite a l'inscription

### 4.1 Cas couverts en MVP

| Cas | Regle |
| --- | --- |
| Ouverture standard | Tout participant authentifie peut s'inscrire tant que le statut est `PUBLISHED` |
| Evenement complet | Statut passe a `FULL`; nouvelle inscription → `WAITLISTED` automatiquement |
| Evenement ferme | Statut `CLOSED`; aucune nouvelle inscription acceptee (409) |
| Evenement annule | Statut `CANCELLED`; aucune inscription ni consultation d'inscription active |
| Doublon | Un participant ne peut pas avoir deux inscriptions actives (`CONFIRMED` ou `WAITLISTED`) sur le meme evenement |

### 4.2 Cas hors perimetre MVP (futurs)

- Eligibilite par critere de profil (ville, age, secteur).
- Invitation nominative ou par code.
- Quota par organisation ou groupe.
- Liste blanche/noire de participants.

### 4.3 Reponses HTTP eligibilite

| Situation | Code HTTP | Code erreur |
| --- | --- | --- |
| Statut evenement != `PUBLISHED` | `409` | `EVENT_NOT_REGISTERABLE` |
| Doublon actif | `409` | `REGISTRATION_EXISTS` |
| Evenement non trouve | `404` | `EVENT_NOT_FOUND` |
| Role insuffisant (non PARTICIPANT) | `403` | `FORBIDDEN` |

## 5. Invariants croises

1. Un evenement `PRIVATE` ne peut pas etre `FREE` si l'invitation est
   requise (hors MVP — noter pour Sprint 4+).
2. Le champ `visibility` est editable uniquement en statut `DRAFT`.
3. Le champ `pricingType` et `price` sont editables uniquement en statut
   `DRAFT`.
4. Apres publication, ces champs sont en lecture seule jusqu'a annulation.

## 6. Mapping frontend

| Regle backend | Surface UI concernee |
| --- | --- |
| `visibility = PRIVATE` | Catalogue public: evenement absent |
| `pricingType = FREE` | Badge "Free" sur EventCard et EventDetails |
| `pricingType = PAID` | Affichage prix formate; bouton paiement sur inscription |
| Statut `FULL` | Badge "Complet"; bouton inscription → waitlist |
| Statut `CLOSED` | Badge "Ferme"; bouton inscription desactive |
