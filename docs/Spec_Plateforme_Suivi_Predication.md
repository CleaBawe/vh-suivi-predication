# Plateforme de suivi & d'entraînement — Prédication Classe 4
École Porteur de Vie — Vases d'Honneur — Campus Afrique

## 1. Objectif
Aider tous les stagiaires de la promo Classe 4 à écouter les 44 cours du cursus (Classes 1 à 4) et à s'entraîner à l'exercice de prédication (tirage au sort d'un thème, 5 min de préparation, 5 min de prédication), avant le jour de l'examen.

## 2. Stack technique
- **Next.js** sur **Vercel** (front + API routes)
- **Neon (Postgres)** pour les données
- **Vercel Blob** pour les enregistrements audio des étudiants (les audios des cours eux-mêmes restent hébergés sur zoe.porteursdevie.org, on garde juste les liens)
- Authentification maison : mot de passe hashé (bcrypt), session par cookie

## 3. Authentification
- Écran d'accueil : deux boutons — **Se connecter** / **Créer un compte**
- Création de compte : réservée aux étudiants (matricule, nom/prénom facultatif, mot de passe au choix)
- Le **compte admin est pré-créé** via un script d'amorçage, jamais via le formulaire public
- La connexion redirige automatiquement vers l'espace étudiant ou l'espace admin selon le rôle
- **Mot de passe oublié** : réinitialisation par l'admin uniquement (pas d'email) — l'admin remet un mot de passe temporaire, l'étudiant en choisit un nouveau à la reconnexion
- Chaque étudiant peut changer son mot de passe depuis son profil

## 4. Structure des cours
- **44 cours officiels** : 4 classes × 11 cours (programme des images "Campus Afrique")
- Chaque cours a **un ou plusieurs fichiers audio** (playlist ordonnée), pas un lien unique — ex. "Les pensées" = 9 parties, "La Nouvelle Création" = 10 parties
- **Module d'orientation obligatoire** : "La Prédication" (3 parties), hors des 44 cours, mis en avant en haut de l'espace étudiant — à écouter avant de commencer les entraînements
- **Cours bonus** (en attente des liens audio de Cléa) : Les 7 secrets, Marcher par l'Esprit, Garder l'humilité, La séduction de l'orgueil, Cœur à Cœur, Le chrétien dans ce monde, Les étapes pour communiquer la vie, Cours introductif Porteur de vie (générique)
- **Cours à compléter** (audio manquant, Cléa doit les retrouver) : Atelier Pratique méditation, Atelier pratique (Servir Dieu), La Relation d'Aide (1), La Relation d'Aide (2)

## 5. Espace étudiant
Trois zones :

**Mes cours**
- Les 44 cours groupés par classe (accordéon), + module d'orientation en tête
- Par cours : lecteur audio (playlist si plusieurs parties), case "Écouté", champ facultatif "verset de base", champ facultatif "notes"
- Bouton "S'entraîner sur ce thème" : 5 min de préparation (minuteur + espace pour le verset porteur) puis 5 min pour livrer son message, au choix libre entre enregistrement audio ou texte écrit
- Case à cocher "Ne pas partager à la communauté" (partagé par défaut)

**Communauté**
- Fil des entraînements (audio/texte) déposés par les autres étudiants, filtrable par cours ou par classe
- Pas de commentaires ni de réactions dans la V1, juste écouter/lire

**Profil**
- Matricule, changer le mot de passe, progression globale et par classe

## 6. Espace admin
- Tableau de bord de toute la promo : liste des étudiants, progression, dernière activité, filtre par classe/cours
- Fiche détail par étudiant : écouter/lire ses soumissions, laisser un retour facultatif
- Réinitialisation de mot de passe
- Création d'autres comptes admin si besoin

## 7. UI/UX
- Mobile d'abord (lien partagé sur WhatsApp)
- Une action évidente par écran, gros boutons tactiles
- Icônes constantes : casque = écouter, micro = s'entraîner, coche = fait
- Vocabulaire simple, jamais de jargon technique

## 8. Modèle de données (aperçu)
- `users` (id, matricule, password_hash, role, nom, created_at)
- `courses` (id, classe, numero, titre, type: officiel/orientation/bonus, statut_audio)
- `course_audio_parts` (id, course_id, ordre, url, titre)
- `progress` (id, user_id, course_id, done, verset, notes, updated_at)
- `submissions` (id, user_id, course_id, type: audio/texte, contenu_ou_url, partage_communaute, created_at)
- `admin_feedback` (id, submission_id, admin_id, message, created_at)
