# Forum — API PHP + application mobile (React Native / Expo / TypeScript)

Application mobile pour le forum de questions/réponses `forumPhp`. L'appli ne parle pas à MySQL :
elle appelle une **API PHP** (JSON) qui réutilise la même base que ton site.

```
Appli Expo (TypeScript)  ──HTTP + JSON──▶  API PHP (FORUM/api)  ──PDO──▶  MySQL (base "forum")
        jeton Bearer                        vérifie le jeton,            tables users, questions,
                                            applique les règles          answers, api_tokens
```

## Contenu de l'archive

| Dossier | Rôle |
|---|---|
| `api/` | L'API PHP. **À copier dans `FORUM/api/`** de ton dépôt. |
| `database/schema.sql` | Crée les tables (sans danger si elles existent déjà). |
| `mobile/` | L'appli Expo complète (TypeScript, React Navigation). |

## 1. Base de données

Importe `database/schema.sql` dans phpMyAdmin (ou `mysql -u root < database/schema.sql`).
Tes tables existantes ne sont pas touchées : seule `api_tokens` (jetons de connexion) est ajoutée.
Si tu oublies, l'API la crée toute seule au premier appel (`AUTO_MIGRATE` dans `api/config.php`).

## 2. API PHP

1. Copie le dossier `api/` dans `FORUM/` (tu obtiens `FORUM/api/index.php`).
2. Vérifie `FORUM/api/config.php` (hôte, base, utilisateur, mot de passe MySQL : `localhost`, `forum`, `root`, vide par défaut).
3. Lance le serveur :
   - **XAMPP / WAMP** : place le projet dans `htdocs`, démarre Apache et MySQL. L'API est sur `http://IP-DU-PC/<dossier>/FORUM/api/index.php`.
   - **Sans XAMPP** : `php -S 0.0.0.0:8000 -t FORUM` (depuis la racine de ton dépôt). L'API est sur `http://IP-DU-PC:8000/api/index.php`.
4. Test rapide (doit répondre `{"items":[],...}`) :
   ```
   curl http://localhost:8000/api/index.php/questions
   ```

Pour trouver l'IP de ton PC : `ipconfig` (Windows) ou `ip a` / `hostname -I` (Linux). Le PC et le téléphone doivent être sur le **même Wi-Fi**.

## 3. Application mobile

```bash
cd mobile
cp .env.example .env      # puis édite .env : EXPO_PUBLIC_API_URL=http://<IP-DU-PC>[:8000]/…/api/index.php
npm install
npx expo start
```

Scanne le QR code avec **Expo Go** (Android ou iOS). Si tu modifies `.env`, relance `npx expo start`.
Vérification des types : `npx tsc --noEmit`.

## Fonctionnalités

**Reprises de ton site** : inscription, connexion, déconnexion, publier une question, voir mes questions,
modifier, supprimer, rechercher, répondre, profil d'un utilisateur avec ses publications.

**Ajoutées pour l'appli** :
- Session conservée au redémarrage (jeton dans le stockage sécurisé du téléphone) et déconnexion automatique si le jeton expire.
- Défilement infini (10 questions par page) et tirer pour rafraîchir.
- Recherche avec attente de 400 ms après la dernière frappe (moins de requêtes).
- Nombre de réponses affiché sur chaque question.
- Supprimer sa propre réponse.
- Profil réel : pseudo, nom, nombre de questions et de réponses (le site affichait des valeurs écrites en dur).
- Confirmation avant toute suppression, messages d'erreur clairs (réseau coupé, session expirée, champs invalides).
- Les réponses d'une question supprimée sont supprimées avec elle (le site laissait des lignes orphelines).

## Les routes de l'API

Base : `.../api/index.php`. Authentification : en-tête `Authorization: Bearer <jeton>`.

