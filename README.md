# PdA Platform — Quick Start Guide

> Internal student management platform for **Programadores do Amanhã (PdA)** — centralizing student data, tracking deliveries, and enabling faster, data-driven support for every student enrolled.

---

## Table of Contents

- [PdA Platform — Quick Start Guide](#pda-platform--quick-start-guide)
  - [Table of Contents](#table-of-contents)
  - [About the Project](#about-the-project)
  - [Prerequisites](#prerequisites)
  - [Installation \& Setup](#installation--setup)
  - [Environment Variables](#environment-variables)
  - [Available Scripts](#available-scripts)
  - [Project Structure](#project-structure)
    - [Server Actions \& State](#server-actions--state)
  - [Naming Conventions](#naming-conventions)
    - [Files \& Folders](#files--folders)
    - [Code Identifiers](#code-identifiers)
    - [Database (Supabase)](#database-supabase)
  - [Commit Convention](#commit-convention)
  - [Key Architecture Patterns](#key-architecture-patterns)
    - [Auth \& Permissions](#auth--permissions)
    - [Server Actions (no API routes)](#server-actions-no-api-routes)
    - [Zustand Stores](#zustand-stores)
    - [Component Props](#component-props)
  - [Tech Stack](#tech-stack)
  - [FAQ](#faq)

---

## About the Project

The PdA Platform centralizes all student data in one place, replacing fragmented spreadsheets with a unified system that gives the team clear visibility into key indicators — attendance, deliveries, individual progress — so they can proactively support students and reduce churn.

The platform is built around three core views:

| Feature                | Description                                                |
| ---------------------- | ---------------------------------------------------------- |
| **Classroom Overview** | KPIs and indicators per classroom for fast team action     |
| **Delivery Table**     | Track activity submissions and identify pending deliveries |
| **Student Overview**   | Individual student data and progress at a glance           |

---

## Prerequisites

Make sure you have the following installed before starting:

| Tool                                          | Version            |
| --------------------------------------------- | ------------------ |
| [Node.js](https://nodejs.org/)                | 20.x or higher     |
| [TypeScript](https://www.typescriptlang.org/) | 5.x or higher      |
| [Git](https://git-scm.com/)                   | Any recent version |

A package manager of your choice:

- `yarn` (recommended — used by this project)
- `npm`, `pnpm`, or `bun` also work

---

## Installation & Setup

```bash
# 1. Clone the repository
git clone https://github.com/Programadores-do-amanha-PDA/new-platform-pda

# 2. Enter the project directory
cd new-platform-pda

# 3. Install dependencies
yarn install
# or: npm install | pnpm install | bun install

# 4. Configure environment variables (see next section)

# 5. Start the development server
yarn dev
# or: npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Environment Variables

Create a `.env.local` file in the project root based on the template below:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

> Contact the team lead to get the `.env.local` file with actual values for local development.
> **Never commit `.env.local` or any file containing secrets.**

---

## Available Scripts

| Command              | Description                               |
| -------------------- | ----------------------------------------- |
| `yarn dev`           | Start development server with pretty logs |
| `yarn build`         | Production build                          |
| `yarn start`         | Start production server                   |
| `yarn test`          | Run unit tests                            |
| `yarn test:watch`    | Run tests in watch mode                   |
| `yarn test:coverage` | Run tests with coverage report            |
| `yarn lint`          | Lint the project                          |
| `yarn lint:fix`      | Lint and auto-fix issues                  |
| `yarn format`        | Format code with Prettier                 |
| `yarn format:check`  | Check formatting without writing          |

---

## Project Structure

The project uses a **modular, feature-driven architecture** to keep the codebase navigable and maintainable as the platform grows.

```txt
src/
├── actions/             # Global Server Actions ("use server")
├── app/                 # Next.js App Router — pages and layouts
├── components/          # Shared UI components
│   ├── common/          # Buttons, Inputs, Modals, etc.
│   ├── layout/          # Header, Sidebar, Footer
│   └── forms/           # Form-specific components
├── features/            # Feature modules (domain-driven)
│   └── dashboard/
│       ├── roles/       # Role-specific features (admin, etc.)
│       └── shared/      # Shared across dashboard features
├── hooks/               # Global custom hooks
├── lib/                 # Low-level utilities (supabase client, logger)
├── providers/           # React context providers
├── stores/              # Zustand global stores
├── types/               # Global TypeScript types
├── utils/               # High-level utility functions
└── styles/              # Global styles
```

### Server Actions & State

- **Global actions**: `src/actions/` — shared operations (e.g., `profile-avatar.ts`, `user-role.ts`)
- **Feature actions**: `src/features/[feature]/actions.ts` — domain-scoped operations
- **Global stores**: `src/stores/` — cross-feature state (e.g., `auth-store.ts`)
- **Feature stores**: `src/features/[feature]/store.ts` — domain-scoped state

---

## Naming Conventions

Consistency across the codebase is enforced by the following rules:

### Files & Folders

| Type             | Convention            | Example              |
| ---------------- | --------------------- | -------------------- |
| React components | `PascalCase.tsx`      | `UserCard.tsx`       |
| Hooks            | `kebab-case.ts`       | `use-permissions.ts` |
| Stores           | `kebab-case-store.ts` | `auth-store.ts`      |
| Types/Interfaces | `kebab-case.types.ts` | `user.types.ts`      |
| Utils / Services | `kebab-case.ts`       | `api-service.ts`     |
| Folders          | `kebab-case`          | `user-profile/`      |

### Code Identifiers

| Type                            | Convention                   | Example                   |
| ------------------------------- | ---------------------------- | ------------------------- |
| Variables & functions           | `camelCase`                  | `studentAttendanceFilter` |
| Async functions                 | `camelCase` + `Async` suffix | `fetchUserDataAsync`      |
| Constants                       | `SCREAMING_SNAKE_CASE`       | `MAX_FILE_SIZE`           |
| Components / Types / Interfaces | `PascalCase`                 | `UserCardProps`           |

### Database (Supabase)

All table names and column properties must use `snake_case`:

```txt
classroom_projects
created_at
student_attendance
```

---

## Commit Convention

All commits must follow [Conventional Commits](https://www.conventionalcommits.org/):

```txt
<type>(<scope>): <short description>
```

**Examples:**

```bash
feat(classroom): add attendance summary table
fix(auth): resolve session expiry redirect loop
refactor(hooks): extract useFetchData from useUserData
docs(readme): update installation steps
style(button): adjust padding tokens
test(user-service): add edge case coverage
chore(deps): upgrade next to 16.1.1
```

**Types:**

| Type       | When to use                         |
| ---------- | ----------------------------------- |
| `feat`     | New feature                         |
| `fix`      | Bug fix                             |
| `refactor` | Code change with no behavior change |
| `docs`     | Documentation only                  |
| `style`    | Formatting, no logic change         |
| `test`     | Adding or fixing tests              |
| `chore`    | Deps, configs, maintenance          |

---

## Key Architecture Patterns

### Auth & Permissions

```typescript
const { user } = useAuth();
const { can } = useUserPermissions();

if (!can('edit:classroom')) return <PermissionDenied />;
```

Always validate permissions **server-side** inside Server Actions. Client-side checks are UI-only.

### Server Actions (no API routes)

Every mutation must go through a Server Action with `"use server"`:

```typescript
// src/features/sign-in/actions.ts
"use server";

export async function signInWithEmailAsync(email: string, password: string) {
    // runs securely on the server
}
```

### Zustand Stores

```typescript
// src/stores/shared/auth-store.ts
export const useAuthStore = create<AuthState & AuthActions>()(
    devtools((set) => ({
        user: null,
        setUser: (user) => set({ user }),
    })),
);
```

### Component Props

All props must be `readonly`:

```typescript
interface UserCardProps {
  readonly userId: string;
  readonly onEdit?: (id: string) => void;
}

export const UserCard = ({ userId }: Readonly<UserCardProps>) => { ... };
```

---

## Tech Stack

| Package                   | Purpose                                 |
| ------------------------- | --------------------------------------- |
| **Next.js 16**            | Framework — App Router + Server Actions |
| **React 19**              | UI library                              |
| **TypeScript 5**          | Static typing                           |
| **Supabase**              | Auth + PostgreSQL database              |
| **Zustand 5**             | Global state management                 |
| **Tailwind CSS 4**        | Utility-first styling                   |
| **Radix UI / Shadcn**     | Accessible, unstyled components         |
| **React Hook Form + Zod** | Form handling and validation            |
| **TanStack Table**        | Data tables                             |
| **TanStack Virtual**      | List virtualization (100+ items)        |
| **Pino**                  | Structured server-side logging          |
| **date-fns**              | Date/time utilities                     |
| **Lucide React**          | Icon library                            |
| **Axios**                 | HTTP client for Server Actions          |

---

## FAQ

**Can I add a new library?**
Yes — as long as it complements (and does not replace) an existing dependency. Discuss with the team before adding.

**Can I use a different package manager?**
Yes. Use whatever you prefer locally, but make sure there are no lock file conflicts when opening a PR.

**Can I change the project structure?**
Partially. Improvements are welcome as long as they don't diverge from the feature-driven architecture established here.

**Where do I get the Supabase credentials?**
Contact the team lead. Never share or commit credentials.
