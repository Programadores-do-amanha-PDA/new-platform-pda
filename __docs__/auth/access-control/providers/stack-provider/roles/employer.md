# Employer Stack Provider

## Description

The `EmployerStackProvider` is a role-specific provider that extends `BaseStackProvider` with employer-level data loading and feature initialization. It provides a recruitment-focused interface with job posting, candidate management, and hiring workflow features.

**Purpose**: Create a specialized provider that loads employer-specific data and provides a simplified recruitment interface.

**Key Features**:

- Create and manage job postings
- Review candidate applications
- Track hiring pipeline and workflow
- Candidate profile browsing and filtering
- Resume review and screening
- Communication with candidates

## Signature

```typescript
interface EmployerStackProviderProps {
    readonly children: React.ReactNode;
    readonly loadInitialData?: boolean;
}

export const EmployerStackProvider = (props: EmployerStackProviderProps) => JSX.Element;
```

## Parameters

| Parameter         | Type              | Required | Default | Description                                     |
| ----------------- | ----------------- | -------- | ------- | ----------------------------------------------- |
| `children`        | `React.ReactNode` | Yes      | -       | React children to render within employer layout |
| `loadInitialData` | `boolean`         | No       | `true`  | Whether to load initial employer data on mount  |

## Loaded Data

### Primary Data Sources

| Data      | Store           | Method                          | Purpose            |
| --------- | --------------- | ------------------------------- | ------------------ |
| **Users** | `useUsersStore` | `fetchAllUsersWithProfiles({})` | Candidate profiles |

### Data Loading Strategy

```txt
EmployerStackProvider Mount
        ↓
useEffect Trigger
        ↓
Promise.all([
    usersStore.fetchAllUsersWithProfiles({})
])
        ↓
User profiles loaded
        ↓
Features data generated
        ↓
Sidebar configured
        ↓
Render employer interface
```

## Usage Examples

### Basic Integration

```typescript
import { EmployerStackProvider } from "@/features/auth/access-control/providers/stack-provider";

export default function EmployerDashboard() {
  return (
    <EmployerStackProvider>
      <div className="p-6">
        <h1>Recruitment Dashboard</h1>
        <RecruitmentContent />
      </div>
    </EmployerStackProvider>
  );
}
```

### Skipping Initial Data Load

```typescript
export default function JobPostingForm() {
  return (
    <EmployerStackProvider loadInitialData={false}>
      <PostingForm />
    </EmployerStackProvider>
  );
}
```

### In Layout

```typescript
// app/(protected)/recruiting/layout.tsx
export default function RecruitingLayout({ children }) {
  return (
    <EmployerStackProvider>
      {children}
    </EmployerStackProvider>
  );
}
```

## Sidebar Configuration

Employer users get access to:

- **Jobs Management**: Post and manage job listings
- **Applications**: Review candidate applications
- **Candidates**: Browse candidate profiles
- **Analytics**: Recruiting metrics and reporting
- **Profile**: Company profile and settings
- **Team**: Team member management

## Important Notes

### Authorization

- **Role Restriction**: Only users with 'employer' role
- **No Fallback**: Non-employer users see no-access page
- **Recruitment Focus**: Interface optimized for hiring

### Data Loading

- **Minimal Load**: Only loads user profiles
- **Performance**: Fast loading for recruitment workflows
- **Extensible**: Can be extended with job/application stores

### Sidebar Content

- **Recruitment-Focused**: All features related to hiring
- **Candidate-Centric**: Easy candidate discovery
- **Analytics**: Tracking hiring metrics

## Generated Features Data

```typescript
{
    // Currently empty - can be extended with:
    // jobs, applications, candidates, etc.
}
```

## Best Practices

1. **Use at recruiting level**: Wrap recruitment pages

    ```typescript
    export default function RecruitingDashboard({ children }) {
      return <EmployerStackProvider>{children}</EmployerStackProvider>;
    }
    ```

2. **Extend with job data**: Add job/application stores

    ```typescript
    const getFeaturesData = () => ({
        jobs: new Map(jobStore.jobs.map((j) => [j.id, j.title])),
    });
    ```

3. **Handle minimal loading**: User profiles only by default

    ```typescript
    // Additional recruitment data loads on-demand
    ```

## Performance Considerations

- **Lightweight**: Minimal data loading
- **Scalable**: Easy to add new data sources
- **Fast Init**: Quick startup for recruitment interface
- **Extensible**: Foundation for future features

## Related Components

- [BaseStackProvider](../shared/base-stack-provider.md) - Parent provider
- [StackProvider](../index.md) - Lazy loads this provider
- [AdminStackProvider](./admin.md) - Admin version for comparison
- [StudentStackProvider](./student.md) - Student version

## Accessing Employer Data in Children

```typescript
function CandidateList() {
  const users = useUsersStore(s => s.users);

  return (
    <div>
      <CandidateSelector candidates={users} />
    </div>
  );
}
```

## Future Extensions

The employer provider can be extended with:

```typescript
// Add job management store
const jobStore = useJobStore();

// Add application tracking store
const applicationStore = useApplicationStore();

// Add recruiting analytics store
const analyticsStore = useRecruitingAnalyticsStore();

// Update getFeaturesData
const getFeaturesData = () => ({
    jobs: new Map(jobStore.jobs.map((j) => [j.id, j.title])),
    applications: new Map(applicationStore.applications.map((a) => [a.id, a.title])),
});
```

## See Also

- [Stack Provider System Overview](../index.md)
- [Base Provider Documentation](../shared/base-stack-provider.md)
- [Admin Provider](./admin.md)
- [Student Provider](./student.md)
