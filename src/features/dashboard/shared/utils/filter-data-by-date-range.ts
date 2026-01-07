/**
 * Filters an array of data items by a specified date range
 *
 * This generic function filters data based on a date field within a given range.
 * It safely handles invalid dates, missing values, and optional date ranges.
 *
 * @template T - The type of items in the data array
 * @param data - Array of data items to filter
 * @param dateField - Key of the field containing the date value in each item
 * @param dateRange - Object containing 'from' and 'to' Date objects, or null to skip filtering
 * @returns Filtered array of items that fall within the specified date range
 *
 * @example
 * ```typescript
 * // Filter users by registration date
 * const recentUsers = filterDataByDateRange(
 *   users,
 *   'createdAt',
 *   { from: new Date('2024-01-01'), to: new Date('2024-12-31') }
 * );
 *
 * // With transactions array
 * const q4Transactions = filterDataByDateRange(
 *   transactions,
 *   'transactionDate',
 *   { from: new Date('2024-10-01'), to: new Date('2024-12-31') }
 * );
 * ```
 *
 * @remarks
 * - Returns original data array if dateRange is null or undefined
 * - Safely handles invalid date values by excluding them
 * - Supports both string and Date object date fields
 * - Inclusive range (includes both 'from' and 'to' dates)
 */

type FilterDataByDateRangeParams<T> = {
    data: T[];
    dateField: keyof T;
    dateRange: { from: Date; to: Date } | null;
};

export const filterDataByDateRange = <T>({ data, dateField, dateRange }: FilterDataByDateRangeParams<T>): T[] => {
    if (!dateRange) return data;

    return data.filter((item) => {
        if (!item) return false;

        const itemDate = item[dateField];
        if (!itemDate) return false;

        const date = new Date(itemDate as unknown as string | Date);
        if (isNaN(date.getTime())) return false;

        return date >= dateRange.from && date <= dateRange.to;
    });
};
