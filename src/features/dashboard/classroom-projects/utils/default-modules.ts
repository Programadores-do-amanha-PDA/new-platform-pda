export const getDefaultModules = () => {
  const modules = Array(6)
    .fill(0)
    .map((_, index) => {
      return {
        id: `${index}`,
        title: `Modulo ${index}`,
      };
    });

  return modules;
};
