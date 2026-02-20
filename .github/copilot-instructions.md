# 🤖 AI Instructions (copilot-instructions.md)

- You can and should make code suggestions for this repository.
- Always follow the guidelines below when generating or refactoring code.
- You may suggest adding new dependencies, but only if justified and approved by the team.
- You may make changes directly to existing files, but be cautious not to break functionality.
- Always write clean, readable, and well-documented code.
- When fixing code, always test the proposed solution to ensure the issue is resolved.
- If you find duplicate code, suggest extracting it into a reusable function/utility.
- When fixing code, analyze all its dependencies and backward compatibility to ensure your fix doesn't break anything.

---

## 🌐 Language & Documentation Rules

> [!IMPORTANT]
> **All documentation, comments, and text must be written in English.** This is a strictly enforced rule.

### Mandatory English-Only Content

The following MUST always be written in **English**:

1. **Code Comments**
    - Inline comments (`// comment`)
    - Block comments (`/* comment */`)
    - TODO/FIXME annotations
    - simple and concise

2. **Documentation**
    - JSDoc/TSDoc blocks
    - README files
    - Markdown documentation (all docs on /docs folder)
    - Code examples in docs

3. **Code Identifiers**
    - Variable names
    - Function names
    - Component names
    - Type/Interface names
    - Constants

4. **Git & Version Control**
    - Commit messages (follow Conventional Commits)
    - Branch names
    - Pull request titles and descriptions

5. **Error Messages & Logging**
    - Console logs
    - Error messages in code
    - Logger output (Pino)

---

## ⚡ Quick Start

- **Stack**: Next.js 16 (App Router) + TypeScript + Zustand stores + Server Actions + Tailwind CSS + Radix UI
- **Build**: `npm run build` | **Test**: `npm test` | **Dev**: `npm run dev`
- **Imports**: Use `@/*` (src) path aliases
- **Server Actions**:
    - **Global/Shared**: `src/actions/` for cross-feature actions (e.g., `profile-avatar.ts`, `user-role.ts`)
    - **Feature-specific**: `src/features/[feature]/actions.ts` for domain-scoped actions
- **State**: Zustand stores:
    - **Global/Shared**: `src/stores/` for cross-feature state (e.g., `auth-store.ts`)
    - **Feature-specific**: `src/features/[feature]/store.ts` for domain-scoped state (e.g., `enrollments/store.ts`)
- **Auth**: Supabase JWT-based with `useAuthStore` + role-based permissions system

## 🏗️ Critical Architecture Patterns

### Server Actions for All Mutations

Every server-side operation (DB writes, auth, file uploads) must use Server Actions with `"use server"` directive:

- **Global actions**: `src/actions/` for shared operations (e.g., `profile-avatar.ts`, `user-role.ts`)
- **Feature actions**: `src/features/[feature]/actions.ts` for domain-specific operations (e.g., `sign-in/actions.ts`, `dashboard/shared/profile/actions.ts`)

```typescript
// Global action: src/actions/profile-avatar.ts
"use server";
import { createClient } from "@supabase/supabase-js";

export async function updateProfileAvatarAsync(userId: string, file: File) {
    // Server-only code - no client overhead
}

// Feature action: src/features/sign-in/actions.ts
("use server");

export async function signInWithEmailAsync(email: string, password: string) {
    // Feature-specific server action
}
```

**Why**: Eliminates need for API routes; runs securely on server; auto-handles middleware auth.

### Zustand Stores with Devtools Middleware

All persistent global state uses `create()` with devtools:

```typescript
// src/stores/shared/auth-store.ts
export const useAuthStore = create<AuthState & AuthActions>()(
    devtools((set, get) => ({
        user: null,
        setUser: (user) => set({ user }),
        fetchUserPermissionsAsync: async (role) => {
            const permissions = await getPermissionsByRoleAsync(role);
            set({ permissions });
        },
    })),
);
```

**Pattern**: Store exposes actions as methods, not raw dispatch. Devtools enables time-travel debugging.

### Permission & Role Guards with Custom Hooks

Authorization is declarative via hooks, not scattered in components:

```typescript
// Use in components
const { user } = useAuth(); // from store + Server Actions
const { can } = useUserPermissions(); // role-based access control
const { hasAccess } = useAccessControl(); // granular checks

if (!can('edit:classroom')) return <PermissionDenied />;
```

Implementations in `src/hooks/use-permissions*.ts` → check store → verify against backend.

### Features Directory: Domain-Driven Layout

Each domain gets a `features/[domain]` folder:

```
features/
├── api/                  # API utilities
├── dashboard/            # Dashboard domain
│   ├── roles/            # Role-specific features
│   │   └── admin/        # Admin-only features (classrooms, jobs, etc.)
│   └── shared/           # Shared within dashboard
│       ├── enrollments/  # Enrollments management (actions.ts, store.ts, types.ts)
│       ├── profile/      # Profile management
│       └── users/        # Users management
├── email-confirmation/   # Email confirmation feature
├── reset-password/       # Password reset feature
├── shared/               # Shared across all features
└── sign-in/              # Authentication feature
```

