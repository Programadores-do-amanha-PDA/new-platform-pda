# Sidebar Configuration Factory

## Description

The `sidebar-config-factory` module provides factory functions for generating role-specific sidebar configurations. It implements the factory design pattern to create different navigation structures based on user roles, eliminating code duplication and making role-based UI configuration maintainable.

**Purpose**: Centralize the logic for creating role-appropriate sidebar navigation structures with proper abstraction and separation of concerns.

**Key Capabilities**:

- Factory pattern for generating sidebar configs per role
- Support for 7 different roles with distinct navigation structures
- Fallback to guest config for unknown roles
- Utility function to determine if roles require classroom data
- Type-safe configuration generation

## Signature

```typescript
// Type for sidebar config generator functions
interface SidebarConfigGenerator {
    (userProfile: Profile, classrooms?: ClassroomT[]): SidebarDataT;
}

// Factory function to create sidebar config
export const createSidebarConfig = (
    userProfile: Profile,
    userRole: Role,
    classrooms?: ClassroomT[]
): SidebarDataT;

// Utility function to check if role needs classrooms
export const roleRequiresClassrooms = (role: Role): boolean;
```

## Exports

### 1. `createSidebarConfig()`

Main factory function that creates sidebar configuration.

```typescript
createSidebarConfig(
    userProfile: Profile,
    userRole: Role,
    classrooms?: ClassroomT[]
): SidebarDataT
```

**Parameters:**

| Parameter     | Type           | Required | Description                                           |
| ------------- | -------------- | -------- | ----------------------------------------------------- |
| `userProfile` | `Profile`      | Yes      | User profile with identification and metadata         |
| `userRole`    | `Role`         | Yes      | User's role ('admin', 'student', 'employer', etc.)    |
| `classrooms`  | `ClassroomT[]` | No       | Array of classroom objects (for roles that need them) |

**Returns:** Complete `SidebarDataT` configuration ready for rendering

### 2. `roleRequiresClassrooms()`

Utility function to determine if a role needs classroom data.

```typescript
roleRequiresClassrooms(role: Role): boolean
```

**Parameters:**

| Parameter | Type   | Required | Description        |
| --------- | ------ | -------- | ------------------ |
| `role`    | `Role` | Yes      | User role to check |

**Returns:** `true` if role requires classroom data, `false` otherwise

## Role-Specific Behavior

| Role              | Generator                | Requires Classrooms | Features                   | Navigation                           |
| ----------------- | ------------------------ | ------------------- | -------------------------- | ------------------------------------ |
| **admin**         | `generateAdminConfig`    | Yes                 | Full management access     | All features + Management dashboards |
| **class_manager** | Custom                   | Yes                 | Student journey management | Student journey focused              |
| **employer**      | `generateEmployerConfig` | No                  | Job posting & recruitment  | Recruitment focused                  |
| **teacher**       | Custom                   | Yes                 | Classroom facilitation     | Classroom management                 |
| **student**       | `generateStudentConfig`  | Yes                 | Learning & coursework      | Classroom-focused learning           |
| **alumni**        | Custom                   | No                  | Historical access          | Alumni limited features              |
| **guest**         | Custom                   | No                  | No access                  | Minimal configuration                |

## Usage Examples

### Basic Usage

```typescript
import { createSidebarConfig, roleRequiresClassrooms } from "./sidebar-config-factory";

// For admin role
const adminSidebar = createSidebarConfig(userProfile, "admin", classrooms);

// For employer role (no classrooms needed)
const employerSidebar = createSidebarConfig(userProfile, "employer");

// Check if role needs classrooms
if (roleRequiresClassrooms(userRole)) {
    const classrooms = await fetchUserClassrooms();
    const config = createSidebarConfig(userProfile, userRole, classrooms);
} else {
    const config = createSidebarConfig(userProfile, userRole);
}
```

### In BaseStackProvider

