# Generate Path Labels Utility

## Description

The `generatePathLabelsByFeaturesData` utility function merges base path labels with feature-specific path labels into a unified configuration. It's used to maintain a consistent breadcrumb and navigation labeling system while allowing features to contribute their own custom path labels.

**Purpose**: Consolidate path-to-label mappings from multiple sources (base labels + feature-specific labels) into a single authoritative label mapping for breadcrumb navigation.

**Key Capabilities**:

- Merges multiple label sources into single configuration
- Preserves precedence (feature labels override base labels)
- Handles empty or missing feature data gracefully
- Returns type-safe Record<string, string>

## Signature

```typescript
type GeneratePathLabelsByFeaturesDataProps = {
    readonly pathLabels: Record<string, string>;
    readonly featuresData: { [key: string]: Map<string, string> };
};

export const generatePathLabelsByFeaturesData = (
    props: GeneratePathLabelsByFeaturesDataProps
): Record<string, string>
```

## Parameters

| Parameter      | Type                                     | Required | Description                                                  |
| -------------- | ---------------------------------------- | -------- | ------------------------------------------------------------ |
| `pathLabels`   | `Record<string, string>`                 | Yes      | Base path-to-label mappings for standard routes              |
| `featuresData` | `{ [key: string]: Map<string, string> }` | Yes      | Feature-specific labels organized by feature with Map values |

## Return Value

Returns a merged `Record<string, string>` containing:

- All base pathLabels entries
- All flattened feature label entries
- Feature labels take precedence if same path exists in both

## Data Flow Diagram

```ts
pathLabels:
{
    '/dashboard': 'Dashboard',
    '/profile': 'Profile',
    '/classrooms': 'Classrooms'
}
        +
featuresData:
{
    'classrooms': Map([
        ['/classrooms/123', 'Math 101'],
        ['/classrooms/456', 'Physics 102']
    ]),
    'projects': Map([
        ['/projects/789', 'AI Agent Project']
    ])
}
        =
Result:
{
    '/dashboard': 'Dashboard',
    '/profile': 'Profile',
    '/classrooms': 'Classrooms',
    '/classrooms/123': 'Math 101',
    '/classrooms/456': 'Physics 102',
    '/projects/789': 'AI Agent Project'
}
```

## Usage Examples

### Basic Usage

```typescript
import { generatePathLabelsByFeaturesData } from "@/features/auth/access-control/providers/stack-provider/utils";

const baseLabels = {
    "/dashboard": "Dashboard",
    "/profile": "Profile",
    "/classrooms": "Classrooms",
};

const classroomsFeatureData = new Map([
    ["/classrooms/123", "Math 101"],
    ["/classrooms/456", "Physics 102"],
]);

const projectsFeatureData = new Map([["/projects/789", "AI Agent Project"]]);

const mergedLabels = generatePathLabelsByFeaturesData({
    pathLabels: baseLabels,
    featuresData: {
        classrooms: classroomsFeatureData,
        projects: projectsFeatureData,
    },
});

console.log(mergedLabels);
// {
//   '/dashboard': 'Dashboard',
//   '/profile': 'Profile',
//   '/classrooms': 'Classrooms',
//   '/classrooms/123': 'Math 101',
//   '/classrooms/456': 'Physics 102',
//   '/projects/789': 'AI Agent Project'
// }
```

### In BaseStackProvider

```typescript
const BaseStackProvider = ({
    children,
    allowedRoles,
    getFeaturesData,
    ...props
}) => {
    // Create sidebar configuration
    const sidebarData = createSidebarConfig(...);

    // Merge path labels with features data
    const pathLabelsWithFeatures = getFeaturesData
        ? generatePathLabelsByFeaturesData({
            pathLabels,
            featuresData: getFeaturesData(),
          })
        : pathLabels;

    return (
        <>
            <AppSidebar data={sidebarData} />
            <div>
                <AppBar pathLabels={pathLabelsWithFeatures} />
                {children}
            </div>
        </>
    );
};
```

### Admin Provider Usage

