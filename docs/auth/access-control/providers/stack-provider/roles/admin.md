# Admin Stack Provider

## Description

The `AdminStackProvider` is a role-specific provider that extends `BaseStackProvider` with admin-level data loading and feature initialization. It provides comprehensive access to system-wide data and management capabilities.

**Purpose**: Create a specialized provider that loads all admin-related data in parallel and provides the complete management interface for system administrators.

**Key Features**:

- Loads all system classrooms with full details
- Fetches all users with complete profiles
- Manages all student enrollments across the system
- Provides project and assessment oversight
- Integrates Zoom meeting functionality
- Full data visibility for comprehensive analytics

## Signature

```typescript
interface AdminStackProviderProps {
    readonly children: React.ReactNode;
    readonly loadInitialData?: boolean;
}

export const AdminStackProvider = (props: AdminStackProviderProps) => JSX.Element;
```

## Parameters

| Parameter         | Type              | Required | Default | Description                                  |
| ----------------- | ----------------- | -------- | ------- | -------------------------------------------- |
| `children`        | `React.ReactNode` | Yes      | -       | React children to render within admin layout |
| `loadInitialData` | `boolean`         | No       | `true`  | Whether to load all admin data on mount      |

## Loaded Data

### Primary Data Sources

| Data              | Store                           | Method                          | Purpose                       |
| ----------------- | ------------------------------- | ------------------------------- | ----------------------------- |
| **Classrooms**    | `useClassroomStore`             | `getAllClassrooms()`            | Classroom list and management |
| **Users**         | `useUsersStore`                 | `fetchAllUsersWithProfiles({})` | User profiles and management  |
| **Enrollments**   | `useEnrollmentsManagementStore` | `fetchAllEnrollments()`         | Student enrollments tracking  |
| **Projects**      | `useClassroomProjectStore`      | (auto-loaded)                   | Classroom projects            |
| **Assessments**   | `useCoodeshAssessmentStore`     | (auto-loaded)                   | Coodesh assessments           |
| **Zoom Meetings** | `useZoomMeetingStore`           | (auto-loaded)                   | Virtual meeting data          |

### Data Loading Strategy

```txt
AdminStackProvider Mount
        ↓
useEffect Trigger
        ↓
Promise.all([
    classroomStore.getAllClassrooms(),
    usersStore.fetchAllUsersWithProfiles({}),
    enrollmentsStore.fetchAllEnrollments()
])
        ↓
All data loaded in parallel
        ↓
Features data generated
        ↓
Sidebar configured
        ↓
Render admin interface
```

## Usage Examples

### Basic Integration

```typescript
import { AdminStackProvider } from "@/features/auth/access-control/providers/stack-provider";

export default function AdminDashboard() {
  return (
    <AdminStackProvider>
      <div className="p-6">
        <h1>Admin Dashboard</h1>
        <DashboardContent />
      </div>
    </AdminStackProvider>
  );
}
```

### Skipping Initial Data Load

```typescript
// If data is pre-loaded elsewhere
export default function AdminSettings() {
  return (
    <AdminStackProvider loadInitialData={false}>
      <SettingsPanel />
    </AdminStackProvider>
  );
}
```

### Inside Page Route

```typescript
// app/(protected)/dashboard/layout.tsx
export default function DashboardLayout({ children }) {
  return (
    <AdminStackProvider>
      {children}
    </AdminStackProvider>
  );
}
```

## Generated Features Data

The provider generates path labels from all loaded data:

```typescript
{
    classrooms: new Map([
        [classroomId, classroomName],
        ...
    ]),
    projects: new Map([
        [projectId, projectTitle],
        ...
    ]),
    coodeshAssessments: new Map([
        [assessmentId, assessmentName],
        ...
    ]),
    zoomMeetings: new Map([
        [meetingId, meetingTopic],
        ...
    ]),
    enrollments: new Map([
        [enrollmentId, enrollmentId],
        ...
    ])
}
```

These are used for breadcrumb navigation and path label generation.

## Sidebar Configuration

Admin users get access to:

- **Classroom Management**: View and manage all classrooms
- **User Management**: User profiles, roles, and permissions
- **Enrollment Tracking**: View all student enrollments
- **Project Management**: Oversee classroom projects
- **Assessment Management**: Review Coodesh assessments
- **Zoom Integration**: Manage virtual meetings
- **System Analytics**: Access to system-wide data
- **Admin Settings**: System configuration options

## Important Notes

### Authorization

- **Role Restriction**: Only users with 'admin' role can access this provider
- **No Fallback**: Non-admin users see no-access page
- **Full Access**: Admins have complete data visibility

### Data Loading

- **Parallel Execution**: All data loads concurrently using Promise.all()
- **Initial Load Only**: Data loads once on component mount
- **Error Logging**: Errors logged to console if loading fails
- **No Blocking**: Rendering continues even if loading fails

### Performance

- **Large Data Sets**: May load significant amounts of data
- **Caching**: Zustand stores cache data for subsequent renders
- **Memoization**: Consider memoizing generated features data
- **Lazy Children**: Children components lazy-loaded by StackProvider

### Features Data

- **Breadcrumb Support**: Used for breadcrumb path labels
- **Dynamic Generation**: Regenerated each render from store data
- **Extensible**: Easy to add new features data sources

## Stores Used

### 1. useClassroomStore

```typescript
const classroomStore = useClassroomStore();
await classroomStore.getAllClassrooms(); // Fetch all classrooms
const classrooms = classroomStore.classrooms; // Access loaded data
```

### 2. useUsersStore