| Méthode | Route | Accès | Rôle |
|---|---|---|---|
| POST | `/auth/register` | public | Inscription → jeton + utilisateur |
| POST | `/auth/login` | public | Connexion → jeton + utilisateur |
| POST | `/auth/logout` | connecté | Invalide le jeton |
| GET | `/me` | connecté | Utilisateur courant |
| GET | `/questions?search=&page=&limit=` | public | Liste paginée / recherche |
| POST | `/questions` | connecté | Publier |
| GET | `/questions/{id}` | connecté | Lire une question |
| PUT | `/questions/{id}` | auteur | Modifier |
| DELETE | `/questions/{id}` | auteur | Supprimer (et ses réponses) |
| GET | `/questions/{id}/answers` | connecté | Réponses d'une question |
| POST | `/questions/{id}/answers` | connecté | Répondre |
| DELETE | `/answers/{id}` | auteur | Supprimer sa réponse |
| GET | `/users/{id}` | connecté | Profil + compteurs |
| GET | `/users/{id}/questions?page=` | connecté | Publications d'un utilisateur |

Erreurs : toujours `{"error": "message lisible"}` avec le bon code HTTP (400, 401, 403, 404, 405, 409, 422, 500).

## Choix techniques (utile pour la soutenance)

- **Jetons** : générés avec `random_bytes`, envoyés une fois, et **stockés hachés (SHA-256)** avec une date d'expiration (30 jours).
- **Requêtes préparées partout**, y compris la recherche (`LIKE` avec paramètre) : pas d'injection SQL.
- **Droits vérifiés côté serveur** : seul l'auteur peut modifier ou supprimer sa question / sa réponse (403 sinon).
- **Compatibilité avec ton site** : l'API écrit les textes au même format que lui (`htmlspecialchars` + `nl2br`) et les décode pour l'appli. Les comptes créés sur le site se connectent dans l'appli, et inversement.
- **Pas de framework** : un routeur de 40 lignes (`api/index.php`), un fichier par domaine dans `api/handlers/`.
- **Appli** : TypeScript strict, React Navigation (onglets + pile), un client HTTP unique (`src/api/client.ts`), un contexte d'authentification, un hook de pagination réutilisé par trois écrans.

## Corrections conseillées sur le site (hors API)

1. **Recherche vulnérable à l'injection SQL** — dans `actions/questions/showAllUsersQuestionsActions.php`, remplace la requête de recherche par :
   ```php
   $userSearch = '%' . $_GET["search"] . '%';
   $getAllQuestions = $db->prepare('SELECT * FROM questions WHERE titre LIKE ? ORDER BY id DESC LIMIT 0,5');
   $getAllQuestions->execute(array($userSearch));
   ```
2. **Suppression par lien GET** (`deleteQuestionsActions.php?id=…`) : à passer en POST avec jeton CSRF.
3. **Affichage sans échappement** : le site échappe à l'écriture ; ajoute aussi `htmlspecialchars` à l'affichage.

## Dépannage

| Symptôme | Cause probable |
|---|---|
| « Impossible de joindre le serveur » | Mauvaise IP dans `.env`, PC et téléphone sur des réseaux différents, ou pare-feu qui bloque le port (80 / 8000). Teste l'URL dans le navigateur du téléphone. |
| 401 sur toutes les requêtes avec Apache | L'en-tête `Authorization` est supprimé : vérifie que `api/.htaccess` est bien pris en compte (`AllowOverride All`, module `mod_setenvif`). |
| `Connexion à la base de données impossible` | Identifiants MySQL de `api/config.php`, ou MySQL non démarré. |
| Les changements de `.env` ne s'appliquent pas | Relance `npx expo start` (idéalement avec `-c` pour vider le cache). |
| Build natif Android refuse le HTTP | Expo Go accepte le HTTP en développement. Pour une version installable, utilise HTTPS ou autorise le trafic en clair dans la config. |

## Pistes pour aller plus loin

Notifications quand quelqu'un répond, votes ou « meilleure réponse », dates au format `DATETIME`, images dans les questions, limitation du nombre de tentatives de connexion, HTTPS en production.
