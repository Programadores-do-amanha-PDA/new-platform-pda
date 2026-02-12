# Base Stack Provider

## Description

The `BaseStackProvider` is the foundational component that all role-specific providers (Admin, Student, Employer) extend from. It establishes the core infrastructure for authorization verification, data loading, sidebar configuration generation, and layout rendering.

**Purpose**: Provide a reusable, extensible foundation that handles common functionality shared by all role-specific providers, reducing code duplication and ensuring consistent behavior.

**Core Responsibilities**:

- Verifies user authentication and validates allowed roles
- Loads role-specific data on component mount
- Generates role-appropriate sidebar configuration
- Provides layout structure with AppBar and AppSidebar
- Shows no-access page for unauthorized users

## Signature

```typescript
interface BaseStackProviderProps {
    readonly children: React.ReactNode;
    readonly allowedRoles: Role[];
    readonly loadInitialData?: boolean;
    readonly onLoadData?: () => Promise<void>;
    readonly getFeaturesData?: () => { [key: string]: Map<string, string> };
    readonly classrooms?: ClassroomT[];
}

export const BaseStackProvider = (props: BaseStackProviderProps) => JSX.Element;
```

## Parameters

| Parameter         | Type                                           | Required | Default | Description                                               |
| ----------------- | ---------------------------------------------- | -------- | ------- | --------------------------------------------------------- |
| `children`        | `React.ReactNode`                              | Yes      | -       | React children to render within the main content area     |
| `allowedRoles`    | `Role[]`                                       | Yes      | -       | Array of Role types authorized to access this provider    |
| `loadInitialData` | `boolean`                                      | No       | `true`  | Whether to load initial role-specific data on mount       |
| `onLoadData`      | `() => Promise<void>`                          | No       | -       | Async function to load role-specific data from stores/API |
| `getFeaturesData` | `() => { [key: string]: Map<string, string> }` | No       | -       | Function returning feature-specific path label mappings   |
| `classrooms`      | `ClassroomT[]`                                 | No       | -       | Array of ClassroomT objects needed for sidebar config     |

## Return Value

Returns a JSX element containing:

- **AppSidebar**: Left navigation panel with role-specific menu
- **AppBar**: Top navigation bar with breadcrumb path labels
- **Main Content Area**: Where children components render
- **Page Loader**: Shown while data is loading (if loadInitialData=true)
- **No Access Page**: Shown if user role not in allowedRoles

## Layout Structure

```text
┌─────────────────────────────────────┐
│         AppBar (breadcrumbs)        │
├──────────────────┬──────────────────┤
│                  │                  │
│   AppSidebar     │   Children       │
│   (nav menu)     │   (content)      │
│                  │                  │
│                  │                  │
└──────────────────┴──────────────────┘
```

## Data Loading Flow

```typescript
1. Component mounts
   ↓
2. Check user authentication (useAuth)
   ↓
3. Validate user role in allowedRoles
   ↓
4. If authorized:
   - Load initial data via onLoadData() [if loadInitialData=true]
   - Generate sidebar config with createSidebarConfig()
   - Merge path labels with features data
   ↓
5. Render layout with AppSidebar + AppBar + Children
   ↓
6. If not authorized:
   - Show NoAccessPage
```

## Usage Examples

### Admin Provider Implementation

```typescript
import { BaseStackProvider } from "../shared/base-stack-provider";

export const AdminStackProvider = ({ children, loadInitialData = true }) => {
  const classroomStore = useClassroomStore();
  const usersStore = useUsersStore();
  const enrollmentsStore = useEnrollmentsManagementStore();

  const handleLoadData = async () => {
    await Promise.all([
      classroomStore.getAllClassroomsAsync(),
      usersStore.fetchAllUsersWithProfiles({}),
      enrollmentsStore.fetchAllEnrollments(),
    ]);
  };

  const getFeaturesData = () => ({
    classrooms: new Map(
      classroomStore.classrooms.map((c) => [c.id, c.name])
    ),
    enrollments: new Map(
      Object.values(enrollmentsStore.enrollmentsByUserId)
        .flat()
        .map((e) => [e.short_id, e.short_id])
    ),
  });

  return (
    <BaseStackProvider
      allowedRoles={["admin"]}
      loadInitialData={loadInitialData}
      onLoadData={handleLoadData}
      getFeaturesData={getFeaturesData}
      classrooms={classroomStore.classrooms}
    >
      {children}
    </BaseStackProvider>
  );
};
```

### Student Provider Implementation

```typescript
export const StudentStackProvider = ({ children, loadInitialData = true }) => {
  const usersStore = useUsersStore();
  const classroomStore = useClassroomStore();

  const handleLoadData = async () => {
    await usersStore.fetchAllUsersWithProfiles({});
  };

  const getFeaturesData = () => ({
    classrooms: new Map(
      classroomStore.classrooms.map((c) => [c.id, c.name])
    ),
  });

  return (
    <BaseStackProvider
      allowedRoles={["student"]}
      loadInitialData={loadInitialData}
      onLoadData={handleLoadData}
      getFeaturesData={getFeaturesData}
      classrooms={classroomStore.classrooms}
    >
      {children}
    </BaseStackProvider>
  );
};
```

### Usage in Page Component

```typescript
export default function Dashboard() {
  return (
    <div>
      <h1>Admin Dashboard</h1>
      <AdminContent />
    </div>
  );
}
```