```typescript
const usersStore = useUsersStore();
await usersStore.fetchAllUsersWithProfiles({}); // Fetch all users
const users = usersStore.users; // Access loaded data
```

### 3. useEnrollmentsManagementStore

```typescript
const enrollmentsStore = useEnrollmentsManagementStore();
await enrollmentsStore.fetchAllEnrollments(); // Fetch enrollments
const enrollments = enrollmentsStore.enrollmentsByUserId; // Access by user
```

### 4. useClassroomProjectStore

```typescript
const projectStore = useClassroomProjectStore();
// Data auto-loaded when needed
const projects = projectStore.projects;
```

### 5. useCoodeshAssessmentStore

```typescript
const coodeshStore = useCoodeshAssessmentStore();
// Data auto-loaded when needed
const assessments = coodeshStore.assessments;
```

### 6. useZoomMeetingStore

```typescript
const zoomStore = useZoomMeetingStore();
// Data auto-loaded when needed
const meetings = zoomStore.meetings;
```

## Error Scenarios

### Data Loading Failure

```typescript
// If any store.fetch() throws error
// Result: Error logged, PageLoader hidden, children rendered
// Data remains from previous state or empty
```

### Store Not Initialized

```typescript
// If store returns null/undefined
// Result: Default empty data, no crash
```

### Empty Data Sets

```typescript
// If classrooms/users/enrollments are empty
// Result: Valid config with empty Maps
```

## Best Practices

1. **Use at layout level**: Place at route layout for consistent admin experience

    ```typescript
    // app/(protected)/dashboard/layout.tsx
    export default function DashboardLayout({ children }) {
      return <AdminStackProvider>{children}</AdminStackProvider>;
    }
    ```

2. **Wrap once**: Don't nest multiple AdminStackProviders

    ```typescript
    // ✅ Good: Single provider
    <AdminStackProvider>
      <AdminPage />
    </AdminStackProvider>

    // ❌ Bad: Nested providers
    <AdminStackProvider>
      <ChildComponent>
        <AdminStackProvider>...</AdminStackProvider>
      </ChildComponent>
    </AdminStackProvider>
    ```

3. **Handle loading state**: Show loader while data loads

    ```typescript
    // Already handled by BaseStackProvider
    // But ensure children handle loading state if needed
    ```

4. **Use generated features data**: Leverage breadcrumb labels

    ```typescript
    // AppBar receives merged labels automatically
    // Breadcrumbs show classroom/project names
    ```

5. **Memoize computed values**: In children components

    ```typescript
    const adminStats = useMemo(() => calculateStats(classrooms, users, enrollments), [classrooms, users, enrollments]);
    ```

## Architecture Diagram

```txt
AdminStackProvider
│
├─ Extract Zustand Stores
│  ├─ classroomStore
│  ├─ projectStore
│  ├─ coodeshAssessmentStore
│  ├─ zoomMeetingStore
│  ├─ usersStore
│  └─ enrollmentsStore
│
├─ Define Data Loading
│  └─ handleLoadData() → Promise.all([...])
│
├─ Define Features Data Generator
│  └─ getFeaturesData() → {classrooms, projects, assessments, ...}
│
└─ Render BaseStackProvider
   ├─ allowedRoles: ["admin"]
   ├─ loadInitialData: true (default)
   ├─ onLoadData: handleLoadData
   ├─ getFeaturesData: getFeaturesData
   └─ classrooms: classroomStore.classrooms
      │
      └─ BaseStackProvider
         ├─ Auth check
         ├─ Load data
         ├─ Create sidebar
         ├─ Merge labels
         └─ Render layout
            ├─ AppSidebar (admin menu)
            ├─ AppBar (breadcrumbs)
            └─ Children (admin content)
```

## Data Flow Diagram

```txt
adminStore.classrooms ─┐
usersStore.users ──────┼─→ getFeaturesData() ─→ Feature Maps
assessmentStore.data ──┤
zoomStore.meetings ────┤
enrollmentsStore.data ─┘
                           ↓
                    pathLabels (base)
                           ↓
                    generatePathLabelsByFeaturesData()
                           ↓
                    Merged Labels for AppBar
                           ↓
                    Breadcrumb Navigation
```

## Performance Considerations

- **Parallel Loading**: All data sources load concurrently
- **Total Load Time**: Limited by slowest request
- **Memory**: All data kept in Zustand stores
- **Re-renders**: Children re-render when store data changes
- **Optimization**: Use React.memo for admin components

## Related Components

- [BaseStackProvider](../shared/base-stack-provider.md) - Parent provider
- [StackProvider](../index.md) - Lazy loads this provider
- [StudentStackProvider](./student.md) - Similar provider for students
- [EmployerStackProvider](./employer.md) - Similar provider for employers
- [sidebar-config-factory](../shared/sidebar-config-factory.md) - Sidebar config generation

## Accessing Admin Stores in Children

All loaded stores are available via hooks in child components:

```typescript
function AdminDashboard() {
  // All data is already loaded
  const classrooms = useClassroomStore(s => s.classrooms);
  const users = useUsersStore(s => s.users);
  const enrollments = useEnrollmentsManagementStore(
    s => s.enrollmentsByUserId
  );

  return (
    <div>
      <ClassroomList classrooms={classrooms} />
      <UsersList users={users} />
      <EnrollmentsList enrollments={enrollments} />
    </div>
  );
}
```

## See Also

- [Role-Based Access Control Guide](../../access-control.md)
- [Authentication Documentation](../../store.md)
- [Stack Provider System Overview](../index.md)
- [Base Provider Documentation](../shared/base-stack-provider.md)
