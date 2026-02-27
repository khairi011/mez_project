# MEZYENA E-COMMERCE — Résumé des Fonctionnalités

> Document généré automatiquement — résumé de toutes les fonctionnalités existantes dans le code.

---

## Architecture Générale

| Couche     | Technologie                          |
|------------|--------------------------------------|
| Frontend   | React 19 + Vite + Tailwind CSS v4   |
| Backend    | Express 5 + Node.js                 |
| Base de données | MySQL (mysql2/promise)          |
| Auth       | JWT (access + refresh tokens)        |
| Email      | Nodemailer (SMTP Gmail)             |
| Validation | express-validator                    |
| Sécurité   | Helmet, CORS, bcryptjs              |

---

## Base de Données — Tables

| Table           | Description                                      |
|-----------------|--------------------------------------------------|
| `users`         | Utilisateurs (CLIENT / ADMIN)                    |
| `categories`    | Catégories de produits                           |
| `subcategories` | Sous-catégories liées aux catégories             |
| `products`      | Produits avec prix, stock, image, catégorie      |
| `carts`         | Paniers (un par utilisateur)                     |
| `cart_items`    | Articles dans le panier (produit + quantité)     |
| `orders`        | Commandes avec statut et prix total              |
| `order_items`   | Articles commandés (prix figé au moment de la commande) |
| `delivery_info` | Informations de livraison (une par commande)     |

---

## API Backend — Endpoints

### Authentification (`/api/auth`)

| Méthode | Route               | Auth | Description                          |
|---------|----------------------|------|--------------------------------------|
| POST    | `/api/auth/register` | Non  | Inscription (nom, email, mot de passe) |
| POST    | `/api/auth/login`    | Non  | Connexion (email, mot de passe)      |
| POST    | `/api/auth/logout`   | Non  | Déconnexion (côté client)            |
| POST    | `/api/auth/refresh`  | Non  | Rafraîchir le token JWT              |
| GET     | `/api/auth/profile`  | Oui  | Voir son profil                      |
| PUT     | `/api/auth/profile`  | Oui  | Modifier son profil (nom, email)     |

### Produits (`/api/products`)

| Méthode | Route                                  | Auth  | Description                          |
|---------|----------------------------------------|-------|--------------------------------------|
| GET     | `/api/products`                        | Non   | Liste paginée de tous les produits   |
| GET     | `/api/products/search?q=`              | Non   | Recherche par nom/description        |
| GET     | `/api/products/category/:categoryId`   | Non   | Produits par catégorie (paginé)      |
| GET     | `/api/products/:id`                    | Non   | Détail d'un produit                  |
| POST    | `/api/products`                        | Admin | Créer un produit                     |
| PUT     | `/api/products/:id`                    | Admin | Modifier un produit                  |
| DELETE  | `/api/products/:id`                    | Admin | Supprimer un produit                 |

### Catégories (`/api/categories`)

| Méthode | Route                                     | Auth  | Description                      |
|---------|--------------------------------------------|-------|----------------------------------|
| GET     | `/api/categories`                          | Non   | Liste de toutes les catégories   |
| GET     | `/api/categories/:id`                      | Non   | Détail d'une catégorie           |
| GET     | `/api/categories/:id/subcategories`        | Non   | Sous-catégories d'une catégorie  |
| POST    | `/api/categories`                          | Admin | Créer une catégorie              |
| PUT     | `/api/categories/:id`                      | Admin | Modifier une catégorie           |
| DELETE  | `/api/categories/:id`                      | Admin | Supprimer une catégorie          |

### Panier (`/api/cart`) — Authentification requise

| Méthode | Route                          | Description                              |
|---------|--------------------------------|------------------------------------------|
| GET     | `/api/cart`                    | Voir le contenu du panier                |
| POST    | `/api/cart/items`              | Ajouter un produit au panier             |
| PATCH   | `/api/cart/items/:cartItemId`  | Modifier la quantité d'un article        |
| DELETE  | `/api/cart/items/:cartItemId`  | Supprimer un article du panier           |
| DELETE  | `/api/cart`                    | Vider tout le panier                     |

### Commandes (`/api/orders`) — Authentification requise