**Principle**: Cross-domain imports are allowed (`@/features/classrooms`), but minimize them.

### Type-Safe Props with `readonly` Modifier

All component props must be frozen:

```typescript
interface UserCardProps {
    readonly userId: string;
    readonly onEdit?: (id: string) => void;
}
// ❌ NOT: const UserCard = ({ userId }: UserCardProps) => ...
// ✅ DO: export const UserCard = ({ userId }: Readonly<UserCardProps>) => ...
```

## 🛠️ Development Workflow

### Testing

- **Unit Tests**: Jest + Testing Library (`npm test`)
- **Test Pattern**: `__tests__/*.(test|spec).ts(x)` or `*.test.ts(x)`
- **Coverage**: Run `npm run test:coverage` before PRs
- **Key Setup**: jest.config.ts has path alias mappings ([@/, @features/*])

### Logging

- **Logger**: Pino (configured in `src/lib/logger/`)
- **Usage**: `import { logger } from "@/lib/logger"; logger.info({ userId }, "message")`
- **Modules**: Use `.child({ module: "ComponentName" })` for context
- **Avoid**: `console.log` in production code (use logger)

### Linting & Formatting

- **ESLint**: `npm run lint` (extends Next.js + Prettier)
- **Fix**: `npm run lint:fix`
- **Format**: `npm run format` (Prettier)
- **Pre-commit**: Ensure both pass before pushing

## 📋 Code Conventions (THIS Project Specific)

### File & Component Naming

- **Components**: PascalCase.tsx (e.g., `UserCard.tsx`)
- **Hooks**: camelCase.ts (e.g., `use-permissions.ts`)
- **Stores**: camelCase-store.ts (e.g., `auth-store.ts`)
- **Actions**: camelCase.ts in `src/actions/` with `Async` suffix for async functions (e.g., `updateProfileAvatarAsync`)
- **Folders**: kebab-case (e.g., `custom-data-table/`)

### Props & Interfaces

- Always use `interface` for component props (not `type`)
- Props parameter MUST be `Readonly<Props>` or use `readonly` on fields
- Generic components use generics (e.g., `<TData>` for tables)

```typescript
interface DefaultDataTableProps<TData> {
    readonly data: TData[];
    readonly onRowClick?: (row: TData) => void;
}
```

### Async Function Naming

Functions that are async must end with `Async`:

```typescript
// ✅ Clear intent
export async function fetchUserDataAsync(id: string) { ... }
export async function createClassroomAsync(data: ClassroomInput) { ... }

// ❌ Misleading
export async function getUser(id: string) { ... }
```

### Error Handling in Server Actions

```typescript
try {
  const data = await db.query(...);
  return { success: true, data };
} catch (error) {
  const message = error instanceof Error ? error.message : 'Unknown error';
  logger.error({ err: error }, 'Operation failed');
  throw new Error(message); // Re-throw for client to handle
}
```

## 🔐 Security Practices

- **Never hardcode secrets**: Use `next.config.mjs` for `serverComponentsExternalPackages` (Pino)
- **Auth**: Check `useAuthStore().user` before rendering protected content
- **Permissions**: Always verify server-side in actions (client-side is UI-only)
- **File uploads**: Max 15MB (configured in `next.config.mjs` → `serverActions.bodySizeLimit`)

## 📦 Key Dependencies & Their Role

| Package                   | Purpose                                | Usage                                     |
| ------------------------- | -------------------------------------- | ----------------------------------------- |
| **Next.js 16**            | Framework (App Router, Server Actions) | Pages in `app/`                           |
| **Zustand**               | State management                       | `useAuthStore`, `usePermissionsStore`     |
| **Supabase**              | Auth + Database                        | `@supabase/supabase-js` + `@supabase/ssr` |
| **Radix UI**              | Unstyled accessible components         | Dialog, Tabs, Accordion, etc.             |
| **Tailwind CSS**          | Styling                                | Classes on elements                       |
| **React Table**           | Data tables                            | `DefaultDataTable` component              |
| **React Virtual**         | List virtualization                    | Large tables/lists (100+ items)           |
| **React Hook Form + Yup** | Forms + validation                     | Complex form logic                        |
| **Axios**                 | HTTP client                            | API calls from Server Actions             |
| **Pino**                  | Logging                                | Server-side structured logs               |
| **date-fns**              | Date utilities                         | Date/time formatting                      |

## 🚀 Performance Checklist

- [ ] Tables with 100+ items use `<DefaultDataTable>` (virtualizes automatically)
- [ ] Images in lists wrapped with `loading="lazy"`
- [ ] Long-running Server Actions use `revalidatePath()` or `revalidateTag()` for ISR
- [ ] No client-side infinite loops in `useEffect` (always have dependency array)
- [ ] Large features are lazy-loaded via route-based code splitting

## 🔗 Cross-Component Communication

- **Between features**: Minimal. Prefer shared Context Providers in `providers/`
- **Global state**: Use `useAuthStore` + `usePermissionsStore`
- **Component composition**: Pass data as props when possible
- **ClassroomDataLoader**: Special provider for classroom context in `src/providers/classroom-data-loader-provider.tsx`

## ⚠️ Common Pitfalls to Avoid

1. **Calling Server Actions in useEffect without proper cleanup** → Can cause double-fetches
2. **Direct DOM manipulation** → Use React patterns; check `shiki-markdown.tsx` if you need innerHTML
3. **Missing permission checks in UI** → Always check server-side in actions too
4. **Hardcoding magic strings** → Extract to `src/utils/*-labels.ts` or constants
5. **Not using the logger** → All server errors should be logged for debugging

---

## 🏆 1. High-Level Principles (Our Mindset)

All generated or refactored code must follow these pillars:

1. **TypeScript-first**: Strict mode enabled. Never use `any`. Use `unknown` for safe typing when the type is truly unknown.

2. **Performance-first**: Optimize for Core Web Vitals. Use `React.memo`, `useCallback`, and `useMemo` consciously. Implement Code Splitting (Lazy Loading) for routes.

3. **Accessibility-first (A11y)**: Use semantic HTML and ARIA practices. Ensure keyboard navigation and screen reader support.

4. **Modular Architecture (SRP)**: **Our main focus**. DO NOT put business logic (fetch, state manipulation, business rules) in UI components. Extract it to Custom Hooks or Services. Organize code in **small, reusable modules**.

5. **Functional Programming & Immutability**:
    - Prefer **pure functions** (same input = same output, no side effects)
    - **Avoid direct mutation**: Use immutable methods (`.map()`, `.filter()`, spread operator) instead of `.push()`, `.splice()`, etc.
    - Prefer **`const`** over `let`. Never use `var`.

6. **Modern JavaScript (ESNext)**:
    - Use **`async/await`** instead of callbacks/chained promises
    - Destructuring, optional chaining (`?.`), nullish coalescing (`??`)
    - Template literals and arrow functions

7. **Clean Code**: Prefer readable and explicit code over "clever" code. DRY, KISS, and YAGNI should guide your decisions.

8. **Boy Scout Rule**: Leave the code better than you found it.
    - Refactored a function? Add JSDoc.
    - Saw an `any`? Fix it.
    - Small improvements accumulate.

### 📁 1.2 Standard Folder Structure

```
src/
├── actions/             # Server Actions with "use server" directive
├── app/                 # Next.js App Router - pages and layouts
├── components/          # Reusable UI components
│   ├── common/          # Buttons, Inputs, Modals
│   ├── layout/          # Header, Sidebar, Footer
│   └── forms/           # Form-specific components
├── features/            # Features by domain
│   └── dashboard/
│       ├── components/
│       ├── hooks/
│       └── types/
├── hooks/               # Global custom hooks
├── lib/                 # Utility libraries (supabase, logger, etc.)
├── providers/           # React context providers
├── stores/              # Zustand stores
├── types/               # Global types
├── utils/               # Pure utility functions
└── styles/              # Global styles
```

**Principles:**

- **Feature-based**: Use `features/` folder when the domain is complex and self-contained.
- **Flat structure**: Use root-level folders for small/medium projects.
- **Colocation**: Keep related files close together (component + types + hooks).

---

## 🔧 2. Main Tech Stack

Code must use exclusively the libraries below:

### **State Management: Zustand**

**When to use:**

- Global state shared by 3+ components
- Complex state with multiple actions (e.g., auth, user preferences)

**Pattern:**

```typescript
// stores/auth-store.ts
import { create } from "zustand";
import { devtools } from "zustand/middleware";

interface User {
    readonly id: string;
    readonly email: string;
    readonly name: string;
}

interface AuthState {
    readonly user: User | null;
    readonly isAuthenticated: boolean;
    readonly isLoading: boolean;
}

interface AuthActions {
    setUser: (user: User | null) => void;
    setLoading: (loading: boolean) => void;
    logout: () => void;
}

type AuthStore = AuthState & AuthActions;

export const useAuthStore = create<AuthStore>()(
    devtools((set) => ({
        // State
        user: null,
        isAuthenticated: false,
        isLoading: true,

        // Actions
        setUser: (user) =>
            set({
                user,
                isAuthenticated: user !== null,
            }),

        setLoading: (isLoading) => set({ isLoading }),

        logout: () =>
            set({
                user: null,
                isAuthenticated: false,
            }),
    })),
);

// Usage in components
const user = useAuthStore((state) => state.user);
const logout = useAuthStore((state) => state.logout);
```

---

### **Forms: React Hook Form + Yup**

**When to use:**

- Any form with validation
- Multi-step forms
- Complex form state

**Pattern:**

```typescript
// features/auth/schemas/login-schema.ts
import * as Yup from "yup";

export const loginSchema = Yup.object({
    email: Yup.string().email("Invalid email address").required("Email is required"),
    password: Yup.string().min(8, "Password must be at least 8 characters").required("Password is required"),
});

export type LoginFormData = Yup.InferType<typeof loginSchema>;

// features/auth/hooks/use-login-form.ts
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { loginSchema, LoginFormData } from "../schemas/login-schema";

export const useLoginForm = () => {
    const form = useForm<LoginFormData>({
        resolver: yupResolver(loginSchema),
        defaultValues: {
            email: "",
            password: "",
        },
    });

    const onSubmit = async (data: LoginFormData) => {
        // Handle submission
    };

    return { form, onSubmit };
};
```

---

### **Backend & Database: Supabase**

**Pattern for data fetching:**

```typescript
// lib/supabase.ts
import { createClient } from "@supabase/supabase-js";
import { Database } from "@/types/database";

export const supabase = createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
);

// services/user-service.ts
import { supabase } from "@/lib/supabase";

/**
 * Fetches a user by their ID from Supabase.
 *
 * @param userId - The unique identifier of the user.
 * @returns The user data or null if not found.
 * @throws {Error} If the database query fails.
 */
export const fetchUserByIdAsync = async (userId: string) => {
    const { data, error } = await supabase.from("users").select("*").eq("id", userId).single();

    if (error) {
        throw new Error(error.message);
    }

    return data;
};
```

---

### **Routing: Next.js App Router**

- File-based routing in `src/app/` directory
- Use layouts for shared UI (headers, tabs, etc.)
- Server Components by default, Client Components with `"use client"`

---

### **Styling: Tailwind CSS**

```typescript
// ✅ CORRECT - Using Tailwind CSS
import { cn } from "@/lib/utils";

interface ButtonProps {
  readonly variant?: "default" | "primary" | "danger";
  readonly className?: string;
  readonly children: React.ReactNode;
}

export const Button = ({ variant = "default", className, children }: ButtonProps) => (
  <button
    className={cn(
      "px-4 py-2 rounded-lg font-semibold transition-colors",
      variant === "default" && "bg-gray-200 hover:bg-gray-300",
      variant === "primary" && "bg-blue-600 text-white hover:bg-blue-700",
      variant === "danger" && "bg-red-600 text-white hover:bg-red-700",
      className
    )}
  >
    {children}
  </button>
);
```

---

## 📝 3. TypeScript: Rules and Conventions

### **Naming Conventions**

- **Components and Interfaces/Types**: `PascalCase`
- **Hooks**: `useCamelCase`
- **Functions/Variables**: `camelCase`
- **Constants**: `SCREAMING_SNAKE_CASE`
- **Async Functions**: Suffix `Async` (e.g., `fetchUserDataAsync`)

### **Typing and Immutability**

- Use `interface` for props and objects
- Use `type` for unions, intersections, or computed types
- Props should be `readonly`
- Use `as const` for immutable literals

```tsx
// ✅ Correct usage of as const
const ROUTES = {
    HOME: "/",
    DASHBOARD: "/dashboard",
    PROFILE: "/profile",
} as const;

type Route = (typeof ROUTES)[keyof typeof ROUTES]; // '/' | '/dashboard' | '/profile'

// ✅ Readonly array
const COLORS = ["red", "blue", "green"] as const;
type Color = (typeof COLORS)[number]; // 'red' | 'blue' | 'green'
```

- Never use `any` - prefer `unknown` and do type narrowing

### **Components**

- **DO NOT** use `React.FC` (issues with implicit children)
- Type `children` explicitly: `readonly children: React.ReactNode;`

### **Solid Typing Example**

```typescript
// ✅ DO
interface User {
    readonly id: string;
    readonly name: string;
    readonly email: string;
}

interface UserCardProps {
    readonly user: User;
    readonly onEdit?: (userId: string) => void;
}

// ❌ DON'T
type UserCardProps = {
    user: any; // NEVER!
    onEdit?: Function; // Too generic
};
```

### **File Naming**

- **React Components**: `PascalCase.tsx` (e.g., `UserProfile.tsx`)
- **Hooks**: `camelCase.ts` (e.g., `useUserData.ts`)
- **Types/Interfaces**: `camelCase.types.ts` (e.g., `user.types.ts`)
- **Utils/Services**: `camelCase.ts` (e.g., `apiService.ts`)
- **Constants**: `camelCase.ts` (e.g., `apiEndpoints.ts`)
- **Folders**: `kebab-case` (e.g., `user-profile/`)

### **Barrel Exports (index.ts)**

**When to Use:**

- Folders with 3+ exportable files
- You want clean imports: `import { Button, Input } from '@/components/common'`

**When NOT to Use:**

- Folders with 1-2 files (unnecessary overhead)
- May cause tree-shaking issues

**Example:**

```typescript
// components/common/index.ts
export { Button } from "./Button";
export { Input } from "./Input";
export { Modal } from "./Modal";

// Usage
import { Button, Input } from "@/components/common"; // ✅ Clean
```

**⚠️ Warning:** Never do `export * from './Button'` - export **explicitly**.

---

## ⚛️ 4. Main Pattern: SRP with Custom Hooks

**This is our default pattern.** The UI should be "dumb" (presentational).

### **Golden Rule**

> **DON'T**: `useEffect` with `axios.get` or business logic inside the UI component.
>
> **DO**: Create a hook `useFetchData(args)` that returns `{ data, loading, error }`. The UI component only consumes this hook.

### **When to Extract Logic to Hooks?**

Extract when there is:

- **Data fetching** (APIs, localStorage)
- **Business logic** (calculations, transformations, complex validations)
- **Complex state management** (multiple related `useState` → candidate for `useReducer`)
- **Side effects** (timers, subscriptions, event listeners)

### **Standard Signature for Fetch Hooks**

```typescript
// ✅ Consistent pattern
export const useFetchResource = (id: string) => {
    const [data, setData] = useState<Resource | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // ... fetch logic

    return { data, loading, error } as const;
};
```

---

## 🧩 5. Advanced Component Patterns

Apply these patterns to create flexible and reusable component APIs.

### **5.1. Compound Components**

**When to Use:**

- Component has multiple interdependent parts (e.g., `<Modal>`, `<Tabs>`, `<Accordion>`)
- State is implicitly shared between parts
- You want a flexible API without "prop drilling"

**When NOT to Use:**

- Component is simple (1-2 parts)
- State can be easily passed via props

**Example:**

```typescript
// ✅ Clean and flexible API
<Modal>
  <Modal.Header>Title</Modal.Header>
  <Modal.Body>Content</Modal.Body>
  <Modal.Footer>
    <Button>Close</Button>
  </Modal.Footer>
</Modal>

// ❌ Worse alternative (props explosion)
<Modal
  header="Title"
  body="Content"
  footerButtons={[...]}
/>
```

---

### **5.2. Context Module Pattern**

**When to Use:**

- You have a Context to share global state
- Want to prevent errors from "using Context outside Provider"

**Rule:**

- **ALWAYS** create a custom hook (e.g., `useTheme()`) to consume the context
- **NEVER** export the Context directly
- The hook should throw an error if used outside the Provider

**Example:**

```typescript
// ✅ DO
// ThemeContext.tsx
const ThemeContext = React.createContext<ThemeContextValue | undefined>(undefined);

export const useTheme = () => {
  const context = React.useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
};

// ❌ DON'T
export const ThemeContext = React.createContext(...); // Expose directly
```

---

### **5.3. Headless Components (Renderless Logic)**

**When to Use:**

- You want reusable UI logic **without** coupled styling
- Need "prop getters" for accessibility (aria-\*, role, etc.)
- Classic examples: `useToggle`, `useDisclosure`, `useCombobox`

**When NOT to Use:**

- Logic is too trivial (e.g., `const [open, setOpen] = useState(false)`)
- You don't need prop getters

**Example:**

```ts
// ✅ Reusable headless hook
export const useDisclosure = (initialOpen = false) => {
  const [isOpen, setIsOpen] = useState(initialOpen);

  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);
  const toggle = useCallback(() => setIsOpen((prev) => !prev), []);

  // Prop getters for accessibility
  const getTriggerProps = useCallback(() => ({
    onClick: toggle,
    'aria-expanded': isOpen,
    'aria-haspopup': 'dialog' as const,
  }), [toggle, isOpen]);

  const getContentProps = useCallback(() => ({
    role: 'dialog',
    'aria-modal': true,
  }), []);

  return { isOpen, open, close, toggle, getTriggerProps, getContentProps };
};

// Usage
const MyModal = () => {
  const { isOpen, close, getTriggerProps, getContentProps } = useDisclosure();

  return (
    <>
      <button {...getTriggerProps()}>Open Modal</button>
      {isOpen && (
        <div {...getContentProps()}>
          <p>Content</p>
          <button onClick={close}>Close</button>
        </div>
      )}
    </>
  );
};
```

---

### **5.4. Higher-Order Components (HOCs)**

**Official Position: Avoid. Prefer Hooks.**

**When to Use (rare exceptions):**

- Cross-cutting logic that cannot be expressed as a hook (e.g., `withAuth`, `withErrorBoundary`)
- Legacy libraries that require HOCs

**When NOT to Use:**

- Any case that can be solved with a custom hook
- Composition of more than 2 HOCs (HOC hell)

---

## ⚡ 6. Performance

### **6.1. Code Splitting and Lazy Loading**

```typescript
// ✅ Lazy load routes
const HomePage = React.lazy(() => import('./pages/HomePage'));
const DashboardPage = React.lazy(() => import('./pages/DashboardPage'));

// Usage with Suspense
<Suspense fallback={<Loader />}>
  <Routes>
    <Route path="/" element={<HomePage />} />
    <Route path="/dashboard" element={<DashboardPage />} />
  </Routes>
</Suspense>
```

### **6.2. Conscious Memoization**

#### **React.memo:**

**Use when:**

- Component is rendered in a list with **10+ items**
- Component re-renders frequently (parent changes state)
- Props are **complex** (objects/arrays) or there are expensive calculations

**Don't use when:**

- Component is rendered once on screen
- Props are only primitives (`string`, `number`, `boolean`)
- Component is trivial (<10 lines)

**Practical rule:** Profile first (React DevTools Profiler), optimize later.

```typescript
// ✅ List component
export const UserCard = React.memo(({ user, onEdit }: UserCardProps) => {
    // ...
});
```

#### **useCallback**

**Use when:**

- Function is passed as prop to a **memoized** component
- Function is a dependency of `useEffect`/`useMemo`

**Don't use when:**

- Function is only used inside the component (not passed as prop)
- Child component is not memoized

#### **useMemo**

**Use when:**

- Computation is **expensive** (loops with 100+ iterations, sorting, complex filtering)
- Value is a dependency of `useEffect`

**Don't use when:**

- Calculation is trivial (`a + b`, string concatenation)
- You're "trying to optimize" without profiling

**Benchmark before optimizing:** Use `console.time()` or React DevTools.

### **6.3. List Virtualization**

**When to Use:**

- Lists with **100+ items** visible simultaneously
- Each list item is rendered (not collapsed/hidden)

**Library:**

- **React Virtual** (preferred for React)

```typescript
import { useVirtualizer } from '@tanstack/react-virtual';

// ✅ Virtualized list
const VirtualList = ({ items }) => {
  const parentRef = useRef(null);

  const virtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 50,
  });

  return (
    <div ref={parentRef} style={{ height: 600, overflow: 'auto' }}>
      <div style={{ height: virtualizer.getTotalSize() }}>
        {virtualizer.getVirtualItems().map((virtualItem) => (
          <div key={virtualItem.key} style={{ transform: `translateY(${virtualItem.start}px)` }}>
            {items[virtualItem.index].name}
          </div>
        ))}
      </div>
    </div>
  );
};
```

### **6.4. Debouncing and Throttling**

**Debounce:** For search inputs (waits for user to stop typing)

```typescript
import { useMemo } from "react";
import { debounce } from "lodash-es";

