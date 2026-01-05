type GeneratePathLabelsByFeaturesDataProps = {
    pathLabels: Record<string, string>;
    featuresData: { [key: string]: Map<string, string> };
};

export const generatePathLabelsByFeaturesData = ({
    pathLabels,
    featuresData,
}: GeneratePathLabelsByFeaturesDataProps): Record<string, string> => {
    const featuresDataLabels: Record<string, string> = {};

    if (Object.keys(featuresData).length > 0) {
        Object.keys(featuresData).forEach((key) => {
            featuresData[key].forEach((value, key) => {
                featuresDataLabels[key] = value;
            });
        });
    }

    return {
        ...pathLabels,
        ...featuresDataLabels,
    };
};
