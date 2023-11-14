export const formatDate = (date: Date) => {
  return new Date(date).toLocaleDateString("en-gb", {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};
