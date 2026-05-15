# 🚀 GUIDE COMPLET — Mettre AMAR Studios en ligne sur amarstudios.ma

Suivez les étapes **dans l'ordre**. Comptez **2-3 heures** au total.

Coût : **~100 MAD/an** (juste le domaine .ma)

---

## ✅ ÉTAPE 1 — Acheter le domaine amarstudios.ma

1. Ouvrez : **https://www.hostinger.ma**
2. Tapez `amarstudios.ma` dans la barre de recherche
3. Si disponible → **Ajouter au panier**
4. Choisissez **1 an** (renouvelable)
5. **N'achetez PAS** d'hébergement supplémentaire (Vercel gratuit suffit)
6. Créez un compte avec `amaarstudios@gmail.com`
7. Payez (~100 MAD)
8. Pour le `.ma`, on vous demandera :
   - Scan de votre **CIN** (carte d'identité)
   - Adresse au Maroc
9. Le domaine est validé sous **24-48h** (vous recevrez un email)

⏳ **En attendant la validation, passez aux étapes 2-7.**

---

## ✅ ÉTAPE 2 — Créer un compte GitHub

1. Ouvrez : **https://github.com**
2. Cliquez **Sign up**
3. Email : `amaarstudios@gmail.com`
4. Mot de passe : (choisissez un mot de passe fort)
5. Nom d'utilisateur : `amarstudios` (ou autre)
6. Vérifiez votre email

---

## ✅ ÉTAPE 3 — Créer le dépôt et y mettre votre code

### 3.1 Sur GitHub
1. En haut à droite, cliquez **`+`** → **New repository**
2. Repository name : `amar-studios`
3. Cochez **Private**
4. **Create repository**

### 3.2 Dans WSL (terminal)
Copiez-collez ces commandes une par une :

```bash
cd /mnt/c/Users/basma/OneDrive/Escritorio/AmarStudios

git config --global user.name "AMAR Studios"
git config --global user.email "amaarstudios@gmail.com"

git init
git add .
git commit -m "Initial commit"
git branch -M main
```

Puis (remplacez `VOTRE_USERNAME` par votre nom GitHub) :

```bash
git remote add origin https://github.com/VOTRE_USERNAME/amar-studios.git
git push -u origin main
```

GitHub demandera votre mot de passe ou un token :
- Allez sur GitHub → cliquez sur votre avatar → **Settings**
- **Developer settings** → **Personal access tokens** → **Tokens (classic)**
- **Generate new token (classic)**
- Note : `amar-studios`
- Expiration : `No expiration`
- Cochez **repo** (toutes les cases sous repo)
- **Generate token**
- COPIEZ le token (vous ne le reverrez plus)
- Utilisez ce token comme mot de passe quand git le demande

✅ Votre code est sur GitHub.

---

## ✅ ÉTAPE 4 — Créer la base de données sur Neon

1. Ouvrez : **https://neon.tech**
2. **Sign up** → **Continue with GitHub** → Autoriser
3. Sur le dashboard : **Create Project**
4. Configuration :
   - Project name : `amar-studios`
   - Region : **Europe (Frankfurt)**
   - Postgres version : **16**
5. **Create Project**
6. Une fois créé, copiez la **Connection string** qui ressemble à :
   ```
   postgresql://user:pass@ep-xxx.eu-central-1.aws.neon.tech/neondb?sslmode=require
   ```
7. **Sauvegardez-la dans un fichier texte** sur votre PC, vous en aurez besoin à l'étape 5

✅ Base de données prête.

---

## ✅ ÉTAPE 5 — Déployer le backend sur Render

1. Ouvrez : **https://render.com**
2. **Get Started** → **GitHub** → Autoriser
3. Dashboard Render → **New +** → **Web Service**
4. Connectez votre dépôt `amar-studios` → **Connect**

5. Configuration :
   - **Name** : `amar-studios-api`
   - **Region** : Frankfurt (Europe)
   - **Branch** : `main`
   - **Root Directory** : `backend`
   - **Runtime** : `Node`
   - **Build Command** :
     ```
     npm install && npx prisma generate && npx prisma migrate deploy
     ```
   - **Start Command** :
     ```
     node prisma/seed.js || true && node src/server.js
     ```
   - **Plan** : **Free**

6. Section **Advanced** → **Add Environment Variable**, ajoutez ces variables :

| Clé | Valeur |
|---|---|
| `DATABASE_URL` | (la chaîne Neon copiée à l'étape 4.6) |
| `JWT_SECRET` | (32+ caractères au hasard, ex: `b7e2c3a8d1f9a4e6c2b8d5f3e9a1c7b4`) |
| `JWT_EXPIRES_IN` | `7d` |
| `ADMIN_EMAIL` | `amaarstudios@gmail.com` |
| `ADMIN_PASSWORD` | `amar2026` |
| `NODE_ENV` | `production` |
| `UPLOAD_DIR` | `uploads` |
| `MAX_FILE_SIZE_MB` | `5` |
| `PORT` | `10000` |

7. Cliquez **Create Web Service**
8. Attendez 3-5 minutes que le déploiement finisse
9. En haut de la page, **notez l'URL** du genre :
   ```
   https://amar-studios-api.onrender.com
   ```

✅ Backend en ligne.

---

## ✅ ÉTAPE 6 — Déployer le frontend sur Vercel

1. Ouvrez : **https://vercel.com**
2. **Sign Up** → **Continue with GitHub** → Autoriser
3. Dashboard Vercel → **Add New** → **Project**
4. À côté de `amar-studios` → **Import**

5. Configuration :
   - **Framework Preset** : `Vite`
   - **Root Directory** : cliquez **Edit** → tapez `frontend` → **Continue**
   - Laissez Build Command et Output Directory par défaut

6. Section **Environment Variables**, ajoutez :

| Clé | Valeur |
|---|---|
| `VITE_API_URL` | `https://amar-studios-api.onrender.com` (URL de l'étape 5.9) |

7. Cliquez **Deploy**
8. Attendez 1-2 minutes
9. Vous obtenez une URL : `https://amar-studios.vercel.app` ou similaire

✅ **Votre site est en ligne sur `https://amar-studios.vercel.app` !**

---

## ✅ ÉTAPE 7 — Finaliser la connexion frontend ↔ backend

1. Allez sur **https://dashboard.render.com**
2. Cliquez sur votre service `amar-studios-api`
3. Onglet **Environment** → cliquez **Edit**
4. Ajoutez la variable :

| Clé | Valeur |
|---|---|
| `CLIENT_URL` | `https://amar-studios.vercel.app` (URL Vercel) |

5. **Save Changes** → le backend redémarre automatiquement

✅ **Testez** : ouvrez `https://amar-studios.vercel.app` — le site doit charger les produits.

---

## ✅ ÉTAPE 8 — Connecter amarstudios.ma à Vercel (après validation du domaine)

⏳ Attendez d'abord l'email de Hostinger confirmant que `amarstudios.ma` est actif.

### 8.1 Sur Vercel
1. Dashboard Vercel → votre projet `amar-studios`
2. **Settings** → **Domains**
3. Tapez `amarstudios.ma` → **Add**
4. Vercel affiche les enregistrements DNS à configurer :
   ```
   Type: A      Name: @      Value: 76.76.21.21
   Type: CNAME  Name: www    Value: cname.vercel-dns.com
   ```
5. Notez ces valeurs (la valeur A peut être différente)

### 8.2 Sur Hostinger.ma
1. Connectez-vous à votre compte Hostinger
2. **Domaines** → cliquez sur `amarstudios.ma`
3. Cherchez **Zone DNS** ou **DNS / Nameservers**
4. **Supprimez** les enregistrements A et CNAME existants pour `@` et `www`
5. **Ajoutez** les enregistrements donnés par Vercel :

   **Enregistrement 1** :
   - Type : `A`
   - Nom : `@`
   - Cible : `76.76.21.21` (valeur exacte de Vercel)
   - TTL : `3600`

   **Enregistrement 2** :
   - Type : `CNAME`
   - Nom : `www`
   - Cible : `cname.vercel-dns.com`
   - TTL : `3600`

6. **Save** / **Enregistrer**

### 8.3 Patientez 10 min à 24h
Vercel détecte automatiquement la configuration et génère un **certificat HTTPS gratuit**.

### 8.4 Finaliser CORS sur Render
1. Retournez sur **Render** → service `amar-studios-api` → **Environment**
2. Modifiez `CLIENT_URL` :
   ```
   https://amarstudios.ma,https://www.amarstudios.ma,https://amar-studios.vercel.app
   ```
3. **Save Changes**

✅ **Votre site est maintenant accessible sur :**
**https://amarstudios.ma** 🎉

---

## ✅ ÉTAPE 9 — Premier test complet

1. Ouvrez `https://amarstudios.ma`
2. Vérifiez :
   - [ ] Le hero AMAR STUDIOS s'affiche
   - [ ] Le marquee défile
   - [ ] Les produits chargent
   - [ ] Le bouton FR/EN fonctionne
   - [ ] Le panier s'ouvre

3. Connectez-vous en admin :
   - URL : `https://amarstudios.ma/admin/login`
   - Email : `amaarstudios@gmail.com`
   - Mot de passe : `amar2026`

4. Ajoutez des produits depuis l'admin
5. Testez une commande complète

---

## 🔄 Comment mettre à jour le site

Quand vous modifiez votre code :

```bash
cd /mnt/c/Users/basma/OneDrive/Escritorio/AmarStudios
git add .
git commit -m "Description du changement"
git push
```

**Vercel et Render redéploient automatiquement** en 1-2 minutes. Aucune autre action requise.

---

## 🆘 En cas de problème

Si une étape échoue, dites-moi :
1. Le numéro de l'étape (ex: "bloquée à 5.6")
2. Le message d'erreur exact (copier-coller)

Je vous aide à débloquer.
