# Stack Provider - Main Component

## Description

The `StackProvider` is the unified entry point for the application's role-based navigation and sidebar system. This component orchestrates authentication, authorization, and role-specific UI rendering with lazy loading for optimal performance.

**Purpose**: Consolidate user authentication, role resolution, and dynamic provider selection for a performant and maintainable role-based UI architecture.

**Key Capabilities**:

- Lazy loads role-specific providers (code splitting) for improved performance
- Handles loading states during authentication and user profile fetching
- Provides fallback UI for unauthorized or unknown roles
- Manages sidebar and navigation configuration based on user role
- Resolves user role from both auth context and zustand store for reliability

## Signature

```typescript
interface StackProviderProps {
    readonly children: ReactNode;
}

export const StackProvider = ({ children }: StackProviderProps) => JSX.Element;
```

## Parameters

| Parameter  | Type              | Required | Description                                                         |
| ---------- | ----------------- | -------- | ------------------------------------------------------------------- |
| `children` | `React.ReactNode` | Yes      | React children components to render within the role-specific layout |

## Return Value

Returns a JSX element containing:

- **Sidebar Component** (AppSidebar): Left navigation with role-specific menu items
- **App Bar** (AppBar): Top navigation with breadcrumb path labels
- **Main Content Area**: Where children components are rendered
- **Page Loader**: Shown during role provider loading
- **No Access Page**: Shown for unauthorized roles

## Architecture & Design Pattern

### Lazy Loading Pattern

```typescript
const STACK_PROVIDERS_BY_ROLE = {
    admin: lazy(() => import("...AdminStackProvider")),
    employer: lazy(() => import("...EmployerStackProvider")),
    student: lazy(() => import("...StudentStackProvider")),
};
```

Each role-specific provider is code-split and loaded only when needed, reducing initial bundle size.

### Role Resolution Flow

```txt
1. User Authentication Check
   ↓
2. Get User Role from Store
   ↓
3. Select Role-Specific Provider
   ↓
4. Lazy Load Provider Component
   ↓
5. Load Role-Specific Data
   ↓
6. Render Complete Stack Layout
```

### Supported Roles

| Role                  | Provider                | Features                                  | Data Loaded                                                 |
| --------------------- | ----------------------- | ----------------------------------------- | ----------------------------------------------------------- |
| **admin**             | `AdminStackProvider`    | Full system access, management dashboards | Classrooms, Projects, Assessments, Zoom, Users, Enrollments |
| **student**           | `StudentStackProvider`  | Classroom-focused learning interface      | Classrooms, Projects, Assessments, Zoom, Enrollments        |
| **employer**          | `EmployerStackProvider` | Job posting and recruitment interface     | Users (candidates)                                          |
| **unknown/no-access** | Fallback                | Limited no-access page                    | None                                                        |

## Usage Examples

### Basic Integration

```typescript
// In your root layout or app wrapper
import { StackProvider } from "@/features/auth/access-control/providers/stack-provider";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <Providers>
      <StackProvider>
        {children}
      </StackProvider>
    </Providers>
  );
}
```

### With Children Components

```typescript
// In your dashboard page
export default function Dashboard() {
  return (
    <StackProvider>
      <div className="p-6">
        <h1>Welcome to Dashboard</h1>
        <DashboardContent />
      </div>
    </StackProvider>
  );
}
```

### Custom Layout Inside StackProvider

```typescript
// StackProvider handles sidebar/appbar, you focus on content
export default function AdminDashboard() {
  return (
    <StackProvider>
      <div className="space-y-4">
        <WelcomeCard />
        <StatisticsGrid />
        <ManagementPanel />
      </div>
    </StackProvider>
  );
}
```

## Important Notes

### Authentication Requirement

- **Must have valid user**: StackProvider requires `useAuth()` to return a valid user
- **Must have valid role**: User role must be retrievable from `useUserRoleStore`
- **No access handling**: Shows no-access page if user lacks recognized role

