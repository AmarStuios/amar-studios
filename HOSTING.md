# 🚀 Guide de déploiement AMAR Studios — étape par étape

Coût total : **0 MAD/mois** pour commencer (ou ~150 MAD/an avec un domaine `.ma`).

---

## Vue d'ensemble

```
[Visiteurs] ──► amarstudios.vercel.app  ──► Vercel (frontend gratuit)
                              │
                              └─► API ──► Render (backend gratuit)
                                            │
                                            └─► Neon (PostgreSQL gratuit)
```

---

## ÉTAPE 1 : Créer un compte GitHub et pousser le code

### 1.1 Créer un compte GitHub
- Allez sur https://github.com
- Cliquez **Sign up**
- Email, mot de passe, nom d'utilisateur (ex: `basma-belfakih`)
- Vérifiez votre email

### 1.2 Créer un dépôt (repository)
- Cliquez sur **`+`** en haut à droite → **New repository**
- Nom : `amar-studios`
- **Private** (privé) — c'est gratuit
- Cliquez **Create repository**

### 1.3 Pousser votre code
Dans votre terminal WSL :

```bash
cd /mnt/c/Users/basma/OneDrive/Escritorio/AmarStudios

# Configurer git (premiere fois seulement)
git config --global user.name "Votre Nom"
git config --global user.email "amaarstudios@gmail.com"

# Initialiser le depot
git init
git add .
git commit -m "Initial commit - AMAR Studios"
git branch -M main

# Lier au depot GitHub (remplacez USERNAME)
git remote add origin https://github.com/USERNAME/amar-studios.git
git push -u origin main
```

Lors du push, GitHub vous demandera de vous connecter. Suivez les instructions (vous devrez peut-être créer un **Personal Access Token** : Settings → Developer settings → Personal access tokens → Generate new token).

---

## ÉTAPE 2 : Base de données PostgreSQL sur Neon

### 2.1 Créer un compte Neon
- Allez sur https://neon.tech
- Cliquez **Sign up** → **Continue with GitHub**
- Acceptez les permissions

### 2.2 Créer un projet
- Cliquez **Create Project**
- Project name : `amar-studios`
- Region : **Europe (Frankfurt)** (plus rapide depuis le Maroc)
- Postgres version : **16** (par défaut)
- Cliquez **Create Project**

### 2.3 Copier la chaîne de connexion
- Une fois le projet créé, vous verrez **Connection string**
- Copiez la chaîne qui ressemble à :
```
postgresql://user:password@ep-xxx.eu-central-1.aws.neon.tech/neondb?sslmode=require
```
- **GARDEZ CETTE CHAÎNE** précieusement, vous en aurez besoin à l'étape 3

---

## ÉTAPE 3 : Backend sur Render

### 3.1 Créer un compte Render
- Allez sur https://render.com
- **Get Started** → **GitHub** → autorisez

### 3.2 Créer un Web Service pour le backend
- Cliquez **New +** → **Web Service**
- Connectez votre dépôt `amar-studios` (cliquez **Connect**)
- Configurez :
  - **Name** : `amar-studios-api`
  - **Region** : Frankfurt (Europe)
  - **Branch** : `main`
  - **Root Directory** : `backend`
  - **Runtime** : **Node**
  - **Build Command** : `npm install && npx prisma generate && npx prisma migrate deploy`
  - **Start Command** : `node prisma/seed.js || true && node src/server.js`
  - **Plan** : **Free**

### 3.3 Variables d'environnement
Cliquez **Advanced** → **Add Environment Variable**, ajoutez :