const debouncedSearch = useMemo(
    () =>
        debounce((query: string) => {
            // API fetch
        }, 300),
    [],
);
```

**Throttle:** For scroll/resize handlers (limits executions per second)

### **6.5. Lazy Loading Images**

```typescript
// ✅ Browser native
<img src="photo.jpg" loading="lazy" alt="Description" />
```

---

## 🔒 7. Security

### **7.1. Environment Variables**

```typescript
// ✅ .env.local (never commit)
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=xxx

// ❌ DON'T hardcode secrets in code
const API_KEY = "abc123"; // NEVER!
```

### **7.2. XSS (Cross-Site Scripting)**

React already sanitizes strings automatically. **ATTENTION**:

```typescript
// ✅ Safe (React sanitizes)
<div>{userInput}</div>

// ⚠️ CAUTION - requires manual sanitization
<div dangerouslySetInnerHTML={{ __html: userInput }} />
// Use library: DOMPurify
```

### **7.3. Dependency Vulnerabilities**

- Run `npm audit` regularly
- Configure security alerts on GitHub (Dependabot)

### **7.4. HTTPS and CORS**

- **Always** use HTTPS in production
- Configure CORS correctly on backend (don't use `Access-Control-Allow-Origin: *` in production)

## 7.5. Error Handling and Logging

### **Standard Pattern for Error Handling in Hooks**

```typescript
// ✅ Consistent pattern
export const useFetchData = <T>(url: string) => {
    const [data, setData] = useState<T | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchDataAsync = async () => {
            setLoading(true);
            setError(null);

            try {
                const response = await axios.get<T>(url);
                setData(response.data);
            } catch (err: unknown) {
                // Standard type narrowing
                if (axios.isAxiosError(err)) {
                    const message = err.response?.data?.message || err.message;
                    setError(message);
                    console.error("[API Error]", { url, message, status: err.response?.status });
                } else if (err instanceof Error) {
                    setError(err.message);
                    console.error("[Unexpected Error]", err);
                } else {
                    setError("An unexpected error occurred");
                    console.error("[Unknown Error]", err);
                }
            } finally {
                setLoading(false);
            }
        };

        fetchDataAsync();
    }, [url]);

    return { data, loading, error } as const;
};
```

### **Logging**

- **Development**: `console.error` is sufficient
- **Production**: Use Pino logger (configured in `src/lib/logger/`)

### **Error Boundaries (future)**

For rendering errors that hooks don't capture.

---

## ♿ 8. Accessibility (A11y)

### **8.1. Semantic HTML**

```typescript
// ✅ Semantic
<button onClick={handleClick}>Click</button>
<nav><a href="/home">Home</a></nav>

