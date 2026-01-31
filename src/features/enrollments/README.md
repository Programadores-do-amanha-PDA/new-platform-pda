# Enrollments Module

## Overview

The **Enrollments** domain centralizes everything related to the relationship between users and classrooms (`user_classrooms` table). It exposes:

- Typed server actions for CRUD operations.
- Two Zustand stores (one for admin/management flows and one for the authenticated user).
- Shared types that can be reused across features.

The module now lives in `src/features/enrollments`, matching the global domain-driven architecture.

## Core Concepts

### Enrollment Entity

```ts
export interface Enrollment {
    readonly user_id: string;
    readonly classroom_id: string;
    readonly short_id: string;
    readonly mode: string;
    readonly created_at?: string;
}
```

- **`short_id`** – Unique identifier for the link between a user and a classroom.
- **`mode`** – Enrollment mode (defined by classroom configuration, e.g., `async`, `sync`).

## Module Structure

```text
enrollments/
├── README.md
├── actions.ts
├── index.ts
├── types.ts
└── stores/
    ├── enrollments-management.ts   # Admin/management store (records indexed by userId)
    └── user-enrollments.ts         # Logged user store (simple array)
```

`index.ts` re-exports every action, store hook, and type so consumers can simply import from `@/features/enrollments`.

## API Reference

### Server Actions (`actions.ts`)

All operations interact with Supabase through server actions and follow the project logging standards:

| Action | Description |
| --- | --- |
| `getAllEnrollments()` | Fetches every enrollment ordered by `created_at DESC`. |
| `getEnrollmentsByClassroomId({ classroom_id })` | Lists enrollments for a specific classroom. |
| `getEnrollmentsByUserId({ userId })` | Lists enrollments for a specific user. |
| `createEnrollments({ enrollments })` | Bulk creates enrollments. |
| `updateEnrollment({ classroomId, shortId, updates })` | Updates a specific enrollment. |
| `removeEnrollments({ userId, classroomIds })` | Removes a user from multiple classrooms. |

Every function returns `null`/`false` on failure so UI layers can surface toast notifications consistently.

### Zustand Stores

#### `useEnrollmentsManagementStore`

Admin-only store that keeps enrollments indexed by `userId` for `O(1)` lookup when managing classroom memberships.

```ts
interface EnrollmentsManagementState {
    readonly enrollmentsByUserId: Record<string, Enrollment[]>;
    readonly loading: boolean;
}

interface EnrollmentsManagementActions {
    fetchAllEnrollments: () => Promise<boolean>;
    fetchEnrollmentsByClassroomId: (classroomId: string) => Promise<boolean>;
    fetchEnrollmentsByUserId: (userId: string) => Promise<boolean>;
    setEnrollmentsByUserId: (params: { readonly enrollmentsByUserId: Record<string, Enrollment[]> }) => void;
    getEnrollmentsByClassroom: (classroomId: string) => Enrollment[];
    createNewEnrollments: (params: { readonly enrollments: readonly Omit<Enrollment, "short_id" | "mode" | "created_at">[] }) => Promise<boolean>;
    updateEnrollmentByShortIdAndUserId: (params: {
        readonly shortId: string;
        readonly userId: string;
        readonly updates: Partial<Omit<Enrollment, "short_id" | "created_at" | "user_id" | "classroom_id">>;
    }) => Promise<boolean>;
    removeEnrollmentsByUserAndClassrooms: (params: { readonly userId: string; readonly classroomIds: readonly string[] }) => Promise<boolean>;
    reset: () => void;
}
```

The implementation (see `stores/enrollments-management.ts`) batches updates, logs errors via `logger`, and emits toast notifications using `sonner`.

#### `useUserEnrollmentsStore`

Lightweight client-side store for the authenticated user to keep their own enrollments cached.

```ts
interface UserEnrollmentsState {
    readonly enrollments: Enrollment[];
    readonly loading: boolean;
}

interface UserEnrollmentsActions {
    setEnrollments: (enrollments: Enrollment[]) => void;
    reset: () => void;
}
```

## Usage Examples

### Fetching all enrollments (admin)

```tsx
import { useEffect } from "react";
import { useEnrollmentsManagementStore } from "@/features/enrollments";

export function EnrollmentsDashboard() {
    const { fetchAllEnrollments, enrollmentsByUserId, loading } = useEnrollmentsManagementStore();

    useEffect(() => {
        void fetchAllEnrollments();
    }, [fetchAllEnrollments]);

    if (loading) return <p>Loading enrollments...</p>;

    return (
        <div>
            {Object.entries(enrollmentsByUserId).map(([userId, enrollments]) => (
                <section key={userId}>
                    <h3>User {userId}</h3>
                    {enrollments.map((enrollment) => (
                        <p key={enrollment.short_id}>{enrollment.classroom_id}</p>
                    ))}
                </section>
            ))}
        </div>
    );
}
```

### Updating a user mode inside a classroom

```tsx
import { useEnrollmentsManagementStore } from "@/features/enrollments";

const { updateEnrollmentByShortIdAndUserId } = useEnrollmentsManagementStore();

const handleModeChange = async (userId: string, shortId: string, mode: string) => {
    await updateEnrollmentByShortIdAndUserId({
        shortId,
        userId,
        updates: { mode },
    });
};
```

### Removing a user from multiple classrooms

```tsx
await removeEnrollmentsByUserAndClassrooms({
    userId,
    classroomIds: ["classroom-a", "classroom-b"],
});
```

### Setting enrollments for the authenticated user

```tsx
import { useUserEnrollmentsStore } from "@/features/enrollments";

const { enrollments, setEnrollments } = useUserEnrollmentsStore();

setEnrollments(await getEnrollmentsByUserId({ userId }));
```

## Architecture Notes

- **SRP** – Server mutations live in `actions.ts`, while stateful UI concerns stay inside Zustand stores.
- **Error handling** – Every async action logs via `logger` and communicates status through `toast` notifications.
- **Performance** – Storing enrollments indexed by `userId` enables constant-time lookups when managing many classrooms.

## Key Files

- [actions.ts](actions.ts)
- [types.ts](types.ts)
- [stores/enrollments-management.ts](stores/enrollments-management.ts)
- [stores/user-enrollments.ts](stores/user-enrollments.ts)