```typescript
const BaseStackProvider = ({
    role,
    profile,
    children
}) => {
    // Generate sidebar configuration based on role
    const sidebarData = createSidebarConfig(profile, role, classrooms);

    // Use configuration in rendering
    return (
        <>
            <AppSidebar data={sidebarData} />
            {/* ... rest of layout ... */}
        </>
    );
};
```

### In Role Providers

```typescript
const AdminStackProvider = ({ children }) => {
    const classroomStore = useClassroomStore();
    const handleLoadData = async () => {
        await classroomStore.getAllClassrooms();
    };

    const getFeaturesData = () => ({
        classrooms: new Map(
            classroomStore.classrooms.map(c => [c.id, c.name])
        ),
    });

    return (
        <BaseStackProvider
            allowedRoles={["admin"]}
            onLoadData={handleLoadData}
            getFeaturesData={getFeaturesData}
            classrooms={classroomStore.classrooms}
        >
            {children}
        </BaseStackProvider>
    );
};
```

## Internal Structure

### Sidebar Config Generator Interface

All role-specific generators follow this interface:

```typescript
interface SidebarConfigGenerator {
    (userProfile: Profile, classrooms?: ClassroomT[]): SidebarDataT;
}
```

### Generator Mapping

```typescript
const SIDEBAR_CONFIG_GENERATORS: Record<Role, SidebarConfigGenerator> = {
    admin: (userProfile, classrooms) => generateAdminConfig(userProfile, classrooms || []),
    class_manager: (userProfile) => ({
        userProfile,
        team: { name: "Jornada de Estudantes", logo: () => null },
        navMain: [],
        projects: [],
    }),
    employer: (userProfile) => generateEmployerConfig(userProfile),
    teacher: (userProfile) => ({
        userProfile,
        team: { name: "Facilitador", logo: () => null },
        navMain: [],
        projects: [],
    }),
    student: (userProfile, classrooms) => generateStudentConfig(userProfile, classrooms || []),
    alumni: (userProfile) => ({
        userProfile,
        team: { name: "Alumni", logo: () => null },
        navMain: [],
        projects: [],
    }),
    guest: () => ({
        userProfile: {} as Profile,
        team: { name: "Guest", logo: () => null },
        navMain: [],
        projects: [],
    }),
};
```

## Important Notes

### Role Resolution

- **Type Safety**: `Role` type ensures only valid roles are passed
- **Exhaustive Mapping**: All valid roles have generator functions
- **Fallback Handling**: Unknown roles fall back to guest config with warning

### Classroom Optimization

- **Conditional Loading**: Only pass classrooms for roles that need them
- **Memory Efficiency**: Avoids passing unused data structures
- **Performance**: Use `roleRequiresClassrooms()` to optimize data fetching

### Configuration Generation

- **Normalization**: All generators return same `SidebarDataT` structure
- **Consistency**: Generated configs are predictable and testable
- **Extensibility**: Easy to add new roles without modifying existing code

### Error Handling

- **Unknown Roles**: Logs warning and returns guest configuration
- **No Exceptions**: Gracefully handles unexpected inputs
- **Fallback Behavior**: Always returns valid configuration

## Related Functions

### Role-Specific Generators

- **`generateAdminConfig()`**: Creates admin navigation with full feature access
- **`generateEmployerConfig()`**: Creates employer/recruiter navigation
- **`generateStudentConfig()`**: Creates student learning navigation

These functions are imported from role-specific modules:

- `@/features/auth/access-control/providers/stack-provider/roles/admin/sidebar-config`
- `@/features/auth/access-control/providers/stack-provider/roles/employer/sidebar-config`
- `@/features/auth/access-control/providers/stack-provider/roles/student/sidebar-config`

## Design Pattern: Factory

This module implements the **Factory Design Pattern** for several benefits:

1. **Encapsulation**: Role-specific logic is hidden behind factory interface
2. **Maintainability**: Adding new roles requires minimal changes
3. **Testability**: Each generator can be tested independently
4. **Type Safety**: TypeScript ensures correct usage
5. **Consistency**: All outputs follow same interface