// ❌ Not semantic
<div onClick={handleClick}>Click</div>
<div><span onClick={goHome}>Home</span></div>
```

### **8.2. Labels and ARIA**

```typescript
// ✅ Accessible input
<label htmlFor="email">Email:</label>
<input id="email" type="email" />

// ✅ ARIA when necessary
<div role="alert" aria-live="polite">
  {errorMessage}
</div>
```

### **8.3. Keyboard Navigation**

- Ensure that **all** interactive elements are focusable (Tab)
- Implement handlers for `Enter` and `Escape` when necessary

```typescript
// ✅ Keyboard support
<div
  role="button"
  tabIndex={0}
  onClick={handleClick}
  onKeyDown={(e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      handleClick();
    }
  }}
>
  Click or press Enter
</div>
```

### **8.4. Color Contrast**

- Minimum: **4.5:1** for normal text (WCAG AA)
- Minimum: **3:1** for large text (18pt+)

### **8.5. Quick Checklist**

- [ ] All buttons/links have descriptive labels?
- [ ] Forms have `<label>` with `htmlFor`?
- [ ] Images have descriptive `alt`?
- [ ] Modals have `role="dialog"` and `aria-modal="true"`?
- [ ] Loading states have `aria-live` or `role="status"`?

---

## 🔍 9. Refactoring and Analysis Process

When receiving an existing `.js` or `.tsx` file for refactoring, your workflow should be:

### **Step 1: Analysis and Documentation (JSDoc)**

**Mandatory first step:** Analyze the code and generate complete JSDocs for all functions, props, types, and hooks.

**Goal:** Understand **what** the code does before changing **how** it does it.

```typescript
/**
 * Custom hook to fetch data for a specific user.
 * Manages the loading, error, and user data states.
 *
 * @param userId The ID of the user to fetch.
 * @returns An object containing { user, loading, error }.
 */
