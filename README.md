# AMAR STUDIOS — E-commerce fullstack

Boutique en ligne complète pour la marque de vêtements premium **AMAR Studios**.
Design minimaliste (noir / blanc / gris), inspiré des grandes maisons fashion.

- **Frontend** : React 18 + Vite + React Router
- **Backend** : Node.js + Express + Prisma + PostgreSQL
- **Auth admin** : JWT + bcrypt
- **Images** : Multer (stockage local dans `backend/uploads`)
- **Sécurité** : Helmet, CORS, rate-limit, validation, logs Winston

---

## Architecture des dossiers

```
amar-studios/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma          # Schéma complet
│   │   └── seed.js                # Admin + produits de démo
│   ├── src/
│   │   ├── server.js              # Entrée Express
│   │   ├── config/
│   │   │   ├── db.js              # Prisma client
│   │   │   └── logger.js          # Winston
│   │   ├── middlewares/
│   │   │   ├── auth.js            # protectAdmin (JWT)
│   │   │   ├── upload.js          # Multer
│   │   │   ├── validate.js        # express-validator
│   │   │   ├── errorHandler.js    # erreurs centralisées
│   │   │   └── notFound.js
│   │   ├── controllers/
│   │   │   ├── authController.js
│   │   │   ├── productController.js
│   │   │   ├── imageController.js
│   │   │   ├── orderController.js
│   │   │   ├── categoryController.js
│   │   │   └── dashboardController.js
│   │   ├── routes/
│   │   │   ├── authRoutes.js
│   │   │   ├── productRoutes.js
│   │   │   ├── categoryRoutes.js
│   │   │   ├── imageRoutes.js
│   │   │   ├── orderRoutes.js
│   │   │   └── adminRoutes.js
│   │   └── utils/
│   │       ├── asyncHandler.js
│   │       └── slug.js
│   ├── uploads/                   # Images produits
│   ├── .env.example
│   └── package.json
│
└── frontend/
    ├── index.html
    ├── vite.config.js
    ├── public/
    │   └── logo.svg               # Logo placeholder
    ├── src/
    │   ├── main.jsx
    │   ├── App.jsx
    │   ├── api/client.js          # Toutes les fetch
    │   ├── components/
    │   │   ├── Header.jsx
    │   │   ├── Footer.jsx
    │   │   ├── Logo.jsx           # Versions dark/light
    │   │   ├── ProductCard.jsx
    │   │   └── RequireAuth.jsx
    │   ├── context/
    │   │   ├── CartContext.jsx
    │   │   └── AuthContext.jsx
    │   ├── pages/
    │   │   ├── Home.jsx
    │   │   ├── Catalog.jsx
    │   │   ├── ProductDetail.jsx
    │   │   ├── Cart.jsx
    │   │   ├── Checkout.jsx
    │   │   ├── OrderConfirmation.jsx
    │   │   ├── NotFound.jsx
    │   │   ├── info/              # Pages obligatoires
    │   │   │   ├── Shipping.jsx
    │   │   │   ├── Returns.jsx
    │   │   │   ├── SizeGuide.jsx
    │   │   │   ├── Faq.jsx
    │   │   │   ├── Contact.jsx
    │   │   │   ├── Legal.jsx
    │   │   │   └── Privacy.jsx
    │   │   └── admin/
    │   │       ├── AdminLogin.jsx
    │   │       ├── AdminLayout.jsx
    │   │       ├── AdminDashboard.jsx
    │   │       ├── AdminProducts.jsx
    │   │       ├── AdminProductEdit.jsx
    │   │       ├── AdminOrders.jsx
    │   │       └── AdminOrderDetail.jsx
    │   └── styles/index.css       # Design system complet
    ├── .env.example
    └── package.json
```

---

## Installation rapide

### Prérequis

- Node.js 18+
- PostgreSQL 13+ (ou Docker)

### 1. Backend

```bash
cd backend
cp .env.example .env
# éditez DATABASE_URL avec vos identifiants PostgreSQL
npm install
npx prisma migrate dev --name init     # crée les tables
npm run seed                           # crée l'admin + 6 produits démo
npm run dev                            # démarre sur http://localhost:5000
```

### 2. Frontend

```bash
cd frontend
cp .env.example .env
npm install
npm run dev                            # démarre sur http://localhost:5173
```

Ouvrez **http://localhost:5173**.

### 3. Connexion administrateur

- URL : http://localhost:5173/admin/login
- Email : `admin@amarstudios.com`
- Mot de passe : `amar2026`

> Toute modification dans l'admin (produits, stock, statuts) est immédiatement
> visible côté boutique au prochain rechargement de la page.

