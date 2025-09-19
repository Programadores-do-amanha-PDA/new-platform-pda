# Date Interval Components

## Overview

The Date Interval feature provides components and utilities for selecting and managing date ranges within the PDA platform. It includes a date picker component with Brazilian Portuguese localization and utility functions for date formatting and interval calculations.

## Architecture

### Directory Structure

```
src/components/shared/date-interval/
├── components/
│   ├── date-interval-picker.tsx          # Main date range picker component
│   └── date-interval-pagination-control.tsx # Pagination control for date intervals
├── utils/
│   ├── date-formatting.ts                # Date formatting utilities
│   ├── intervals.ts                      # Date interval calculations
│   └── index.ts                          # Utils exports
├── types.ts                              # TypeScript type definitions
├── index.ts                              # Main exports
└── README.md                             # This documentation
```

## Components

### DateIntervalPicker

A date range picker component that allows users to select start and end dates with Brazilian Portuguese localization.

**Features:**
- Date range selection with visual calendar
- Brazilian Portuguese localization
- Keyboard navigation support
- Accessibility features (ARIA labels, screen reader support)
- Flexible function signature support for both direct functions and React setState dispatch
- Responsive design

**Props:**
- `date: DateRange | undefined` - The selected date range
- `setDate: ((date: DateRange | undefined) => void) | React.Dispatch<React.SetStateAction<DateRange | undefined>>` - Function to update the date range
- `buttonClassName?: string` - Additional CSS classes for the trigger button
- `className?: string` - Additional CSS classes for the container
- `...props` - Additional HTML div attributes

**Usage:**
```tsx
import { DateIntervalPicker } from '@/components/shared/date-interval';

const [dateRange, setDateRange] = useState<DateRange | undefined>();

<DateIntervalPicker
  date={dateRange}
  setDate={setDateRange}
  buttonClassName="w-full"
/>
```

### DateIntervalPaginationControl

A comprehensive pagination control component for navigating through date intervals with support for both manual navigation and module-based organization.

**Features:**

- Manual date interval navigation with previous/next buttons
- Module-based interval selection from dropdown menu
- Automatic current module detection
- Flexible interval duration preservation during navigation
- Type-safe implementation with comprehensive TypeScript support
- Integrated date picker for manual date selection
- Responsive design with proper accessibility features

**Props:**

- `onDateRangeChange: (dateRange: { from: Date; to: Date }) => void` - Callback function when date range changes
- `modules?: ClassroomConfigModulesT[]` - Array of classroom modules for interval selection
- `defaultInterval?: DefaultIntervalTypeT` - Default interval type ("manual" | "modules")

**Usage:**

```tsx
import { DateIntervalPaginationControl } from '@/components/shared/date-interval';

const modules = [
  {
    id: "module-1",
    title: "Module 1: Introduction",
    interval: {
      from: new Date('2024-01-01'),
      to: new Date('2024-01-31')
    },
    created_at: '2024-01-01T00:00:00Z'
  }
];

<DateIntervalPaginationControl
  onDateRangeChange={(range) => {
    console.log('Date range changed:', range);
    // Update your data based on the new range
  }}
  modules={modules}
  defaultInterval="modules"
/>
```

**Behavior:**

- **Manual Mode**: Users can navigate through intervals using previous/next buttons, maintaining the current interval duration
- **Module Mode**: Users can select from predefined module intervals via dropdown menu
- **Auto-detection**: When using "modules" as default, automatically detects and selects the current active module
- **Fallback**: Falls back to manual mode with current week if no modules are available or current

## Utilities

### Date Formatting

#### `formatDateRange(date: DateRange | undefined): string`
Formats a date range for display in the Brazilian Portuguese format.

**Parameters:**
- `date` - The date range to format

**Returns:**
- Formatted date range string (e.g., "Jan 15, 2024 - Jan 30, 2024")
- "Selecione um intervalo" if no date is provided

#### `formatDate(date: Date, pattern?: string): string`
Formats a single date using Brazilian Portuguese locale.

**Parameters:**
- `date` - The date to format
- `pattern` - Format pattern (defaults to "LLL dd, y")

**Returns:**
- Formatted date string