export const useUserData = (userId: string) => {
    // ...
};
```

---

### **Step 2: Identify "Code Smells"**

After documenting, list the code smells based on our principles (Sections 1 and 4).

**Look for:**

#### **A. SRP Violations**

- Fetch logic, state, or business rules mixed with UI
- Components with more than 200 lines
- Multiple responsibilities (fetch + formatting + rendering)

#### **B. Prop Drilling**

- Props being passed through 3+ levels of components
- Solution: Context API or composition

#### **C. Complex State with Multiple `useState`**

- 4+ related `useState` hooks
- State with transition logic (e.g., loading → success → error)
- Solution: Migrate to `useReducer`

#### **D. Missing Typing**

- Use of `any` or implicit types
- Props without interface
- Solution: Add explicit types

#### **E. Performance**

- Functions/objects recreated on every render unnecessarily
- Non-virtualized lists with 100+ items
- Missing `React.memo` on list components

#### **F. Accessibility**

- Clickable `<div>` without `role` or `tabIndex`
- Inputs without associated `<label>`
- Images without `alt`

---

### **Step 3: Propose "Refactoring Plan"**

Based on the analysis, propose a clear plan.

**Plan Structure:**

```
# Refactoring Plan: [Component Name]

## Identified Code Smells:
1. [Problem description] (lines X-Y)
2. [Problem description] (lines A-B)

