export const FARM_CATEGORY_OPTIONS = [
  "GRAINS",
  "VEGETABLES",
  "FRUITS",
  "INDUSTRIAL",
  "LEGUMES",
  "TUBERS",
  "HERBS_SPICES",
  "ORNAMENTAL",
  "FODDER_FEED",
  "BEVERAGE_CROPS",
  "OTHER",
] as const;

export type FarmCategoryOption = (typeof FARM_CATEGORY_OPTIONS)[number];

export const FARM_CATEGORY_LABELS: Record<FarmCategoryOption, string> =
  FARM_CATEGORY_OPTIONS.reduce((acc, category) => {
    const label = category
      .toString()
      .split("_")
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
      .join(" ");

    return { ...acc, [category]: label };
  }, {} as Record<FarmCategoryOption, string>);

export const getFarmCategoryLabel = (category: string) => {
  const match = FARM_CATEGORY_OPTIONS.find((option) => option === category);
  if (match) return FARM_CATEGORY_LABELS[match];
  return category
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(" ");
};