### Date Intervals

#### `getCurrentWeekRange(): DateRange`

Returns the current week's date range (Sunday to Saturday).

#### `getCurrentModuleRange(modules: ClassroomConfigModulesT[]): DateRange`

Returns the current module's date range based on the provided modules array. Falls back to current week if no active module is found.

### Pagination Control Utilities

#### `getCurrentModule(modules: ClassroomConfigModulesT[]): string`

Finds the currently active module based on today's date. Returns "manual" if no active module is found.

#### `calculatePreviousInterval(dateRange: DateRange | undefined): DateRange | undefined`

Calculates the previous interval based on the current date range, maintaining the same duration.

#### `calculateNextInterval(dateRange: DateRange | undefined): DateRange | undefined`

Calculates the next interval based on the current date range, maintaining the same duration.

#### `normalizeDateRange(dateRange: DateRange | undefined): DateRange | undefined`

Normalizes a date range to ensure proper start of day and end of day times.

#### `getInitialDateRange(defaultInterval: DefaultIntervalTypeT, modules: ClassroomConfigModulesT[]): DateRange`

Gets the initial date range based on the default interval type and available modules.

## Types

### `DateIntervalPickerProps`

Props interface for the DateIntervalPicker component.

### `DateIntervalPaginationControlPropsT`

Props interface for the DateIntervalPaginationControl component.

### `DefaultIntervalTypeT`

Type definition for interval modes: "manual" | "modules".

### `DateFormatOptionsT`

Configuration interface for date formatting options.

## Accessibility Features

### Keyboard Navigation
- Tab navigation through all interactive elements
- Enter and Space key support for calendar activation
- Arrow key navigation within the calendar
- Escape key to close the calendar popover

### Screen Reader Support
- Proper ARIA labels for all interactive elements
- Semantic HTML structure with appropriate roles
- Status announcements for date selection changes
- Descriptive text for calendar navigation

### Visual Accessibility
- High contrast color schemes for both light and dark modes
- Clear focus indicators for keyboard navigation
- Consistent visual hierarchy
- Responsive design for different screen sizes

## Localization

The components use Brazilian Portuguese (`ptBR`) locale from `date-fns` for:
- Month and day names
- Date formatting patterns
- Calendar navigation labels
- Accessibility announcements

## Integration

### With Forms
The DateIntervalPicker integrates seamlessly with React Hook Form:

```tsx
import { useForm } from 'react-hook-form';
import { DateIntervalPicker } from '@/components/shared/date-interval';

const form = useForm();

<FormField
  control={form.control}
  name="dateRange"
  render={({ field }) => (
    <FormItem>
      <FormLabel>Período</FormLabel>
      <FormControl>
        <DateIntervalPicker
          date={field.value}
          setDate={field.onChange}
        />
      </FormControl>
    </FormItem>
  )}
/>
```

### With State Management
Works with both local state and global state management:

```tsx
// Local state
const [dateRange, setDateRange] = useState<DateRange | undefined>();

// Zustand store
const { dateRange, setDateRange } = useDateStore();

<DateIntervalPicker
  date={dateRange}
  setDate={setDateRange}
/>
```

## Best Practices

### Performance
- Use React.memo for expensive parent components
- Debounce date change handlers if needed for API calls
- Avoid unnecessary re-renders by memoizing callback functions

### Error Handling
- Validate date ranges before submission
- Provide clear error messages for invalid selections
- Handle edge cases (leap years, month boundaries)

### Accessibility
- Always provide meaningful labels
- Test with screen readers
- Ensure keyboard navigation works properly
- Maintain focus management

## Testing

### Unit Tests
- Test date formatting functions with various inputs
- Verify interval calculation utilities
- Test edge cases and boundary conditions

### Integration Tests
- Test component interaction with forms
- Verify accessibility features
- Test keyboard navigation flows

### Visual Tests
- Test responsive design across screen sizes
- Verify color contrast in both themes
- Test focus indicators and hover states

## Future Enhancements

- Time selection support
- Custom date format patterns
- Multiple locale support
- Advanced keyboard shortcuts
- Date range presets (last week, last month, etc.)
- Integration with date validation libraries