## Important Notes

### Authorization Check

- **Role Validation**: Compares user's role against allowedRoles array
- **No-Access Fallback**: Shows NoAccessPage if user role not in allowed list
- **Full Screen**: No-access page fills entire viewport

### Data Loading Strategy

- **Optional**: Data loading is optional (controlled by loadInitialData prop)
- **Parallel Loading**: Use Promise.all() for multiple concurrent loads
- **Error Handling**: Logs errors to console if loading fails
- **Loading State**: Shows PageLoader while data is being fetched

### Sidebar Configuration

- **Factory Pattern**: Uses createSidebarConfig() to generate config
- **Role-Specific**: Each role gets different sidebar structure
- **Classroom Aware**: Classrooms parameter used by admin/student/teacher roles
- **Path Labels**: Merged with features data for breadcrumb navigation

### Context System

- **BaseStackContext**: Provides shared state to descendants (currently empty)
- **useBaseStackContext**: Hook for accessing base stack context
- **Extensible**: Context can be extended to share additional state

## Related Components

| Component                            | Purpose                                | Usage                             |
| ------------------------------------ | -------------------------------------- | --------------------------------- |
| `createSidebarConfig()`              | Generates role-specific sidebar config | Called internally for each render |
| `generatePathLabelsByFeaturesData()` | Merges path labels with feature labels | Called to prepare breadcrumb data |
| `useAuth()`                          | Gets current user and auth state       | Used for authorization check      |
| `AppSidebar`                         | Renders left navigation panel          | Passed sidebarData prop           |
| `AppBar`                             | Renders top navigation bar             | Passed pathLabels prop            |
| `PageLoader`                         | Shows loading spinner                  | Displayed during data loading     |
| `NoAccessPage`                       | Shows no-access UI                     | Displayed for unauthorized users  |

## Error Scenarios

### User Not Authenticated

```typescript
// Shown if useAuth() returns user: null
// Result: Full screen NoAccessPage displayed
```

### Role Not in Allowed Roles

```typescript
// Example: allowedRoles = ["admin"]
// User role = "student"
// Result: Full screen NoAccessPage displayed
```

### Data Loading Failure

```typescript
// If onLoadData() throws error
// Result: Error logged to console, PageLoader hidden, children rendered
// The error doesn't prevent rendering, just logs the issue
```

### Empty Features Data

```typescript
// If getFeaturesData() returns empty object
// Result: Uses only base pathLabels, no additional labels added
```

## Best Practices

1. **Always provide allowedRoles**: Array controls who can access this provider

    ```typescript
    allowedRoles={["admin", "class_manager"]} // Multiple roles OK
    ```

2. **Load data in parallel**: Use Promise.all() for concurrent loads

    ```typescript
    const handleLoadData = async () => {
        await Promise.all([store1.fetch(), store2.fetch(), store3.fetch()]);
    };
    ```

3. **Provide correct classrooms**: If role needs classrooms, provide them

    ```typescript
    classrooms={classroomStore.classrooms}
    ```

4. **Use getFeaturesData for custom labels**: Add role-specific path labels

    ```typescript
    const getFeaturesData = () => ({
        myFeature: new Map([
            ["/path/123", "Display Label"],
            ["/path/456", "Another Label"],
        ]),
    });
    ```

5. **Respect loadInitialData flag**: Allow skipping data load if pre-loaded

    ```typescript
    <BaseStackProvider loadInitialData={isFirstLoad} />
    ```

6. **Handle async operations carefully**: Ensure stores are ready

    ```typescript
    // Bad: onLoadData might run before stores initialized
    const handleLoadData = () => userStore.fetch();

    // Good: Ensure store exists and has fetch method
    const handleLoadData = async () => {
        if (userStore?.fetch) {
            await userStore.fetch();
        }
    };
    ```

## Architecture Diagram

```text
BaseStackProvider
│
├─ Props Validation
│  ├─ Check useAuth() for user
│  └─ Check allowedRoles
│
├─ Authorization Decision
│  ├─ If authorized → Continue
│  └─ If not authorized → Show NoAccessPage
│
├─ Data Loading (if loadInitialData=true)
│  ├─ Call onLoadData()
│  ├─ Update stores
│  └─ Show PageLoader
│
├─ Configuration Generation
│  ├─ Create sidebar config
│  ├─ Generate path labels
│  └─ Merge features data
│
└─ Render Layout
   ├─ AppSidebar
   ├─ AppBar
   └─ Children
```

## Performance Considerations

- **Lazy Loading**: Role providers are lazy-loaded by StackProvider
- **Data Caching**: Stores cache data, subsequent renders reuse cached data
- **Parallel Loading**: Multiple data sources loaded concurrently with Promise.all()
- **Sidebar Memoization**: Sidebar config cached after first generation
- **Conditional Rendering**: No-access path avoids rendering children entirely

## See Also

- [StackProvider](../index.md) - Main provider that uses BaseStackProvider
- [AdminStackProvider](../roles/admin.md) - Admin role extension
- [StudentStackProvider](../roles/student.md) - Student role extension
- [EmployerStackProvider](../roles/employer.md) - Employer role extension
- [sidebar-config-factory.ts](./sidebar-config-factory.md) - Sidebar configuration factory
- [generate-path-labels.ts](../utils/generate-path-labels.md) - Path label generation