```text
┌──────────────────────┐
│ createSidebarConfig  │ ← Entry point
└──────────────────────┘
           │
           ↓
┌──────────────────────────┐
│ SIDEBAR_CONFIG_GENERATORS │ ← Role mapping
└──────────────────────────┘
           │
      ┌────┼────┬────┬────┬────┐
      ↓    ↓    ↓    ↓    ↓    ↓
    admin  class_mgr  employer  teacher  student  alumni  guest
```

## Best Practices

1. **Use roleRequiresClassrooms() for optimization**

    ```typescript
    // Good: Avoid unnecessary data loading
    if (roleRequiresClassrooms(userRole)) {
        const classrooms = await fetchClassrooms();
        const config = createSidebarConfig(profile, userRole, classrooms);
    } else {
        const config = createSidebarConfig(profile, userRole);
    }
    ```

2. **Always pass valid Role type**

    ```typescript
    // Good: Type-safe
    const config = createSidebarConfig(profile, userRole as Role);

    // Bad: Loses type safety
    const config = createSidebarConfig(profile, userRole as any);
    ```

3. **Handle fallback cases**

    ```typescript
    // The factory handles this, but be aware:
    // If userRole is "unknown_role", config will be guest config
    // A warning is logged to console
    ```

4. **Cache configurations when possible**

    ```typescript
    // In role provider
    const sidebarConfig = useMemo(() => createSidebarConfig(profile, role, classrooms), [profile, role, classrooms]);
    ```

5. **Test role-specific generators**

    ```typescript
    describe("Sidebar Config Factory", () => {
        it("creates admin config with classrooms", () => {
            const config = createSidebarConfig(profile, "admin", classrooms);
            expect(config.navMain).toBeDefined();
        });

        it("creates employer config without classrooms", () => {
            const config = createSidebarConfig(profile, "employer");
            expect(config.userProfile).toBeDefined();
        });
    });
    ```

## Error Scenarios

### Unknown Role

```typescript
const config = createSidebarConfig(profile, "superadmin" as Role);
// Result: Logs warning, returns guest config
// Console: "No sidebar config generator found for role: superadmin"
```

### Missing Classrooms for Role That Needs Them

```typescript
const config = createSidebarConfig(profile, "admin"); // No classrooms
// Result: Uses empty array [], config generated but may be incomplete
```

### Null/Undefined Profile

```typescript
const config = createSidebarConfig(null, "admin", classrooms);
// Result: May cause error in generator, depends on implementation
// Better: Validate profile before calling
```

## Performance Considerations

- **Memoization**: Result can be memoized if inputs don't change frequently
- **Lazy Loading**: Role providers are lazy-loaded by StackProvider
- **Parallel Generation**: Sidebar config generated in parallel with data loading
- **No Heavy Computation**: Factory focuses on structure, not data transformation

## Extensibility

### Adding a New Role

1. **Add generator function**:

    ```typescript
    const generateNewRoleConfig = (profile, classrooms?) => ({...});
    ```

2. **Add to mapping**:

    ```typescript
    const SIDEBAR_CONFIG_GENERATORS = {
        // ... existing roles
        new_role: (profile, classrooms) => generateNewRoleConfig(profile, classrooms),
    };
    ```

3. **Update roleRequiresClassrooms if needed**:

    ```typescript
    export const roleRequiresClassrooms = (role: Role): boolean => {
        return ["admin", "student", "teacher", "class_manager", "new_role"].includes(role);
    };
    ```

## See Also

- [BaseStackProvider](./base-stack-provider.md) - Uses this factory for config generation
- [StackProvider](../index.md) - Main provider that orchestrates everything
- [AdminStackProvider](../roles/admin.md) - Admin role example
- [StudentStackProvider](../roles/student.md) - Student role example
- [EmployerStackProvider](../roles/employer.md) - Employer role example
