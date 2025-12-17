# Enrollments Module

## Overview

The **Enrollments** module manages the relationship between users and classrooms (the `user_classrooms` table). It provides state management, server actions, and utilities for creating, updating, and removing user enrollments in classrooms.

## Core Concepts

### What is an Enrollment?

An **Enrollment** represents a link between a user and a classroom. It tracks:

```typescript
interface Enrollment {
    user_id: string; // The user being enrolled
    classroom_id: string; // The classroom they're enrolled in
    short_id: string; // Unique short identifier for the enrollment record
    user_mode: string; // User enrollment mode/type (classroom_configs -> user_modes) (e.g., "async", "sync")
    created_at?: string; // Timestamp of enrollment creation
}
```

- **`short_id`**: A unique identifier assigned to each enrollment record, used to identify and update specific enrollments.
- **`user_mode`**: User enrollment mode/type from classroom_configs user_modes (e.g., "async", "sync").

## Module Structure

```text
enrollments/
├── README.md           # Documentation (this file)
├── types.ts            # Type definitions (Enrollment interface)
├── store.ts            # Zustand store for state management
├── actions.ts          # Server actions for database operations with Supabase
└── index.ts            # Public exports
```

## API Reference

### Store (`useEnrollmentsStore`)

A Zustand store that manages enrollment state globally using a Map structure where classrooms are keys and enrollment arrays are values.

- The store is responsible for:
    - Storing enrollments grouped by classroom ID
    - Providing enrollments actions:
        - populate (state);
        - create;
        - update;
        - remove.
    - Handling loading states;
    - User notifications for success/error messages.

#### State

```typescript
interface EnrollmentsState {
    enrollments: Map<string, Enrollment[]>; // Enrollments grouped by classroom ID
    loading: boolean; // Loading state indicator
}
```

#### Actions

##### `fetchAllEnrollments`

Fetches all enrollments from the database and updates the store, grouping them by classroom.

```typescript
fetchAllEnrollments() => Promise<boolean>
```

- Returns `true` if successful, `false` otherwise.
- Automatically populates the store with all enrollments grouped by classroom ID.

##### `fetchEnrollmentsByClassroomId`

Fetches enrollments for a specific classroom and updates the store.

```typescript
fetchEnrollmentsByClassroomId(classroomId: string) => Promise<boolean>
```

- Returns `true` if successful, `false` otherwise.
- Updates the store with enrollments for the specified classroom.

##### `fetchEnrollmentsByUserId`

Fetches all enrollments for a specific user and updates the store, grouping them by classroom.

```typescript
fetchEnrollmentsByUserId(userId: string) => Promise<boolean>
```

- Returns `true` if successful, `false` otherwise.
- Automatically populates the store with the user's enrollments grouped by classroom ID.

##### `setEnrollmentsByClassroom`

Sets enrollments (state) for a specific classroom.

```typescript
setEnrollmentsByClassroom({
  classroomId: string;
  enrollments: Enrollment[];
}) => void
```

- This should be used to populate the state after fetching enrollments.

##### `createNewEnrollments`

Creates new enrollments (one or more) in the database and updates the store.

```typescript
createNewEnrollments({
  enrollments: readonly Omit<Enrollment, "short_id" | "mode" | "created_at">[];
}) => Promise<boolean>
```

##### `updateEnrollmentByShortIdAndClassroomId`

Updates an existing enrollment's properties (e.g., mode).

```typescript
updateEnrollmentByShortIdAndClassroomId({
  shortId: string;
  classroomId: string;
  updates: Partial<Omit<Enrollment, "short_id" | "created_at" | "user_id" | "classroom_id">>;
}) => Promise<boolean>
```

- This provides a more specific and safe updates, using the `short_id` and `classroom_id`.

##### `removeEnrollmentsByUserAndClassrooms`

Removes a user's enrollments from specified classrooms.

```typescript
removeEnrollmentsByUserAndClassrooms({
  userId: string;
  classroomIds: readonly string[];
}) => Promise<boolean>
```

##### `reset`

Clears all enrollments from the store.

```typescript
reset() => void
```

### Server Actions (`actions.ts`)

Server-side functions that interact with the Supabase database.

- **`getAllEnrollments()`** - Fetches all enrollments
- **`getEnrollmentsByClassroomId(classroom_id)`** - Fetches enrollments for a specific classroom
- **`getEnrollmentsByUserId(userId)`** - Fetches enrollments for a specific user
- **`createEnrollments(enrollments)`** - Creates new enrollments in the database
- **`updateEnrollment(classroomId, shortId, updates)`** - Updates an enrollment record
- **`removeEnrollments(userId, classroomIds)`** - Removes a user from classrooms

## Usage Examples

### Fetch all enrollments

