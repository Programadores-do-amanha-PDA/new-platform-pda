import { AuthUserWithProfile } from "@/features/dashboard/profile";
import {
  ClassroomProjectDelivery,
  GroupDeliveriesOptions,
  GroupedDelivery,
} from "../../types";

/**
 * Groups deliveries by unique user squads with comprehensive member aggregation
 *
 * This utility function organizes project deliveries into logical groups based on
 * squad membership, handling various delivery structures including individual submissions,
 * group projects, and legacy email-based member systems.
 *
 * ## Grouping Logic
 * - Primary User: The user who submitted the delivery (user_id)
 * - Squad Members: All collaborators including members_id and legacy email members
 * - Unique Keys: Generated from sorted member IDs for consistent grouping
 *
 * ## Use Cases
 * - Individual projects: Single user groups
 * - Group projects: Multiple member squads
 * - Legacy data: Email-based member compatibility
 * - Mixed projects: Flexible member identification
 *
 * @param deliveries - Array of project deliveries to group
 * @param classroomUsers - Array of classroom users for user reference lookup
 * @param options - Configuration options for grouping behavior
 * @returns Array of grouped deliveries with squad information
 *
 * @example
 * ```typescript
 * // Basic grouping
 * const grouped = groupDeliveriesBySquad(deliveries, classroomUsers);
 *
 * // Grouping with custom options
 * const grouped = groupDeliveriesBySquad(deliveries, classroomUsers, {
 *   includeEmailMembers: false,
 *   memberSortFunction: (a, b) => a.localeCompare(b)
 * });
 *
 * // Using in React component
 * const groupedDeliveries = useMemo(() =>
 *   groupDeliveriesBySquad(deliveries, classroomUsers),
 *   [deliveries, classroomUsers]
 * );
 * ```
 *
 * @remarks
 * - Handles mixed data formats (IDs and emails) gracefully
 * - Maintains consistent grouping across different project types
 * - Provides flexible configuration for different use cases
 */
export function groupDeliveriesBySquad(
  deliveries: ClassroomProjectDelivery[],
  classroomUsers: Partial<AuthUserWithProfile>[],
  options: GroupDeliveriesOptions = {}
): GroupedDelivery[] {
  const { includeEmailMembers = true, memberSortFunction = defaultMemberSort } =
    options;

  // Early return for empty deliveries to avoid unnecessary processing
  if (!deliveries || deliveries.length === 0) {
    return [];
  }

  const groupedDeliveries = new Map<string, GroupedDelivery>();

  deliveries.forEach((delivery) => {
    const squadMembers = extractSquadMembers(delivery, includeEmailMembers);
    const uniqueGroupKey = generateGroupKey(squadMembers, memberSortFunction);

    createOrUpdateGroup(
      groupedDeliveries,
      uniqueGroupKey,
      delivery,
      squadMembers,
      classroomUsers
    );
  });

  return Array.from(groupedDeliveries.values());
}

/**
 * Extracts all squad members from a delivery using multiple identification methods
 *
 * Aggregates members from different sources in the delivery object:
 * 1. Primary user (user_id)
 * 2. Member IDs (members_id array)
 * 3. Legacy email members (members array - if enabled)
 *
 * @param delivery - The delivery object to extract members from
 * @param includeEmailMembers - Whether to include legacy email members
 * @returns Set of unique squad member identifiers
 *
 * @example
 * ```typescript
 * const members = extractSquadMembers(delivery, true);
 * // Returns: Set { 'user123', 'user456', 'email@example.com' }
 * ```
 */
function extractSquadMembers(
  delivery: ClassroomProjectDelivery,
  includeEmailMembers: boolean
): Set<string> {
  const squadMembers = new Set<string>();

  // 1. Always include the primary user who submitted the delivery
  if (delivery.user_id) {
    squadMembers.add(delivery.user_id);
  }

  // 2. Include explicit member IDs for group projects
  if (includeEmailMembers && delivery.members_id && Array.isArray(delivery.members_id)) {
    delivery.members_id.forEach((memberId) => {
      if (memberId) {
        squadMembers.add(memberId);
      }
    });
  }

  // 3. Include legacy email members (optional)
  if (
    includeEmailMembers &&
    delivery.members &&
    Array.isArray(delivery.members)
  ) {
    delivery.members.forEach((email) => {
      if (email && typeof email === "string") {
        squadMembers.add(email);
      }
    });
  }

  return squadMembers;
}

/**
 * Generates a unique group key from squad members for consistent grouping
 *
 * Creates a deterministic key by sorting members and joining with a separator.
 * This ensures the same squad composition always produces the same group key
 * regardless of member order in the original data.
 *
 * @param squadMembers - Set of squad member identifiers
 * @param sortFunction - Function to sort members for key generation
 * @returns Unique string key for the squad composition
 *
 * @example
 * ```typescript
 * const members = new Set(['userB', 'userA']);
 * const key = generateGroupKey(members);
 * // Returns: "userA_userB"
 * ```
 */
