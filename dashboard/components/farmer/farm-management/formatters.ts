export const formatFarmSize = (value: number | null) => {
  if (value === null || Number.isNaN(value)) return "--";
  return `${Number(value).toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })}`;
};