---

## Base de données (Prisma)

Tables créées :

- **Admin** — comptes administrateurs (bcrypt + JWT)
- **Category** — catégories (Hommes, Femmes, Accessoires…)
- **Product** — produit (nom, slug, prix, prix promo, actif, featured, isNew)
- **ProductImage** — plusieurs images par produit + image principale
- **ProductVariant** — combinaison taille / couleur / stock (unique)
- **Order** — commande sans compte client (nom, téléphone, email opt., adresse, ville)
- **OrderItem** — lignes de commande (produit, variante, prix, qté, sous-total)

Statut commande : `PENDING`, `CONFIRMED`, `PREPARED`, `SHIPPED`, `DELIVERED`, `CANCELLED`.

---

## API REST

| Méthode | Route                                | Auth  | Description                          |
|---------|--------------------------------------|-------|--------------------------------------|
| POST    | /api/admin/login                     | —     | Connexion administrateur             |
| GET     | /api/admin/me                        | admin | Profil admin connecté                |
| GET     | /api/admin/dashboard                 | admin | Stats du tableau de bord             |
| GET     | /api/admin/low-stock                 | admin | Variantes en stock faible            |
| GET     | /api/products                        | —     | Liste publique (filtres + tri)       |
| GET     | /api/products/:id                    | —     | Détail par id ou slug                |
| POST    | /api/products                        | admin | Créer un produit                     |
| PUT     | /api/products/:id                    | admin | Modifier un produit                  |
| PATCH   | /api/products/:id/status             | admin | Activer / désactiver                 |
| DELETE  | /api/products/:id                    | admin | Supprimer                            |
| POST    | /api/products/:id/images             | admin | Upload images (multipart)            |
| DELETE  | /api/images/:id                      | admin | Supprimer une image                  |
| PATCH   | /api/images/:id/main                 | admin | Définir comme image principale       |
| GET     | /api/categories                      | —     | Liste catégories                     |
| POST    | /api/categories                      | admin | Créer une catégorie                  |
| DELETE  | /api/categories/:id                  | admin | Supprimer une catégorie              |
| POST    | /api/orders                          | —     | Passer une commande (sans compte)    |
| GET     | /api/admin/orders                    | admin | Liste commandes (filtres)            |
| GET     | /api/admin/orders/:id                | admin | Détail d'une commande                |
| PATCH   | /api/admin/orders/:id/status         | admin | Changer le statut                    |

### Filtres `GET /api/products`

`q`, `category` (slug), `minPrice`, `maxPrice`, `size`, `color`, `sort` (`newest`,
`price_asc`, `price_desc`), `page`, `limit`.

---

## Sécurité

- Mots de passe hashés avec **bcrypt** (12 rounds).
- Authentification admin par **JWT** (`Authorization: Bearer <token>`).
- Middleware `protectAdmin` sur toutes les routes sensibles.
- **Helmet** pour les headers HTTP.
- **CORS** restreint à `CLIENT_URL`.
- **Rate-limit** global (300 req / 15 min) + spécifique login (10 / 15 min).
- **Validation** des entrées avec `express-validator`.
- **Gestion centralisée** des erreurs avec logs Winston (`backend/logs/`).
- **Vérification de stock** en transaction pour empêcher les commandes invalides.
- Décrémentation automatique du stock à la commande, restauration si annulation.

---

## Charte graphique

- Noir : `#0a0a0a` · Blanc : `#ffffff` · Gris : `#a3a3a3` (entre autres tons).
- Police titres : **Cormorant Garamond** (élégance éditoriale).
- Police texte : **Inter** (lisibilité moderne).
- Logo SVG dans `frontend/src/components/Logo.jsx`, deux variantes `dark` / `light`.
  → Remplacez par votre logo officiel quand vous l'aurez (placez-le dans
  `frontend/public/logo.svg` ou injectez-le dans `Logo.jsx`).

---

## Pour la production

1. Variables d'environnement à régénérer :
   - `JWT_SECRET` long et aléatoire
   - `ADMIN_PASSWORD` à changer dans `.env` puis re-seed ou modifiez le hash en base
   - `DATABASE_URL` pour la base de prod
   - `CLIENT_URL` pour CORS
2. `npm run build` côté frontend pour générer `dist/`.
3. Servez `dist/` derrière votre Nginx / serveur statique, et faites pointer
   les requêtes `/api` et `/uploads` vers le backend Express.
4. Exécutez `npx prisma migrate deploy` pour appliquer les migrations en prod.

---

## Licence

© AMAR Studios. Tous droits réservés.