### Loading States

- **Page Loader**: Displayed while role-specific provider is being loaded
- **Provider Loading**: BaseStackProvider shows loader while data is fetching
- **Nested Suspense**: Multiple Suspense boundaries handle different loading phases

### Performance Optimizations

- **Code Splitting**: Role providers lazy-loaded only when needed
- **Parallel Loading**: Admin provider loads all data in parallel for speed
- **Sidebar Caching**: Sidebar config cached after first generation
- **Path Labels**: Path labels merged with features data for efficient breadcrumbs

### State Management

- **useAuth**: Provides current user and authentication status
- **useUserRoleStore**: Stores user role after authentication
- **useUserProfileStore**: Stores user profile information
- **Role-Specific Stores**: Each provider initializes role-specific Zustand stores

## Related Files

- [BaseStackProvider](./shared/base-stack-provider.md) - Foundation component for all role-specific providers
- [AdminStackProvider](./roles/admin.md) - Admin-specific provider implementation
- [StudentStackProvider](./roles/student.md) - Student-specific provider implementation
- [EmployerStackProvider](./roles/employer.md) - Employer-specific provider implementation
- [sidebar-config-factory.ts](./shared/sidebar-config-factory.md) - Factory for role-based sidebar config
- [generate-path-labels.ts](./utils/generate-path-labels.md) - Utility for merging path labels

## Error Scenarios

### No User Authenticated

```typescript
// Shows no-access page
// useAuth() returns { user: null }
```

### Unknown Role

```typescript
// Shows no-access page with warning logged
const unknownRole = "superadmin"; // Not in STACK_PROVIDERS_BY_ROLE
```

### Provider Loading Failure

```typescript
// Shows PageLoader during loading, then renders children
// If provider fails to load, error boundary should catch it
```

## Best Practices

1. **Always wrap at root level**: Place StackProvider near root of application for global access

2. **Inside providers tree**: Ensure authentication and store providers wrap StackProvider

    ```typescript
    <Providers>  {/* Auth, Store providers */}
      <StackProvider>
        <App />
      </StackProvider>
    </Providers>
    ```

3. **Don't duplicate**: Use StackProvider once, not on individual pages

4. **Handle auth state**: Wait for auth to initialize before rendering StackProvider

5. **Lazy import page components**: Let StackProvider's lazy loading handle role providers

6. **Use role-specific features**: Leverage the data loaded by each role provider

## Architecture Diagram

```txt
StackProvider
├── useAuth() [Get current user]
├── useUserRoleStore() [Get user role]
│
├── STACK_PROVIDERS_BY_ROLE [Select provider]
│   ├── admin → lazy(AdminStackProvider)
│   ├── student → lazy(StudentStackProvider)
│   ├── employer → lazy(EmployerStackProvider)
│   └── unknown → no-access page
│
├── Suspense [Loading state]
│   ├── PageLoader [While loading]
│   └── SelectedProvider
│       ├── BaseStackProvider
│       │   ├── Load role-specific data
│       │   ├── Create sidebar config
│       │   ├── Generate path labels
│       │   │
│       │   └── Render Layout
│       │       ├── AppSidebar [Left nav]
│       │       ├── AppBar [Top nav]
│       │       └── Children [Main content]
│       │
│       └── Role-Specific Features
│           ├── Admin: Classrooms, Projects, Assessments, Zoom, Users, Enrollments
│           ├── Student: Classrooms, Projects, Assessments, Zoom, Enrollments
│           └── Employer: Users (Candidates)
```

## See Also

- [Role-Based Access Control Documentation](../../../access-control.md)
- [Authentication Guide](../../store.md)
- [BaseStackProvider Documentation](./shared/base-stack-provider.md)
- [Sidebar Configuration Factory](./shared/sidebar-config-factory.md)
- [Role-Specific Providers](./roles/)