| Clé | Valeur |
|---|---|
| `DATABASE_URL` | (la chaîne Neon copiée à l'étape 2.3) |
| `JWT_SECRET` | (générez 32+ caractères aléatoires, ex: `b7e2c3a8d1f9...`) |
| `JWT_EXPIRES_IN` | `7d` |
| `ADMIN_EMAIL` | `amaarstudios@gmail.com` |
| `ADMIN_PASSWORD` | `amar2026` |
| `NODE_ENV` | `production` |
| `CLIENT_URL` | (laissez vide pour l'instant, on reviendra) |
| `UPLOAD_DIR` | `uploads` |
| `MAX_FILE_SIZE_MB` | `5` |
| `PORT` | `10000` |

Cliquez **Create Web Service**.

Le déploiement prend 3-5 minutes. À la fin vous aurez une URL du genre :
**`https://amar-studios-api.onrender.com`**

📝 **Notez cette URL**.

⚠️ **Note importante sur Render gratuit** : si personne ne visite votre site pendant 15 minutes, le serveur se met en veille. Le 1er chargement après veille prend ~30 secondes. Pour un trafic modeste c'est OK.

---

## ÉTAPE 4 : Frontend sur Vercel

### 4.1 Créer un compte Vercel
- Allez sur https://vercel.com
- **Sign Up** → **Continue with GitHub**
- Autorisez

### 4.2 Importer le projet
- Cliquez **Add New** → **Project**
- Sélectionnez votre dépôt `amar-studios`
- **Import**

### 4.3 Configurer le build
- **Framework Preset** : `Vite`
- **Root Directory** : cliquez **Edit** → tapez `frontend` → **Continue**
- **Build Command** : `npm run build` (par défaut)
- **Output Directory** : `dist` (par défaut)

### 4.4 Variable d'environnement
- Section **Environment Variables**, ajoutez :

| Clé | Valeur |
|---|---|
| `VITE_API_URL` | `https://amar-studios-api.onrender.com` (l'URL de l'étape 3.3) |

- Cliquez **Deploy**

Le déploiement prend 1-2 minutes. Vous obtiendrez une URL :
**`https://amar-studios.vercel.app`**

🎉 **Votre site est en ligne !**

### 4.5 Retour sur Render pour finaliser CORS
- Allez sur https://dashboard.render.com → votre service `amar-studios-api`
- **Environment** → modifiez la variable `CLIENT_URL` :
  - Valeur : `https://amar-studios.vercel.app` (l'URL de Vercel)
- Cliquez **Save Changes** → le backend redémarre automatiquement

---

## ÉTAPE 5 : (Optionnel) Domaine personnalisé `.ma`

### 5.1 Acheter le domaine
- Allez sur https://hostinger.ma ou https://gandi.net
- Cherchez `amarstudios.ma`
- Achetez (~150 MAD/an)

### 5.2 Configurer dans Vercel
- Vercel dashboard → votre projet → **Settings** → **Domains**
- **Add Domain** → tapez `amarstudios.ma`
- Vercel vous donne des **enregistrements DNS** à configurer

### 5.3 Configurer DNS chez votre registrar
- Sur Hostinger/Gandi, dans la section DNS, ajoutez les enregistrements donnés par Vercel
- Type A : pointez vers l'IP donnée par Vercel
- Type CNAME : pour `www` → `cname.vercel-dns.com`
- Sauvegardez

⏱️ Le DNS prend 5 min à 24h pour propager.

---

## ÉTAPE 6 : Premier test

1. Ouvrez **https://amar-studios.vercel.app** (ou votre domaine)
2. Le site doit s'afficher comme en local
3. Allez sur **https://amar-studios.vercel.app/admin/login**
4. Connectez-vous : `amaarstudios@gmail.com` / `amar2026`
5. Ajoutez vos produits depuis l'admin
6. Le client peut commander, vous voyez les commandes dans `/admin/commandes`

---

## 🔄 Mettre à jour le site

Quand vous modifiez le code en local :

```bash
cd /mnt/c/Users/basma/OneDrive/Escritorio/AmarStudios
git add .
git commit -m "Description du changement"
git push
```

**Vercel et Render redéploient automatiquement** dès que vous pushez sur GitHub. Le site est mis à jour en 1-2 minutes.

---

## ⚠️ Limitations du plan gratuit

| Service | Limite | Impact |
|---|---|---|
| **Vercel** | 100 GB bande passante/mois | OK pour ~10 000 visiteurs/mois |
| **Render** | 750h/mois + veille après 15min | Site lent au 1er accès après inactivité |
| **Neon** | 500 MB de stockage | Suffit pour ~50 000 commandes |
| **Cloudinary** | 25 GB d'images | OK pour ~5000 photos produits |

**Quand passer au payant** (vous saurez quand) :
- Render Starter : 7$/mois → plus de veille
- Neon Launch : 19$/mois → plus de stockage
- Vercel reste gratuit sauf si vous dépassez 100 GB

---

## 🆘 Si vous bloquez

Dites-moi à quelle étape vous êtes et quel message d'erreur vous voyez. Je vous aiderai à le résoudre.
