# Atelier Jardin & Paysage

Landing page statique pour une activité d'entretien de jardin, d'aménagement paysager et de petite maçonnerie.

## Modifier les informations

- Remplacer `Atelier Jardin & Paysage` par le nom définitif.
- Ajuster les textes, la zone d'intervention et les prestations selon votre offre.

## Formulaire de contact

Le formulaire envoie les demandes via la fonction Vercel `api/contact.js`.

Variables d'environnement à ajouter dans Vercel :

- `RESEND_API_KEY` : clé API Resend.
- `CONTACT_TO_EMAIL` : adresse qui reçoit les demandes, par défaut `lucas.benavenuto@lakle.fr`.
- `CONTACT_FROM_EMAIL` : expéditeur validé dans Resend, par défaut `Atelier Jardin & Paysage <onboarding@resend.dev>`.

Après ajout des variables, redéployer le site depuis Vercel.

## Déploiement Vercel

1. Pousser ce dossier sur GitHub.
2. Importer le repo dans Vercel.
3. Garder les réglages par défaut pour un site statique.

Vercel publiera directement `index.html`.