## Proposed Actions:

### 1. TypeScript Migration (if applicable)
- Add interfaces for props
- Replace `any` with specific types

### 2. Logic Extraction (SRP)
- **Create hook `useLogicName`**: Move fetch logic (lines X-Y) and state management (lines A-B) to a new custom hook.
- **Create service/util `serviceName`**: Extract business rules (lines M-N) to a pure function.

### 3. Pattern Application
- **Compound Components**: Refactor `<Modal>` to compound pattern (section 5.1)
- **Context Module**: Replace `theme` prop drilling with Context (section 5.2)

### 4. Performance Improvements
- Add `React.memo` to `<UserCard>` (rendered in list)
- Memoize `handleEdit` callback with `useCallback`

### 5. A11y Fixes
- Add `htmlFor` and `id` to forms
- Replace `<div onClick>` with `<button>`

## Impact Estimate:
- **Complexity**: Medium
- **Risk**: Low (if tests exist)
- **Benefit**: Maintainability +40%, Performance +15%
```

---

### **Step 4: Execution (See Section 10 - Example)**

Implement the changes following the plan. Always document the refactored code.

---

## 🎯 10. Central Example: Refactoring (Before and After)

This is the expected result of the process described in Section 9.

### ❌ **BEFORE (Problematic Code)**

```typescript
// UserProfile.tsx (BAD - Multiple responsibilities)
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Loader, Alert } from '@/components/common';

