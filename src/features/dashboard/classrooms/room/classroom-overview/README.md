# Classroom Overview Feature

## Overview

The Classroom Overview feature provides comprehensive analytics and reporting for classroom performance, student progress, and activity tracking. It aggregates data from multiple sources to give educators a complete view of their classroom.

## Architecture

### Directory Structure

```
src/features/dashboard/classroom-overview/
├── components/         # Overview components
│   ├── classroom-overview-table.tsx
│   ├── column-groups.ts
│   ├── column-visibility-dropdown.tsx
│   ├── columns.tsx
│   └── data-table.tsx
├── pages/             # Page components
│   └── page.tsx
├── utils/             # Utility functions
│   ├── calculate-coodesh-scores.ts
│   ├── calculate-general-presence.ts
│   ├── calculate-presence-by-type.ts
│   ├── calculate-project-notes.ts
│   ├── get-student-coodesh-grades.ts
│   └── index.ts
└── README.md         # This documentation
```

## Core Features

### Comprehensive Analytics
- **Student Performance**: Track individual and class-wide performance metrics
- **Attendance Analysis**: Monitor attendance patterns across different activity types
- **Project Progress**: Visualize project completion and grading status
- **CoodeshAssessmentPayload Results**: Integrate Coodesh assessment scores and analytics

### Data Visualization
- **Interactive Tables**: Sortable, filterable data tables with column customization
- **Performance Charts**: Visual representations of student progress
- **Attendance Heatmaps**: Visual attendance patterns over time
- **Grade Distributions**: Statistical analysis of class performance

### Reporting System
- **Export Capabilities**: Export data in various formats (CSV, PDF, Excel)
- **Custom Reports**: Generate reports based on specific criteria
- **Automated Reports**: Schedule regular performance reports
- **Comparative Analysis**: Compare performance across different periods

## Components

### ClassroomOverviewTable
Main component that displays comprehensive classroom data in a tabular format.

**Features:**
- Dynamic column configuration
- Real-time data updates
- Sorting and filtering capabilities
- Export functionality
- Responsive design

### ColumnVisibilityDropdown
Allows users to customize which columns are visible in the overview table.

### DataTable
Reusable data table component with advanced features like pagination, sorting, and filtering.

## Utility Functions

### Calculate Coodesh Scores
Processes Coodesh assessment data to calculate student performance metrics.

```typescript
calculateCoodeshScores(studentEmail: string, assessments: CoodeshAssessment[])
```

### Calculate General Presence
Computes overall attendance rates from various activity sources.

```typescript
calculateGeneralPresence(studentEmail: string, activities: ClassActivity[])
calculateGeneralPresenceFromZoom(studentId: string, studentEmail: string, ...)
```

### Calculate Project Notes
Aggregates project grades and calculates average performance.

```typescript
calculateProjectNotes(studentEmail: string, projects: ClassroomProjectWithDeliveriesAndCorrectionsT[])
```

### Calculate Presence by Type
Breaks down attendance by activity type (programming, English, soft skills, etc.).

```typescript
calculatePresenceByType(studentId: string, zoomPastInstances: ZoomMeetingPastInstance[], ...)
```

## Data Sources Integration

### Project System
- Project deliveries and corrections
- Grade calculations and averages
- Completion rates and timelines

### Attendance System
- Zoom meeting participation
- ClassActivity attendance tracking
- Justification management

### CoodeshAssessmentPayload System
- Coodesh assessment results
- Performance analytics
- Progress tracking

### User Management
- Student profiles and information
- Role-based data access
- Permission validation

## Performance Optimizations

### Data Processing
- **Memoization**: Cache calculated results to avoid recomputation
- **Lazy Loading**: Load data sections on demand
- **Background Processing**: Calculate heavy metrics in background threads
- **Data Pagination**: Handle large datasets efficiently

### UI Optimizations
- **Virtual Scrolling**: Handle large tables efficiently
- **Debounced Filtering**: Optimize search and filter operations
- **Progressive Loading**: Show data as it becomes available
- **Responsive Design**: Optimize for different screen sizes

## Accessibility Features

- **Keyboard Navigation**: Full keyboard support for table interactions
- **Screen Reader Support**: Proper table headers and ARIA labels
- **High Contrast**: Data visualization works in high contrast mode
- **Focus Management**: Clear focus indicators and logical tab order
- **Alternative Formats**: Data available in multiple accessible formats

## Security & Privacy

- **Data Access Control**: Role-based access to sensitive student data
- **Data Anonymization**: Option to anonymize data for reporting
- **Audit Logging**: Track access to student performance data
- **GDPR Compliance**: Respect data privacy regulations

## Usage Examples

### Basic Overview Display
```tsx
import ClassroomOverviewTable from './components/classroom-overview-table';

<ClassroomOverviewTable 
  classroomId={classroomId}
  filters={filters}
  onExport={handleExport}
/>
```

### Calculate Student Performance
```tsx
import { calculateProjectNotes, calculateGeneralPresence } from './utils';

const projectGrades = calculateProjectNotes(studentEmail, projects);
const attendanceRate = calculateGeneralPresence(studentEmail, activities);
```

## Export Capabilities

### Supported Formats
- **CSV**: Raw data export for spreadsheet analysis
- **PDF**: Formatted reports with charts and summaries
- **Excel**: Advanced spreadsheet with formulas and formatting
- **JSON**: Structured data for API integration

### Report Types
- **Individual Reports**: Detailed student performance reports
- **Class Summary**: Overall class performance overview
- **Comparative Reports**: Performance comparison across periods
- **Custom Reports**: User-defined report criteria

## Error Handling

- **Data Validation**: Validate all input data before processing
- **Graceful Degradation**: Show partial data when some sources fail
- **Error Recovery**: Retry failed data operations automatically
- **User Feedback**: Clear error messages and recovery suggestions

## Future Enhancements

- **Real-time Analytics**: Live dashboard updates
- **Predictive Analytics**: AI-powered performance predictions
- **Advanced Visualizations**: Interactive charts and graphs
- **Mobile Dashboard**: Optimized mobile overview interface
- **Integration APIs**: External system integration capabilities