| Méthode | Route                         | Description                                   |
|---------|-------------------------------|-----------------------------------------------|
| POST    | `/api/orders`                 | Créer une commande (panier + info livraison)  |
| GET     | `/api/orders`                 | Mes commandes (paginé)                        |
| GET     | `/api/orders/:id`             | Détail d'une commande                         |
| POST    | `/api/orders/:id/cancel`      | Annuler une commande (si EN_ATTENTE/CONFIRMEE)|

### Administration (`/api/admin`) — Admin uniquement

| Méthode | Route                              | Description                              |
|---------|-------------------------------------|------------------------------------------|
| GET     | `/api/admin/stats`                  | Statistiques du tableau de bord          |
| GET     | `/api/admin/orders`                 | Liste de toutes les commandes (paginé)   |
| PATCH   | `/api/admin/orders/:id/status`      | Modifier le statut d'une commande        |
| GET     | `/api/admin/orders/status/:status`  | Filtrer commandes par statut             |
| GET     | `/api/admin/users`                  | Liste de tous les utilisateurs (paginé)  |
| DELETE  | `/api/admin/users/:id`              | Supprimer un utilisateur                 |

---

## Frontend — Pages & Fonctionnalités

### Pages Publiques

| Page              | Route              | Fonctionnalités                                         |
|-------------------|--------------------|--------------------------------------------------------|
| **Accueil**       | `/`                | Affichage produits, recherche, filtrage par catégorie, pagination |
| **Connexion**     | `/login`           | Formulaire email + mot de passe, redirection après login |
| **Inscription**   | `/register`        | Formulaire nom, email, mot de passe, confirmation       |
| **Détail Produit**| `/products/:id`    | Image, description, prix, stock, ajout au panier        |
| **Panier**        | `/cart`            | Liste articles, modification quantité, suppression, total |
| **Wishlist**      | `/wishlist`        | Page stub (non fonctionnelle — pas de backend)          |
| **404**           | `*`                | Page d'erreur avec liens de retour                      |

### Pages Protégées (Authentification requise)

| Page                  | Route                       | Fonctionnalités                                         |
|-----------------------|-----------------------------|---------------------------------------------------------|
| **Checkout**          | `/checkout`                 | Récapitulatif panier, formulaire livraison, confirmation |
| **Mes Commandes**     | `/my-orders`                | Liste des commandes, statut, annulation                  |
| **Confirmation**      | `/order-confirmation/:id`   | Détails commande + timeline du statut                    |
| **Mon Compte**        | `/account`                  | Page stub (pas encore implémenté côté frontend)          |
| **Admin Dashboard**   | `/admin/dashboard`          | Statistiques (utilisateurs, commandes, revenus)          |

---

## Services Frontend

| Service            | Fonctions                                                   |
|--------------------|-------------------------------------------------------------|
| `authService`      | `register`, `login`, `logout`, `getCurrentUser`, `isAuthenticated`, `isAdmin` |
| `productService`   | `getAllProducts`, `getProductById`, `searchProducts`, `getProductsByCategory`, `getAllCategories` |
| `cartService`      | `getCart`, `addToCart`, `updateCartItem`, `removeFromCart`, `clearCart` |
| `orderService`     | `createOrder`, `getMyOrders`, `getOrderById`, `cancelOrder` |

---

## Modèles Backend

| Modèle          | Méthodes principales                                                      |
|-----------------|---------------------------------------------------------------------------|
| `User`          | `create`, `findById`, `findByEmail`, `findByEmailWithPassword`, `verifyPassword`, `update`, `findAll`, `delete`, `count` |
| `Product`       | `findAll`, `findById`, `findByCategory`, `search`, `create`, `update`, `delete`, `updateStock`, `count` |
| `Category`      | `create`, `findById`, `findAll`, `findByName`, `update`, `delete`, `findSubcategoriesByCategoryId` |
| `Cart`          | `create`, `findById`, `findByUserId`, `findOrCreate`, `getTotal`, `clear`, `delete` |
| `CartItem`      | `create`, `findById`, `findByCartAndProduct`, `findByCartId`, `update`, `delete` |
| `Order`         | `create`, `findById`, `findByIdWithDetails`, `findByUserId`, `findAll`, `updateStatus`, `findByStatus`, `getStats`, `delete` |
| `OrderItem`     | `create`, `findById`, `findByOrderId`, `delete`, `deleteByOrderId` |
| `DeliveryInfo`  | `create`, `findById`, `findByOrderId`, `update`, `delete`, `validate`, `formatPhoneNumber` |

