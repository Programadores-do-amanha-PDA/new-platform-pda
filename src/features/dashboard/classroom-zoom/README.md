# Classroom Zoom Feature

## Overview

The Classroom Zoom feature integrates Zoom meeting functionality into the PDA platform, allowing teachers to manage Zoom accounts, schedule meetings, track attendance, and analyze participation data.

## Architecture

### Directory Structure

```
src/features/dashboard/classroom-zoom/
├── components/         # Zoom-related components
│   ├── accounts/      # Account management components
│   ├── meetings/      # Meeting management components
│   └── meetings-participants-chart.tsx
├── hooks/             # Custom hooks
│   └── use-meeting-card.ts
├── pages/             # Page components
│   ├── accounts-page.tsx
│   ├── home-page.tsx
│   ├── meeting-page.tsx
│   ├── meetings-page.tsx
│   ├── past-meeting-page.tsx
│   └── recurrence-meeting-page.tsx
├── utils/             # Utility functions
│   └── meeting-utils.ts
└── README.md         # This documentation
```

## Core Features

### Account Management
- **Zoom Account Integration**: Connect and manage multiple Zoom accounts
- **Account Validation**: Verify Zoom account credentials and permissions
- **Account Switching**: Switch between different Zoom accounts for meetings

### Meeting Management
- **Meeting Creation**: Schedule new Zoom meetings with classroom integration
- **Meeting Types**: Support for different meeting types (programming, English, soft skills, etc.)
- **Recurring Meetings**: Handle recurring meeting schedules
- **Meeting Updates**: Modify meeting details and schedules

### Attendance Tracking
- **Participant Monitoring**: Track who joins and leaves meetings
- **Attendance Reports**: Generate attendance reports for classroom management
- **Participation Analytics**: Analyze student participation patterns
- **Integration with Activities**: Link Zoom attendance to classroom activities

## Components

### AccountsPage
Displays and manages Zoom accounts for the classroom.

**Features:**
- Account listing with search functionality
- Account creation and editing
- Account status monitoring
- Permission-based access control

### MeetingsPage
Shows all meetings for a classroom with filtering and management options.

### MeetingPage
Detailed view for individual meetings with participant data and controls.

### MeetingCard
Reusable component for displaying meeting information in lists and grids.

## Utilities

### Meeting Utils
Provides utility functions for meeting management:

- `MEETING_TYPES`: Constants for different meeting types
- `isFutureMeeting()`: Check if meeting is scheduled for the future
- `formatDateTime()`: Format meeting date and time for display
- `getMeetingType()`: Get human-readable meeting type labels

## Integration Points

### Zoom API
- **Meeting Management**: Create, update, and delete meetings
- **Participant Data**: Retrieve participant information and attendance
- **Account Management**: Manage Zoom account settings and permissions

### Classroom System
- **Activity Integration**: Link meetings to classroom activities
- **Attendance Calculation**: Integrate with attendance tracking system
- **Permission System**: Role-based access to Zoom features

### Data Stores
- **Meeting Store**: Manages meeting data and operations
- **Account Store**: Handles Zoom account information
- **Attendance Store**: Tracks participation and attendance data

## Accessibility Features

- **Keyboard Navigation**: All meeting controls are keyboard accessible
- **Screen Reader Support**: Proper ARIA labels for meeting information
- **High Contrast**: Meeting status indicators work in high contrast mode
- **Focus Management**: Clear focus indicators for interactive elements

## Security Considerations

- **API Key Management**: Secure storage and handling of Zoom API credentials
- **Permission Validation**: Verify user permissions before Zoom operations
- **Data Privacy**: Protect participant data and meeting information
- **Rate Limiting**: Respect Zoom API rate limits and quotas

## Usage Examples

### Creating a Meeting
```tsx
import { useMeetingStore } from '../stores/meetings';

const { createMeeting } = useMeetingStore();

await createMeeting({
  topic: "Programming Class",
  type: "programming",
  start_time: new Date(),
  duration: 120
});
```

### Displaying Meeting Card
```tsx
import MeetingCard from './components/meetings/meeting-card';

<MeetingCard 
  meeting={meeting} 
  onEdit={handleEdit}
  onDelete={handleDelete}
/>
```

## Performance Optimizations

- **Data Caching**: Cache meeting and participant data to reduce API calls
- **Lazy Loading**: Load meeting details only when needed
- **Pagination**: Implement pagination for large meeting lists
- **Real-time Updates**: Use WebSocket connections for live meeting updates

## Error Handling

- **API Errors**: Handle Zoom API errors gracefully with user-friendly messages
- **Network Issues**: Provide offline capabilities where possible
- **Permission Errors**: Clear messaging when users lack required permissions
- **Rate Limiting**: Implement backoff strategies for API rate limits

## Future Enhancements

- **Breakout Room Management**: Support for Zoom breakout rooms
- **Recording Integration**: Automatic recording management and storage
- **Advanced Analytics**: Detailed participation and engagement metrics
- **Mobile Optimization**: Enhanced mobile experience for meeting management
- **Webhook Integration**: Real-time meeting event processing