// ❌ No typing
export const UserProfile = ({ userId }: any) => {
  // ❌ State and fetch mixed with UI
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // ❌ Business logic in component
    const fetchUser = async () => {
      try {
        const response = await axios.get(`/api/users/${userId}`);
        setUser(response.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [userId]);

  // ❌ No accessibility
  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;
  if (!user) return null;

  return (
    <div>
      <h1>{user.name}</h1>
      <p>{user.email}</p>
    </div>
  );
};
```

---

### ✅ **AFTER (Refactored Code)**

#### **1. Types (types/user.ts)**

```typescript
/**
 * Represents a system user.
 */
export interface User {
    readonly id: string;
    readonly name: string;
    readonly email: string;
}
```

#### **1.5. Service Layer (services/userService.ts)**

```typescript
/**
 * Fetches a specific user's data.
 *
 * @param userId The user ID.
 * @returns Promise with the user data.
 * @throws {Error} If the request fails.
 */
export const fetchUserAsync = async (userId: string): Promise<User> => {
    const response = await axios.get(`/api/users/${userId}`);
    return response.data;
};
```

**Why?**

- Centralizes API logic
- Facilitates testing (mock the service, not axios)
- Reusable across multiple hooks

#### **2. Custom Hook (hooks/useUserData.ts)**

```typescript
import { useState, useEffect } from "react";
import axios from "axios";
import { User } from "@/types/user";

/**
 * Custom hook to fetch data for a specific user.
 * Manages the loading, error, and user data states.
 *
 * @param userId The ID of the user to fetch.
 * @returns An object containing { user, loading, error }.
 *
 * @example
 * const { user, loading, error } = useUserData('123');
 */
export const useUserData = (userId: string) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!userId) {
            setLoading(false);
            return;
        }

        /**
         * Async function to fetch user data.
         */
        const fetchUserDataAsync = async () => {
            setLoading(true);
            setError(null);

            try {
                const response = await axios.get<User>(`/api/users/${userId}`);
                setUser(response.data);
            } catch (err: unknown) {
                // Type narrowing to extract error message
                if (axios.isAxiosError(err)) {
                    setError(err.response?.data?.message || err.message);
                } else if (err instanceof Error) {
                    setError(err.message);
                } else {
                    setError("An unexpected error occurred");
                }
            } finally {
                setLoading(false);
            }
        };

        fetchUserDataAsync();
    }, [userId]);

    // The hook exposes a simple and consistent "contract"
    return { user, loading, error } as const;
};
```

#### **3. UI Component (components/UserProfile.tsx)**

```typescript
import React from 'react';
import { useUserData } from '@/hooks/useUserData';
import { Loader, Alert } from '@/components/common';

