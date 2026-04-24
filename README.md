# Recipes Blogs — Modern Recipe Platform

A scalable, SEO-optimized recipe blog platform built with Next.js, Express, and PostgreSQL.

## 🚀 Project Progress

| Phase | Description | Status |
| :--- | :--- | :--- |
| **🟢 Phase 1** | **Foundation** (Monorepo, Next.js, Express, DB Schema) | ✅ **Done** |
| **🟡 Phase 2** | **Core Backend (API)** (REST Endpoints, Validation, Search) | ✅ **Done** |
| **🔵 Phase 3** | **Frontend Core** (Homepage, Recipe Pages, Layout) | ✅ **Done** |
| **🟣 Phase 4** | **Admin Panel + Editor** (Tiptap Integration, Image Upload) | 📅 Upcoming |
| **🟠 Phase 5** | **Advanced Features** (Filtering, Search UI, Dark Mode) | 📅 Upcoming |
| **🔴 Phase 6** | **Performance & Optimization** (Caching, Image Opt) | 📅 Upcoming |
| **⚫ Phase 7** | **SEO Layer** (Schema.org, Meta Tags, Sitemap) | 📅 Upcoming |

## 🛠️ Tech Stack
- **Frontend:** Next.js 15, Tailwind CSS v4, shadcn/ui
- **Backend:** Node.js, Express, Prisma ORM
- **Database:** PostgreSQL (Docker)
- **Validation:** Zod

## 📖 API Documentation

### Recipes
| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| `GET` | `/recipes` | List recipes (supports `page`, `limit`, `search`, `categoryId`) | Public |
| `GET` | `/recipes/:slug` | Get a single recipe by SEO slug | Public |
| `POST` | `/recipes` | Create a new recipe (auto-slug generation) | Admin |
| `PUT` | `/recipes/:id` | Update recipe content/metadata | Admin |
| `DELETE` | `/recipes/:id` | Delete a recipe | Admin |

### Categories
| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| `GET` | `/categories` | List all categories | Public |
| `POST` | `/categories` | Create a new category | Admin |
| `PUT` | `/categories/:id` | Update category name | Admin |
| `DELETE` | `/categories/:id` | Delete a category | Admin |

### Ingredients
| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| `GET` | `/ingredients` | List all ingredients | Public |
| `POST` | `/ingredients` | Create a new ingredient | Admin |
| `PUT` | `/ingredients/:id` | Update ingredient name | Admin |
| `DELETE` | `/ingredients/:id` | Delete an ingredient | Admin |

## 🏁 Getting Started

1. **Install Dependencies:**
   ```bash
   npm install
   ```

2. **Environment Setup:**
   - Copy `.env.example` to `.env` (if applicable)
   - Ensure Docker is running for the database.

3. **Run Development Servers:**
   ```bash
   # Both API and Web
   npm run dev
   ```

4. **Database Management:**
   ```bash
   cd apps/api
   npx prisma studio
   ```

