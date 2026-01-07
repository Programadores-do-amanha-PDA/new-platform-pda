# Classroom Projects Feature

## Overview

The Classroom Projects feature manages project assignments, deliveries, and corrections within the PDA platform. It provides a comprehensive system for teachers to create and manage projects, and for students to submit their work and receive feedback.

## Architecture

### Directory Structure

```
src/features/dashboard/classroom-projects/
├── components/           # React components
│   ├── deliveries/      # Delivery-related components
│   ├── project-card.tsx # Main project display component
│   ├── project-delivery-modal.tsx
│   ├── project-dialog.tsx
│   ├── project-module-select.tsx
│   └── project-type-select.tsx
├── pages/               # Page components
│   ├── all-projects-page.tsx
│   └── project-page.tsx
├── stores/              # Zustand state management
│   ├── corrections.ts   # Project corrections store
│   ├── deliveries.ts    # Project deliveries store
│   └── index.tsx        # Store exports
├── types/               # TypeScript type definitions
│   ├── corrections.ts   # Correction-related types
│   ├── delivery.ts      # Delivery-related types
│   ├── index.ts         # Type exports
│   ├── project-module-select-type.ts
│   └── project.tsx      # Main project types
├── utils/               # Utility functions
│   ├── default-modules.ts
│   └── project-type-labels.ts
└── README.md           # This documentation
```

## Core Components

### ProjectCard
The main component for displaying project information. Supports both compact and expanded views with role-based permissions.

**Features:**
- Project status tracking (active, pending, delivered, corrected)
- Date range management for project schedules
- Role-based access control
- Delivery submission interface
- Real-time status updates

**Accessibility:**
- Proper ARIA labels and roles
- Keyboard navigation support
- High contrast color schemes
- Screen reader compatibility

### ProjectDeliveryModal
Modal component for project submission with file upload and team member selection.

### ProjectDialog
Administrative dialog for creating and editing projects.

## Data Flow

1. **Project Creation**: Teachers create projects with schedules and requirements
2. **Student Delivery**: Students submit projects within the specified timeframe
3. **Correction Process**: Teachers review and provide feedback with grades
4. **Status Updates**: Real-time updates reflect project and delivery status

## State Management

The feature uses Zustand stores for state management:

- **ProjectStore**: Manages project CRUD operations
- **DeliveryStore**: Handles project submissions
- **CorrectionStore**: Manages grading and feedback

## Types

### Core Types
- `ClassroomProject`: Main project interface
- `ClassroomProjectDelivery`: Project submission data
- `ClassProjectCorrection`: Grading and feedback data

### Enums
- `ClassroomProjectTypeT`: Project categories (mini_project, end_module_project, etc.)
- `ClassroomProjectModuleT`: Module identifiers

## Utilities

### Project Type Labels
Provides human-readable labels and icons for different project types.

### Default ClassModules
Defines standard module configurations for classrooms.

## Usage Examples

### Basic Project Display
```tsx
import ProjectCard from './components/project-card';

<ProjectCard 
  project={project} 
  expansive={true} 
  classroomId={classroomId} 
/>
```

### Project Creation
```tsx
import { useClassroomProjectStore } from './stores';

const { createProject } = useClassroomProjectStore();

await createProject({
  title: "React Portfolio",
  module: "2",
  project_type: "mini_project",
  classroom_id: classroomId
});
```

## Permissions

The feature integrates with the platform's permission system:

- `classroom_projects.create`: Create new projects
- `classroom_projects.update_all`: Edit any project
- `classroom_projects.update_self`: Edit own projects
- `classroom_projects.delete`: Remove projects
- `classroom_projects.view`: View project details

## Accessibility Features

- **Keyboard Navigation**: All interactive elements are keyboard accessible
- **Screen Reader Support**: Proper ARIA labels and semantic HTML
- **Color Contrast**: Meets WCAG AA standards
- **Focus Management**: Clear focus indicators and logical tab order
- **Alternative Text**: Descriptive text for icons and images

## Best Practices

1. **Performance**: Use React.memo for expensive components
2. **Error Handling**: Implement proper error boundaries
3. **Loading States**: Show loading indicators for async operations
4. **Validation**: Use Zod schemas for data validation
5. **Testing**: Write unit tests for utility functions and integration tests for components

## API Integration

The feature integrates with the following API endpoints:

- `GET /api/projects`: Fetch projects
- `POST /api/projects`: Create project
- `PUT /api/projects/:id`: Update project
- `DELETE /api/projects/:id`: Delete project
- `POST /api/deliveries`: Submit project delivery
- `POST /api/corrections`: Submit project correction

## Future Enhancements

- Real-time collaboration features
- Advanced file preview capabilities
- Automated testing integration
- Enhanced analytics and reporting
- Mobile-optimized interface