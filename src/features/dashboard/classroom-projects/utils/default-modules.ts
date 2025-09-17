export const getDefaultModules = () => {
  const modules = Array(5)
    .fill(0)
    .map((_, index) => {
      return {
        id: index + 1,
        title: `Modulo ${index + 1}`,
      };
    });

  return modules;
};