/**
 * Props for the UserProfile component.
 */
interface UserProfileProps {
  /** The ID of the user to display. */
  readonly userId: string;
}

/**
 * "Dumb" (presentational) UI component that displays user information.
 * Data fetching logic is delegated to the useUserData hook.
 *
 * This component focuses 100% on rendering and accessibility.
 */
export const UserProfile = ({ userId }: UserProfileProps) => {
  // Component delegates all logic to the hook
  const { user, loading, error } = useUserData(userId);

  // Loading and error states with accessibility
  if (loading) {
    return (
      <div role="status" aria-live="polite">
        <Loader />
        <span className="sr-only">Loading user data...</span>
      </div>
    );
  }

  if (error) {
    return (
      <Alert
        type="error"
        title="Error loading data"
        message={error}
        role="alert"
        aria-live="assertive"
      />
    );
  }

  if (!user) {
    return null;
  }

  // Semantic and accessible rendering
  return (
    <section aria-labelledby={`user-heading-${user.id}`}>
      <h1 id={`user-heading-${user.id}`}>{user.name}</h1>
      <p>
        <span className="sr-only">Email: </span>
        {user.email}
      </p>
    </section>
  );
};
```

---

## 📋 11. Quality Checklist (Use Before Committing)

When completing a refactoring or creating a new component, validate:

### **TypeScript**

- [ ] No use of `any`
- [ ] Props typed with `interface` and `readonly`
- [ ] Async functions have `Async` suffix

### **Architecture (SRP)**

- [ ] Business logic extracted to hooks/services?
- [ ] Component has less than 200 lines?
- [ ] Clear separation between container and presentational?

### **Performance**

- [ ] List components use `React.memo`?
- [ ] Callbacks use `useCallback`?
- [ ] Lists with 100+ items use virtualization?

### **Accessibility**

- [ ] Semantic HTML (`<button>`, `<nav>`, `<section>`)?
- [ ] Labels on inputs (`htmlFor` + `id`)?
- [ ] Images have `alt`?
- [ ] Error states have `role="alert"`?

### **Security**

- [ ] No hardcoded secrets?
- [ ] `dangerouslySetInnerHTML` sanitized?

### **Documentation**

- [ ] Functions/hooks have JSDoc?
- [ ] Public interfaces are documented?

---

## 🚀 12. Next Steps (Future Roadmap)

These practices will be added in future versions:

- **Tests**: Testing Library, MSW, coverage strategies
- **Error Boundaries**: Component-level error handling
- **Suspense**: Declarative loading states
- **Migrations**: Class Components → Hooks, if any legacy code

---

## 13. Commits and Versioning

### **Conventional Commits**

Use the standard for commit messages:

```
<type>(<scope>): <subject>

feat(auth): add login with Google
fix(user-profile): correct email validation
refactor(hooks): extract useFetchData from useUserData
docs(readme): update installation steps
style(button): adjust padding
test(user-service): add tests for edge cases
chore(deps): upgrade react to 18.3
```

**Types:**

- `feat`: New feature
- `fix`: Bug fix
- `refactor`: Code change without altering behavior
- `docs`: Documentation
- `style`: Formatting (doesn't affect logic)
- `test`: Adding/fixing tests
- `chore`: Maintenance (deps, configs)

---

## 📚 14. References and Recommended Reading

- [React Docs](https://react.dev)
- [Next.js Docs](https://nextjs.org/docs)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [Kent C. Dodds Blog](https://kentcdodds.com/blog) - Advanced React Patterns
- [Patterns.dev](https://www.patterns.dev/) - Modern Design Patterns