```typescript
const AdminStackProvider = ({ children, loadInitialData = true }) => {
    const classroomStore = useClassroomStore();
    const projectStore = useClassroomProjectStore();
    const enrollmentsStore = useEnrollmentsManagementStore();

    const getFeaturesData = () => ({
        classrooms: new Map(
            classroomStore.classrooms.map((classroom) => [
                classroom.id,
                classroom.name
            ])
        ),
        projects: new Map(
            projectStore.projects.map((project) => [
                project.id,
                project.title
            ])
        ),
        enrollments: new Map(
            Object.values(enrollmentsStore.enrollmentsByUserId)
                .flat()
                .map((enrollment) => [
                    enrollment.short_id,
                    enrollment.short_id
                ])
        ),
    });

    return (
        <BaseStackProvider
            allowedRoles={["admin"]}
            loadInitialData={loadInitialData}
            getFeaturesData={getFeaturesData}
            // ... other props
        >
            {children}
        </BaseStackProvider>
    );
};
```

### In AppBar Component

```typescript
function AppBar({ pathLabels }) {
    const currentPath = usePathname();

    // Get label for current path
    const label = pathLabels[currentPath];

    return (
        <header>
            <Breadcrumb>
                <BreadcrumbList>
                    {/* Breadcrumb items generated from pathLabels */}
                    <BreadcrumbItem>{label || currentPath}</BreadcrumbItem>
                </BreadcrumbList>
            </Breadcrumb>
        </header>
    );
}
```

## Important Notes

### Label Precedence

Feature labels take precedence over base labels when the same path exists:

```typescript
const baseLabels = {
    "/projects": "Projects", // Base label
};

const featuresData = {
    projects: new Map([
        ["/projects", "My Projects"], // Feature label overrides
    ]),
};

const result = generatePathLabelsByFeaturesData({
    pathLabels: baseLabels,
    featuresData,
});

console.log(result["/projects"]); // 'My Projects' (feature label wins)
```

### Empty Features Data

Handles empty or missing feature data gracefully:

```typescript
// Empty features data
const result1 = generatePathLabelsByFeaturesData({
    pathLabels: { "/dashboard": "Dashboard" },
    featuresData: {},
});
// Returns: { '/dashboard': 'Dashboard' }

// No features
const result2 = generatePathLabelsByFeaturesData({
    pathLabels: { "/dashboard": "Dashboard" },
    featuresData: { classrooms: new Map() },
});
// Returns: { '/dashboard': 'Dashboard' }
```

### Immutability

The function doesn't mutate input parameters:

```typescript
const baseLabels = { "/dashboard": "Dashboard" };
const featuresData = { classrooms: new Map() };

const result = generatePathLabelsByFeaturesData({
    pathLabels: baseLabels,
    featuresData,
});

// Original objects remain unchanged
console.log(baseLabels); // { '/dashboard': 'Dashboard' }
console.log(featuresData); // { classrooms: Map() }
```

## Merge Algorithm

```typescript
1. Start with base pathLabels
2. For each feature in featuresData:
   a. Get the Map of labels for that feature
   b. For each entry in the Map:
      - Add key-value pair to result object
      - If key already exists, feature label overwrites it
3. Return merged result
```

Implementation detail:

```typescript
const featuresDataLabels: Record<string, string> = {};

// Flatten all feature labels
if (Object.keys(featuresData).length > 0) {
    Object.keys(featuresData).forEach((key) => {
        featuresData[key].forEach((value, key) => {
            featuresDataLabels[key] = value;
        });
    });
}

// Merge with base labels
return {
    ...pathLabels, // Base labels
    ...featuresDataLabels, // Feature labels (overwrite if duplicate)
};
```

## Data Structure Examples

### Classroom Feature Example

```typescript
// Admin has classrooms
const adminFeaturesData = {
    classrooms: new Map([
        ["/classrooms/room-1", "Mathematics 101"],
        ["/classrooms/room-2", "Physics 102"],
        ["/classrooms/room-3", "Chemistry 101"],
    ]),
};
```

### Project Feature Example

```typescript
// Admin has projects
const projectFeaturesData = {
    projects: new Map([
        ["/projects/proj-1", "AI Chat Bot"],
        ["/projects/proj-2", "Data Analysis Pipeline"],
        ["/projects/proj-3", "Mobile App"],
    ]),
};
```

### Combined Features

```typescript
// Admin with multiple features
const adminFeaturesData = {
    classrooms: new Map([
        ["/classrooms/room-1", "Math 101"],
        ["/classrooms/room-2", "Physics 102"],
    ]),
    projects: new Map([["/projects/proj-1", "AI Chat Bot"]]),
    assessments: new Map([["/assessments/assess-1", "Quiz 1"]]),
};
```

## Best Practices

