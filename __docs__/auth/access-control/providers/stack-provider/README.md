# Stack Provider System Documentation

## Overview

The **Stack Provider System** is a comprehensive role-based navigation and sidebar configuration system that provides lazy-loaded, role-specific data loading and interface customization for different user roles.

**Purpose**: Create isolated provider instances for different user roles (admin, student, employer, etc.) with role-appropriate data loading, sidebar configuration, and feature access control.

## 📚 Documentation Files

| File                                                                       | Purpose                                                                   |
| -------------------------------------------------------------------------- | ------------------------------------------------------------------------- |
| **[index.md](./index.md)**                                                 | Main StackProvider - entry point with lazy-loaded role-specific providers |
| **[shared/base-stack-provider.md](./shared/base-stack-provider.md)**       | Foundation provider extended by all role-specific providers               |
| **[shared/sidebar-config-factory.md](./shared/sidebar-config-factory.md)** | Factory pattern for generating role-specific sidebar configurations       |
| **[utils/generate-path-labels.md](./utils/generate-path-labels.md)**       | Merge base and feature-specific breadcrumb labels                         |
| **[roles/admin.md](./roles/admin.md)**                                     | Administrator provider with full system access                            |
| **[roles/student.md](./roles/student.md)**                                 | Student provider with learning-focused interface                          |
| **[roles/employer.md](./roles/employer.md)**                               | Employer provider with recruitment-focused interface                      |

## 🏗️ Architecture

```txt
StackProvider (Main Entry Point)
    ├── Lazy Loads Role-Based Providers
    │   ├── AdminStackProvider
    │   ├── StudentStackProvider
    │   └── EmployerStackProvider
    │
    └── Each Role Provider Extends BaseStackProvider
        ├── Data Loading via Zustand Stores
        ├── Features Data Generation
        └── Sidebar Configuration
```

## 🎯 Quick Start

### 1. Understanding the System

Start with [Main StackProvider](./index.md) to understand role resolution and lazy loading.

### 2. Implementation Details

Read [BaseStackProvider](./shared/base-stack-provider.md) to understand the foundation.

### 3. Configuration

Learn about [SidebarConfigFactory](./shared/sidebar-config-factory.md) for menu generation.

### 4. Role-Specific Features

- [Admin](./roles/admin.md) - Full system access with 6 data sources
- [Student](./roles/student.md) - Learning-focused with minimal data loading
- [Employer](./roles/employer.md) - Recruitment-focused interface

## 📋 Supported Roles

| Role            | Provider              | Focus                 | Data Load |
| --------------- | --------------------- | --------------------- | --------- |
| `admin`         | AdminStackProvider    | System Administration | Heavy     |
| `student`       | StudentStackProvider  | Learning & Courses    | Light     |
| `employer`      | EmployerStackProvider | Recruitment           | Light     |
| `class_manager` | AdminStackProvider    | Classroom Management  | Heavy     |
| `teacher`       | AdminStackProvider    | Teaching              | Heavy     |
| `alumni`        | StudentStackProvider  | Alumni Network        | Light     |
| `guest`         | StudentStackProvider  | Guest Access          | Light     |

## 🔄 Data Loading Flow

```txt
User Route
    ↓
StackProvider (role resolution)
    ↓
Lazy load role provider
    ↓
BaseStackProvider (initialization)
    ↓
useEffect (parallel data loading via Promise.all)
    ↓
Features data generation
    ↓
Sidebar configuration
    ↓
AppBar + Children rendered
```

## 💡 Key Features

✅ **Role-Based Access Control** - Automatic role resolution with lazy loading  
✅ **Parallel Data Loading** - Multiple stores loaded simultaneously  
✅ **Sidebar Configuration** - Dynamic menu generation via factory pattern  
✅ **Breadcrumb Navigation** - Smart label merging with precedence  
✅ **Performance Optimization** - Code splitting and feature-based loading

## 🚀 Usage Example

```typescript
// app/(protected)/layout.tsx
import { StackProvider } from "@/features/auth/access-control/providers/stack-provider";

export default function ProtectedLayout({ children }) {
  return (
    <StackProvider>
      {children}
    </StackProvider>
  );
}
```

## 📈 Performance

| Optimization | Technique                        |
| ------------ | -------------------------------- |
| Bundle Size  | React.lazy() for role providers  |
| Network Time | Promise.all() for parallel loads |
| Re-renders   | Zustand selectors                |
| Memory       | Minimal stores per role          |

## 🔗 Related Documentation

- [Auth System](../../) - Authentication system overview
- [Access Control](../) - Access control patterns
- [User Actions](../../actions/) - User-related server actions

## 📂 File Structure

```txt
stack-provider/
├── README.md (this file)
├── index.md
├── shared/
│   ├── base-stack-provider.md
│   └── sidebar-config-factory.md
├── utils/
│   └── generate-path-labels.md
└── roles/
    ├── admin.md
    ├── student.md
    └── employer.md
```

## ✨ Best Practices

1. **Always wrap routes** with StackProvider at protected layout level
2. **Use store selectors** to prevent unnecessary re-renders
3. **Don't over-fetch data** - load only what's needed per role
4. **Document role changes** - when adding/modifying roles
5. **Test role transitions** - ensure proper data loading per role

## 🔮 Extensibility

To add a new role:

1. Create `src/features/auth/access-control/providers/stack-provider/roles/[role]/provider.tsx`
2. Extend BaseStackProvider
3. Define getFeaturesData() with required stores
4. Update SIDEBAR_CONFIG_GENERATORS in sidebar-config-factory.ts
5. Add to STACK_PROVIDERS_BY_ROLE in index.tsx
6. Create documentation in `docs/auth/access-control/providers/stack-provider/roles/[role].md`

## 📞 Questions?

Refer to specific documentation file for detailed information on each component.

---

**Last Updated**: February 3, 2025  
**System Status**: ✅ Production Ready
