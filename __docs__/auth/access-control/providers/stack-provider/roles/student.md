# Student Stack Provider

## Description

The `StudentStackProvider` is a role-specific provider that extends `BaseStackProvider` with student-level data loading and feature initialization. It provides a learning-focused interface with access to classrooms, projects, assignments, and course materials restricted to the student's enrollments.

**Purpose**: Create a specialized provider that loads student-specific data and provides a learning-focused interface optimized for educational workflows.

**Key Features**:
- Access to enrolled classrooms and course materials
- View project assignments and submissions
- Complete assessments and coding challenges
- Join Zoom meetings for virtual classes
- Track learning progress and grades
- Collaborate with classmates

## Signature

```typescript
interface StudentStackProviderProps {
    readonly children: React.ReactNode;
    readonly loadInitialData?: boolean;
}

export const StudentStackProvider = (props: StudentStackProviderProps) => JSX.Element
```

## Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `children` | `React.ReactNode` | Yes | - | React children to render within student layout |
| `loadInitialData` | `boolean` | No | `true` | Whether to load initial student data on mount |

## Loaded Data

### Primary Data Sources

| Data | Store | Method | Purpose |
|------|-------|--------|---------|
| **Users** | `useUsersStore` | `fetchAllUsersWithProfiles({})` | Classmate profiles for collaboration |
| **Classrooms** | `useClassroomStore` | (auto-loaded) | Enrolled classrooms |
| **Projects** | `useClassroomProjectStore` | (auto-loaded) | Classroom assignments |
| **Assessments** | `useCoodeshAssessmentStore` | (auto-loaded) | Coding challenges |
| **Zoom Meetings** | `useZoomMeetingStore` | (auto-loaded) | Virtual class meetings |
| **Enrollments** | `useEnrollmentsManagementStore` | (auto-loaded) | Student's enrollment records |

### Data Loading Strategy

```
StudentStackProvider Mount
        ↓
useEffect Trigger
        ↓
Promise.all([
    usersStore.fetchAllUsersWithProfiles({})
])
        ↓
User profiles loaded
        ↓
Features data generated from stores
        ↓
Sidebar configured
        ↓
Render student interface
```

## Usage Examples

### Basic Integration

```typescript
import { StudentStackProvider } from "@/features/auth/access-control/providers/stack-provider";

export default function StudentDashboard() {
  return (
    <StudentStackProvider>
      <div className="p-6">
        <h1>My Classroom</h1>
        <ClassroomContent />
      </div>
    </StudentStackProvider>
  );
}
```

### Skipping Initial Data Load

```typescript
export default function StudentProfile() {
  return (
    <StudentStackProvider loadInitialData={false}>
      <ProfilePanel />
    </StudentStackProvider>
  );
}
```

### In Layout

```typescript
// app/(protected)/classroom/layout.tsx
export default function ClassroomLayout({ children }) {
  return (
    <StudentStackProvider>
      {children}
    </StudentStackProvider>
  );
}
```

## Sidebar Configuration

Student users get access to:
- **My Classrooms**: Enrolled courses and materials
- **My Projects**: Assignment list and status
- **My Assessments**: Coding challenges and submissions
- **My Zoom Meetings**: Virtual class calendar
- **My Progress**: Learning analytics
- **Profile**: Student profile and preferences

## Important Notes

### Authorization
- **Role Restriction**: Only users with 'student' role
- **Enrollment-Limited**: Only sees own classrooms
- **Privacy**: Cannot see other students' grades/assessments

### Data Loading
- **Minimal Load**: Only loads essential student data
- **Performance-Optimized**: Faster than admin provider
- **Per-Student Data**: Classroom/enrollment filtering server-side

### Sidebar Content
- **Filtered View**: Only shows student's enrolled classrooms
- **Personal Focus**: Dashboard shows only student's assignments
- **Progress Tracking**: Learning analytics and grades

## Generated Features Data

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

## Best Practices

1. **Use at dashboard level**: Wrap student dashboard pages
   ```typescript
   export default function Dashboard({ children }) {
     return <StudentStackProvider>{children}</StudentStackProvider>;
   }
   ```

2. **Leverage enrolled classrooms**: Access via store hook
   ```typescript
   const classrooms = useClassroomStore(s => s.classrooms);
   const projects = useClassroomProjectStore(s => s.projects);
   ```

3. **Handle loading gracefully**: Show skeleton while loading
   ```typescript
   // BaseStackProvider handles PageLoader
   // Ensure children show proper loading states
   ```

4. **Cache computed selections**: Memoize filtered data
   ```typescript
   const myProjects = useMemo(
       () => projects.filter(p => p.dueDate > today),
       [projects]
   );
   ```

## Error Scenarios

### Missing User Enrollment
```typescript
// Student has no classroom enrollments
// Result: Empty classroom list shown
```

### Classroom Not Assigned
```typescript
// Student tries to access unassigned classroom
// Result: Filtered from sidebar, shows no-access if direct link
```

## Performance Considerations

- **Minimal Data**: Students load less data than admins
- **Faster Load Time**: Optimized for learning experience
- **Memory Efficient**: No system-wide data
- **Re-render Optimization**: Use React.memo for student components

## Related Components

- [BaseStackProvider](../shared/base-stack-provider.md) - Parent provider
- [StackProvider](../index.md) - Lazy loads this provider
- [AdminStackProvider](./admin.md) - Admin version for comparison
- [EmployerStackProvider](./employer.md) - Employer version

## Accessing Student Data in Children

```typescript
function ClassroomView() {
  const classrooms = useClassroomStore(s => s.classrooms);
  const projects = useClassroomProjectStore(s => s.projects);
  const assessments = useCoodeshAssessmentStore(s => s.assessments);

  return (
    <div>
      <ClassroomSelector classrooms={classrooms} />
      <ProjectList projects={projects} />
      <AssessmentList assessments={assessments} />
    </div>
  );
}
```

## See Also

- [Stack Provider System Overview](../index.md)
- [Base Provider Documentation](../shared/base-stack-provider.md)
- [Admin Provider](./admin.md)
- [Employer Provider](./employer.md)
