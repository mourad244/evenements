# Frontend workflow - portail public, espace participant et back-offices

Ce document fixe les conventions frontend transverses du projet
evenements.

## 1. Applications / shells cibles

- portail public
- espace participant connecte
- back-office organisateur
- console admin

Ces shells peuvent vivre dans une seule application modulaire ou dans
plusieurs frontends selon la strategie de delivery.

## 2. Principes de composition

- Pages minces: orchestration de data fetching, auth et wiring.
- Composants partages: tables, filtres, formulaires, banners, pagination,
  etats vides, erreurs.
- Modules metier distincts:
  `catalog`, `events`, `registration`, `tickets`, `notifications`,
  `admin`.

## 3. Etats communs obligatoires

Chaque ecran doit gerer explicitement:

- loading
- empty
- forbidden
- error
- success feedback

## 4. Auth et guards

- Routes publiques: home, calendrier, detail evenement.
- Routes participant: dashboard, mes inscriptions, mon billet.
- Routes organisateur: mes evenements, edition, inscrits.
- Routes admin: moderation, audit, supervision.
- Gerer token expire et retour vers login avec message clair.

## 5. Formulaires

- Aligner les validations front sur les regles backend.
- Eviter les formulaires geants non sectionnes.
- Afficher les erreurs de champ et les erreurs serveur.
- Geler les actions sensibles pendant soumission.

## 6. Artefacts proteges

- Telechargement billet / export / media via client HTTP authentifie.
- Utiliser des blobs et non des URLs avec token en query string.
- Gerer `401/403/404/502` avec messages explicites.

## 7. ACL d'interface

- Masquer ou desactiver les actions non autorisees.
- Ne jamais supposer que le masquage UI remplace le controle backend.
- Garder la matrice de permissions dans un module partage.

## 8. Responsive et accessibilite

- Priorite mobile pour portail public et espace participant.
- Navigation clavier et labels explicites.
- Contrastes suffisants et messages d'erreur lisibles.

## 9. Tests minimaux

- parcours public catalogue -> detail;
- parcours login -> dashboard participant;
- parcours organisateur creation -> publication;
- parcours admin moderation;
- verifications ACL sur les routes et boutons critiques.
