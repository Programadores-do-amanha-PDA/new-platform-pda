interface GeneratePathLabelsByFeaturesDataProps {
    readonly pathLabels: Record<string, string>;
    readonly featuresData: { [key: string]: Map<string, string> };
}

/**
 * Merges base path labels with feature-specific path labels into a unified configuration.
 * 
 * This utility function combines standard application path labels with dynamic
 * feature-specific labels generated at runtime. Useful for maintaining a consistent
 * breadcrumb and navigation labeling system while allowing features to contribute
 * their own custom path labels.
 * 
 * **Purpose:**
 * - Consolidates path-to-label mappings from multiple sources
 * - Enables features to define their own route labels without modifying global config
 * - Provides single source of truth for AppBar breadcrumb generation
 * - Allows dynamic label generation based on user role and feature availability
 * 
 * **Merge Strategy:**
 * 1. Flattens all feature-specific Map values into a single labels object
 * 2. Merges flattened feature labels with base pathLabels
 * 3. Feature labels take precedence over base labels (rightmost spread wins)
 * 
 * **Data Flow:**
 * ```
 * pathLabels: { '/dashboard': 'Dashboard', '/profile': 'Profile' }
 * +
 * featuresData: {
 *   'classrooms': Map(['/classroom/123', 'Math 101']),
 *   'projects': Map(['/project/456', 'AI Agent'])
 * }
 * =
 * result: {
 *   '/dashboard': 'Dashboard',
 *   '/profile': 'Profile',
 *   '/classroom/123': 'Math 101',
 *   '/project/456': 'AI Agent'
 * }
 * ```
 * 
 * @param props - Configuration object
 * @param props.pathLabels - Base path-to-label mappings for standard routes
 * @param props.featuresData - Feature-specific labels organized by feature with Map values
 * @returns Merged Record containing all path-to-label mappings with feature labels taking precedence
 * 
 * @example
 * ```typescript
 * const baseLabels = {
 *   '/dashboard': 'Dashboard',
 *   '/profile': 'Profile',
 *   '/classrooms': 'Classrooms'
 * };
 * 
 * const classroomsData = new Map([
 *   ['/classrooms/123', 'Math 101'],
 *   ['/classrooms/456', 'Physics 102']
 * ]);
 * 
 * const projectsData = new Map([
 *   ['/projects/789', 'AI Agent Project']
 * ]);
 * 
 * const mergedLabels = generatePathLabelsByFeaturesData({
 *   pathLabels: baseLabels,
 *   featuresData: {
 *     'classrooms': classroomsData,
 *     'projects': projectsData
 *   }
 * });
 * 
 * // Result:
 * // {
 * //   '/dashboard': 'Dashboard',
 * //   '/profile': 'Profile',
 * //   '/classrooms': 'Classrooms',
 * //   '/classrooms/123': 'Math 101',
 * //   '/classrooms/456': 'Physics 102',
 * //   '/projects/789': 'AI Agent Project'
 * // }
 * ```
 * 
 * @remarks
 * - **Empty Features Data**: Safely handles empty featuresData (returns only pathLabels)
 * - **Precedence**: Feature labels override base labels for same paths
 * - **Type Safety**: Ensures all inputs and outputs are properly typed
 * - **Performance**: O(n) where n = total number of labels across all features
 * - **Immutability**: Returns new object, doesn't mutate input parameters
 * 
 * @throws No explicit error throwing. Handles empty or malformed data gracefully.
 * 
 * @see {@link BaseStackProvider} Uses this function to generate AppBar path labels
 * @see {@link AppBar} Component that consumes the merged path labels for breadcrumb rendering
 */
export const generatePathLabelsByFeaturesData = ({
    pathLabels,
    featuresData,
}: GeneratePathLabelsByFeaturesDataProps): Record<string, string> => {
    const featuresDataLabels: Record<string, string> = {};

    if (Object.keys(featuresData).length > 0) {
        Object.keys(featuresData).forEach((key) => {
            featuresData[key].forEach((value, pathKey) => {
                featuresDataLabels[pathKey] = value;
            });
        });
    }

    return {
        ...pathLabels,
        ...featuresDataLabels,
    };
};
