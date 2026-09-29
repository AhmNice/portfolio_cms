# Portfolio CMS

**Portfolio CMS** is a React-based content management dashboard for managing and publishing content for a personal developer portfolio.

It provides an authenticated workspace for managing **projects, articles, contact messages, media uploads, account settings, and publishing workflows**.

This repository contains the **frontend application**. It communicates with a separate Portfolio CMS API.

## Features

* **Dashboard** — Overview of portfolio content and contact messages
* **Project Management** — Create, edit, publish, and delete portfolio projects
* **Article Management** — Write and manage Markdown-based articles with previews, slugs, and publishing controls
* **Message Inbox** — View contact messages, track read/unread status, and delete messages
* **Media Uploads** — Signed upload workflow for project and article assets
* **Authentication** — Login, logout, session verification, password recovery, and password reset
* **Protected Routes** — Separate authentication and application route guards
* **Appearance** — Light, dark, and system themes
* **Workspace Preferences** — Local preferences for notifications and draft settings
* **Responsive UI** — Sidebar navigation, search, toast notifications, loading states, and empty states

## Tech Stack

* **React 19** — UI library
* **TypeScript** — Type safety
* **Vite 8** — Development and build tooling
* **React Router 7** — Client-side routing
* **Zustand** — Client-side state management
* **Axios** — HTTP client
* **Tailwind CSS 4** — Styling
* **React Hook Form** — Form management
* **React Markdown** — Markdown rendering
* **remark-gfm** — GitHub-Flavored Markdown support
* **Lucide React** — Icons

## Requirements

* Node.js 20+
* npm
* A running Portfolio CMS API

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/AhmNice/portfolio_cms.git
cd portfolio_cms
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Create a `.env` file in the project root:

```env
VITE_API_BASE_URL=http://localhost:3000/api/v1
```

`VITE_API_BASE_URL` is optional. If omitted, the application defaults to:

```text
http://localhost:3000/api/v1
```

### 4. Start the development server

```bash
npm run dev
```

The application will be available at the URL displayed by Vite, usually:

```text
http://localhost:5173
```

## Available Scripts

| Command           | Description                              |
| ----------------- | ---------------------------------------- |
| `npm run dev`     | Start the development server             |
| `npm run build`   | Type-check and create a production build |
| `npm run lint`    | Run ESLint                               |
| `npm run preview` | Preview the production build locally     |

## Application Routes

### Authentication

| Route                    | Description                |
| ------------------------ | -------------------------- |
| `/auth/login`            | Sign in to the CMS         |
| `/auth/recover-password` | Start account recovery     |
| `/auth/reset-password`   | Reset the account password |

### Application

| Route             | Description                              |
| ----------------- | ---------------------------------------- |
| `/`               | Redirects to the dashboard or login      |
| `/dashboard`      | Portfolio and inbox overview             |
| `/projects`       | Manage portfolio projects                |
| `/projects/:slug` | View or edit a project                   |
| `/articles`       | Manage articles                          |
| `/articles/:slug` | View or edit an article                  |
| `/messages`       | View contact messages                    |
| `/messages/:id`   | View an individual message               |
| `/settings`       | Manage account and workspace preferences |

All application routes are protected by authentication.

## API Contract

The frontend communicates with the backend through Axios and expects the API to expose the following resource groups:

```text
Projects
GET     /projects
POST    /projects
PATCH   /projects/:id
DELETE  /projects/:id

Articles
GET     /articles
POST    /articles
PATCH   /articles/:id
DELETE  /articles/:id

Messages
GET     /messages
PUT     /messages/:id
DELETE  /messages/:id

Uploads
POST    /upload/signature

Authentication
POST    /auth/login
POST    /auth/logout
GET     /auth/me
POST    /auth/request-recovery
POST    /auth/change-password
```

The exact request and response structures are defined by the frontend's TypeScript interfaces and the corresponding backend API contract.

### Authentication

The client supports authenticated API requests using:

* Bearer access tokens
* HTTP credentials for cookie-based authentication
* Automatic authentication state verification
* Automatic local session cleanup after an unauthorized response

The API must allow the frontend origin through CORS and support credentials where required.

## Project Structure

```text
src/
├── components/     # Shared UI components
├── context/        # Application context providers
├── hooks/          # Route guards and reusable hooks
├── interface/      # TypeScript types and DTOs
├── layout/         # Application layouts
├── lib/            # Axios client and request utilities
├── pages/          # Route-level pages
├── store/          # Zustand stores
└── util/           # Theme, Markdown, and utility functions
```

## State Management

The application uses **Zustand** for client-side state management.

Separate stores are responsible for areas such as:

* Authentication
* Projects
* Articles
* Messages
* Media uploads

This keeps feature-specific state isolated while allowing shared application state to remain lightweight.

## Local Preferences

Some UI preferences are stored locally in the browser.

```text
theme
```

Stores the selected appearance mode.

```text
portfolio-cms-preferences
```

Stores local workspace preferences such as notification and draft settings.

These preferences are browser-specific and are not synchronized with the backend.

## Production Build

Create a production build:

```bash
npm run build
```

Preview the production build locally:

```bash
npm run preview
```

For a deployed application, set:

```env
VITE_API_BASE_URL=https://your-api-domain.com/api/v1
```

before building.

> **Note:** Vite embeds `VITE_*` environment variables into the application during the build process. Changing the API URL therefore requires a new build.

## Backend

This frontend requires a compatible Portfolio CMS API.

The backend is responsible for:

* Authentication and session management
* Portfolio content persistence
* Project and article management
* Contact message management
* Media upload signing
* Password recovery
* API authorization

The frontend and backend are maintained as separate applications and communicate through the API contract.

## License

This project is a personal portfolio CMS and is primarily intended for personal use.