function generateGroupKey(
  squadMembers: Set<string>,
  sortFunction: (a: string, b: string) => number
): string {
  const sortedMembers = Array.from(squadMembers)
    .filter(Boolean)
    .sort(sortFunction);

  return sortedMembers.join("_");
}

/**
 * Default sorting function for squad members
 *
 * Uses natural string comparison to ensure consistent ordering
 * of member IDs in group keys.
 *
 * @param a - First member identifier
 * @param b - Second member identifier
 * @returns Number indicating sort order
 */
function defaultMemberSort(a: string, b: string): number {
  return a.localeCompare(b);
}

/**
 * Creates or updates a delivery group in the grouping map
 *
 * Handles the logic for either creating a new group entry or
 * updating an existing one with additional deliveries.
 *
 * @param groupedDeliveries - Map of existing grouped deliveries
 * @param groupKey - Unique key for the squad group
 * @param delivery - Current delivery being processed
 * @param squadMembers - Set of squad member identifiers
 * @param classroomUsers - Array of users for primary user lookup
 */
function createOrUpdateGroup(
  groupedDeliveries: Map<string, GroupedDelivery>,
  groupKey: string,
  delivery: ClassroomProjectDelivery,
  squadMembers: Set<string>,
  classroomUsers: Partial<AuthUserWithProfile>[]
): void {
  if (!groupedDeliveries.has(groupKey)) {
    const primaryUser = findPrimaryUser(delivery.user_id, classroomUsers);

    groupedDeliveries.set(groupKey, {
      userId: delivery.user_id,
      user: primaryUser,
      deliveries: [],
      squadMembers: Array.from(squadMembers).filter(Boolean),
    });
  }

  // Add delivery to the existing group
  const group = groupedDeliveries.get(groupKey)!;
  group.deliveries.push(delivery);
}

/**
 * Finds the primary user object from classroom users
 *
 * @param userId - ID of the user to find
 * @param classroomUsers - Array of classroom users to search
 * @returns User object if found, undefined otherwise
 */
function findPrimaryUser(
  userId: string,
  classroomUsers: Partial<AuthUserWithProfile>[]
): Partial<AuthUserWithProfile> | undefined {
  return classroomUsers.find((user) => user.id === userId);
}

/**
 * Groups deliveries by individual users only (ignores squad members)
 *
 * Useful for individual project analysis where group membership
 * should not be considered in the grouping logic.
 *
 * @param deliveries - Array of project deliveries
 * @param classroomUsers - Array of classroom users
 * @returns Deliveries grouped by individual users
 */
export function groupDeliveriesByIndividual(
  deliveries: ClassroomProjectDelivery[],
  classroomUsers: Partial<AuthUserWithProfile>[]
): GroupedDelivery[] {
  return groupDeliveriesBySquad(deliveries, classroomUsers, {
    includeEmailMembers: false,
  });
}

/**
 * Groups deliveries with enhanced squad detection including email matching
 *
 * Extends the basic grouping by attempting to match email members to
 * user IDs in the system for more accurate squad identification.
 *
 * @param deliveries - Array of project deliveries
 * @param classroomUsers - Array of classroom users
 * @returns Deliveries grouped with email-to-user matching
 */
export function groupDeliveriesWithEmailMatching(
  deliveries: ClassroomProjectDelivery[],
  classroomUsers: Partial<AuthUserWithProfile>[]
): GroupedDelivery[] {
  const emailToUserIdMap = createEmailToUserIdMap(classroomUsers);

  const enhancedDeliveries = deliveries.map((delivery) =>
    enhanceDeliveryWithUserIds(delivery, emailToUserIdMap)
  );

  return groupDeliveriesBySquad(enhancedDeliveries, classroomUsers, {
    includeEmailMembers: false, // We've already converted emails to IDs
  });
}

/**
 * Creates a mapping of email addresses to user IDs
 *
 * @param classroomUsers - Array of classroom users
 * @returns Map of email to user ID
 */
function createEmailToUserIdMap(
  classroomUsers: Partial<AuthUserWithProfile>[]
): Map<string, string> {
  const emailMap = new Map<string, string>();

  classroomUsers.forEach((user) => {
    if (user.email) {
      emailMap.set(user.email.toLowerCase(), user.id!);
    }
  });

  return emailMap;
}

/**
 * Enhances delivery by converting email members to user IDs where possible
 *
 * @param delivery - The delivery to enhance
 * @param emailMap - Mapping of emails to user IDs
 * @returns Enhanced delivery with converted member IDs
 */
function enhanceDeliveryWithUserIds(
  delivery: ClassroomProjectDelivery,
  emailMap: Map<string, string>
): ClassroomProjectDelivery {
  if (!delivery.members || !Array.isArray(delivery.members)) {
    return delivery;
  }

  const enhancedMemberIds = new Set(delivery.members_id || []);

  delivery.members.forEach((email) => {
    const userId = emailMap.get(email.toLowerCase());
    if (userId && !enhancedMemberIds.has(userId)) {
      enhancedMemberIds.add(userId);
    }
  });

  return {
    ...delivery,
    members_id: Array.from(enhancedMemberIds),
  };
}