```typescript
import { useEnrollmentsStore } from '@/features/dashboard/shared/enrollments/store';

const AllEnrollments = () => {
  const { fetchAllEnrollments, enrollments } = useEnrollmentsStore();

  useEffect(() => {
    fetchAllEnrollments();
  }, [fetchAllEnrollments]);

  return (
    <div>
      {Array.from(enrollments.entries()).map(([classroomId, enrollments]) => (
        <div key={classroomId}>
          <h3>Classroom: {classroomId}</h3>
          {enrollments.map((enrollment) => (
            <p key={enrollment.short_id}>User: {enrollment.user_id}</p>
          ))}
        </div>
      ))}
    </div>
  );
};
```

### Fetch enrollments for a specific classroom

```typescript
import { useEnrollmentsStore } from '@/features/dashboard/shared/enrollments/store';
import { useEffect } from 'react';

const EnrollmentsList = ({ classroomId }: { classroomId: string }) => {
  const { fetchEnrollmentsByClassroomId, enrollments } = useEnrollmentsStore();

  useEffect(() => {
    fetchEnrollmentsByClassroomId(classroomId);
  }, [classroomId, fetchEnrollmentsByClassroomId]);

  const classroomEnrollments = enrollments.get(classroomId) || [];

  return (
    <div>
      {classroomEnrollments.map((enrollment) => (
        <div key={enrollment.short_id}>
          User {enrollment.user_id} - Mode: {enrollment.mode}
        </div>
      ))}
    </div>
  );
};
```

### Fetch enrollments for a specific user

```typescript
import { useEnrollmentsStore } from '@/features/dashboard/shared/enrollments/store';
import { useEffect } from 'react';

const UserEnrollments = ({ userId }: { userId: string }) => {
  const { fetchEnrollmentsByUserId, enrollments } = useEnrollmentsStore();

  useEffect(() => {
    fetchEnrollmentsByUserId(userId);
  }, [userId, fetchEnrollmentsByUserId]);

  // Get all classrooms where the user is enrolled
  const userClassrooms = Array.from(enrollments.entries())
    .filter(([_, classEnrollments]) =>
      classEnrollments.some((e) => e.user_id === userId)
    )
    .map(([classroomId, _]) => classroomId);

  return (
    <div>
      <h3>User enrollments in {userClassrooms.length} classrooms</h3>
      {userClassrooms.map((classroomId) => (
        <p key={classroomId}>Classroom: {classroomId}</p>
      ))}
    </div>
  );
};
```

### Fetch and display enrollments for a classroom

```typescript
import { useEnrollmentsStore } from '@/features/dashboard/shared/enrollments/store';

const EnrollmentsList = ({ classroomId }: { classroomId: string }) => {
  const enrollments = useEnrollmentsStore((state) =>
    state.enrollments.get(classroomId) || []
  );

  return (
    <div>
      {enrollments.map((enrollment) => (
        <div key={enrollment.short_id}>
          User {enrollment.user_id} - Mode: {enrollment.mode}
        </div>
      ))}
    </div>
  );
};
```

### Create new enrollments

```typescript
const { createNewEnrollments } = useEnrollmentsStore();

const handleAddUsers = async (userIds: string[], classroomId: string) => {
    const newEnrollments = userIds.map((userId) => ({
        user_id: userId,
        classroom_id: classroomId,
    }));

    const success = await createNewEnrollments({ enrollments: newEnrollments });
    if (success) {
        console.log("Users enrolled successfully!");
    }
};
```

### Update enrollment mode

```typescript
const { updateEnrollmentByShortIdAndClassroomId } = useEnrollmentsStore();

const handlePromoteToTeacher = async (shortId: string, classroomId: string) => {
    const success = await updateEnrollmentByShortIdAndClassroomId({
        shortId,
        classroomId,
        updates: { mode: "teacher" },
    });
};
```

### Remove user enrollments

```typescript
const { removeEnrollmentsByUserAndClassrooms } = useEnrollmentsStore();

const handleRemoveUserFromClassrooms = async (userId: string, classroomIds: string[]) => {
    const success = await removeEnrollmentsByUserAndClassrooms({
        userId,
        classroomIds,
    });
};
```

## Architecture Notes

### State Management Pattern

This module follows the **SRP (Single Responsibility Principle)** by:

- Keeping state management in Zustand store
- Separating database operations in server actions
- Providing a clean, typed API for components

### Error Handling

All store actions include:

- Try-catch blocks for error handling
- Toast notifications (success/error messages)
- Console logging for debugging
- Boolean return values indicating success/failure

### Performance Considerations

- Enrollments are grouped by `classroom_id` for efficient lookup
- Updates target specific enrollments by `short_id` to minimize re-renders
- Map structure avoids unnecessary array searches

## Key Files

- **[types.ts](types.ts)** - Enrollment interface definition
- **[store.ts](store.ts)** - Zustand store with all actions
- **[actions.ts](actions.ts)** - Server-side database operations
- **[index.ts](index.ts)** - Public exports