1. **Generate feature data lazily**: Don't generate if not needed

    ```typescript
    // Good: Only generate if function provided
    const labels = getFeaturesData
        ? generatePathLabelsByFeaturesData({...})
        : pathLabels;
    ```

2. **Use meaningful path keys**: Make paths and labels clear

    ```typescript
    // Good
    new Map([
        ["/classrooms/123", "Mathematics 101"],
        ["/projects/456", "AI Chat Bot"],
    ]);

    // Bad
    new Map([
        ["c123", "name1"],
        ["p456", "name2"],
    ]);
    ```

3. **Keep feature data organized**: Group by feature

    ```typescript
    // Good: Clear feature grouping
    {
        classrooms: classroomMap,
        projects: projectMap,
        assessments: assessmentMap
    }

    // Bad: Mixed labels
    {
        classroom1Map,
        classroom2Map,
        projectMap
    }
    ```

4. **Cache merged labels in state**: If features data doesn't change often

    ```typescript
    const mergedLabels = useMemo(() =>
        generatePathLabelsByFeaturesData({...}),
        [pathLabels, featuresData]
    );
    ```

5. **Update feature data when content changes**: Sync labels with actual content

    ```typescript
    useEffect(() => {
        // When classrooms change, update feature data
        if (classroomStore.classrooms) {
            setFeaturesData({
                classrooms: new Map(classroomStore.classrooms.map((c) => [c.id, c.name])),
            });
        }
    }, [classroomStore.classrooms]);
    ```

## Error Scenarios

### Duplicate Paths (Feature Overwrites Base)

```typescript
const baseLabels = {
    "/classrooms": "All Classrooms",
};

const featuresData = {
    classrooms: new Map([
        ["/classrooms", "My Classrooms"], // Same path!
    ]),
};

const result = generatePathLabelsByFeaturesData({
    pathLabels: baseLabels,
    featuresData,
});

console.log(result["/classrooms"]); // 'My Classrooms' (overwritten)
```

### Empty Path

```typescript
const result = generatePathLabelsByFeaturesData({
    pathLabels: { "": "Home" },
    featuresData: { nav: new Map([["", "Main"]]) },
});

console.log(result[""]); // 'Main' (feature label wins)
```

### Null or Undefined Values

```typescript
// Null label values (may cause issues)
const featuresData = {
    classrooms: new Map([
        ["/class/123", null], // Problematic!
    ]),
};
```

## Performance Considerations

- **Time Complexity**: O(n) where n = total number of labels
- **Space Complexity**: O(m) where m = total number of merged entries
- **Memoization**: Result can be memoized if inputs change infrequently
- **Lazy Execution**: Function called only when features data provided

## Testing Examples

```typescript
describe("generatePathLabelsByFeaturesData", () => {
    it("merges base labels with feature labels", () => {
        const result = generatePathLabelsByFeaturesData({
            pathLabels: { "/dashboard": "Dashboard" },
            featuresData: {
                classrooms: new Map([["/classes", "Classes"]]),
            },
        });

        expect(result).toEqual({
            "/dashboard": "Dashboard",
            "/classes": "Classes",
        });
    });

    it("gives feature labels precedence over base labels", () => {
        const result = generatePathLabelsByFeaturesData({
            pathLabels: { "/classes": "All Classes" },
            featuresData: {
                classrooms: new Map([["/classes", "My Classes"]]),
            },
        });

        expect(result["/classes"]).toBe("My Classes");
    });

    it("handles empty features data", () => {
        const result = generatePathLabelsByFeaturesData({
            pathLabels: { "/dashboard": "Dashboard" },
            featuresData: {},
        });

        expect(result).toEqual({ "/dashboard": "Dashboard" });
    });

    it("handles multiple features", () => {
        const result = generatePathLabelsByFeaturesData({
            pathLabels: { "/home": "Home" },
            featuresData: {
                classrooms: new Map([["/classes", "Classes"]]),
                projects: new Map([["/projects", "Projects"]]),
            },
        });

        expect(result).toHaveProperty("/home");
        expect(result).toHaveProperty("/classes");
        expect(result).toHaveProperty("/projects");
    });
});
```

## See Also

- [BaseStackProvider](../shared/base-stack-provider.md) - Uses this utility for label generation
- [sidebar-config-factory.ts](../shared/sidebar-config-factory.md) - Related configuration utility
- [StackProvider](../index.md) - Top-level provider using merged labels
- [AppBar Component] - Consumes the merged path labels for breadcrumb rendering