---

## Sécurité & Middleware

| Middleware            | Description                                                  |
|-----------------------|--------------------------------------------------------------|
| `authenticate`        | Vérifie le token JWT Bearer, attache `req.user`              |
| `requireAdmin`        | Vérifie que `req.user.role === 'ADMIN'`                      |
| `optionalAuth`        | Auth optionnelle (défini mais non utilisé)                   |
| `errorHandler`        | Gestion centralisée des erreurs (MySQL, 404, 500)            |
| `handleAsync`         | Wrapper async/await pour les contrôleurs                     |
| `validationMiddleware`| Validation des champs avec express-validator                  |
| `helmet`              | Protection HTTP headers                                       |
| `cors`                | Cross-Origin autorisé pour localhost:5173 et 3000            |

---

## Statuts de Commande

| Statut       | Description             |
|--------------|-------------------------|
| `EN_ATTENTE` | En attente de traitement|
| `CONFIRMEE`  | Commande confirmée      |
| `EXPEDIEE`   | Commande expédiée       |
| `LIVREE`     | Commande livrée         |
| `ANNULEE`    | Commande annulée        |

---

## Fonctionnalités Backend Non Utilisées par le Frontend

| Fonctionnalité                     | Endpoint Backend            | État Frontend          |
|------------------------------------|-----------------------------|------------------------|
| Rafraîchir le token JWT            | `POST /api/auth/refresh`    | Non implémenté         |
| Voir/modifier le profil            | `GET/PUT /api/auth/profile` | Page stub              |
| Gérer les produits (CRUD admin)    | `POST/PUT/DELETE /api/products` | Non implémenté      |
| Gérer les catégories (CRUD admin)  | `POST/PUT/DELETE /api/categories` | Non implémenté    |
| Liste commandes admin              | `GET /api/admin/orders`     | Non implémenté         |
| Modifier statut commande           | `PATCH /api/admin/orders/:id/status` | Non implémenté  |
| Filtrer commandes par statut       | `GET /api/admin/orders/status/:status` | Non implémenté |
| Liste utilisateurs admin           | `GET /api/admin/users`      | Non implémenté         |
| Supprimer utilisateur              | `DELETE /api/admin/users/:id` | Non implémenté       |
| Sous-catégories                    | `GET /api/categories/:id/subcategories` | Non implémenté |
| Auth optionnelle middleware         | `optionalAuth`              | Non utilisé            |

---

## Problèmes Connus & Améliorations Possibles

### Corrigés ✅
1. **URL API frontend** — `VITE_API_BASE_URL` manquait le suffixe `/api` → corrigé
2. **Helmet Referrer Policy** — bloquait les requêtes cross-origin → configuré avec `strict-origin-when-cross-origin`
3. **Emails envoyés au magasin** — Les emails de confirmation sont maintenant envoyés au client
4. **Validation delivery info** — `validateDeliveryInfo` corrigé pour vérifier `body('deliveryInfo.firstName')` au lieu de `body('firstName')`
5. **Validation cartItemId** — Nouveau validateur `validateCartItemIdParam` pour `param('cartItemId')` dans les routes panier

### À corriger ⚠️
6. **Pas de refresh token** — Sur 401, le frontend redirige vers `/login` au lieu de tenter un refresh
7. **Route admin non protégée par rôle** — `ProtectedRoute` ne vérifie pas le rôle ADMIN
8. **Page Account est un stub** — Le backend a les endpoints profil mais le frontend ne les utilise pas
9. **Page Wishlist est morte** — Aucun backend pour les favoris
10. **Login filename casing** — `login.jsx` (minuscule) cassera sur Linux/macOS
11. **Zustand installé mais jamais utilisé** — Dépendance morte dans le frontend
12. **body-parser installé mais jamais utilisé** — Dépendance morte dans le backend
