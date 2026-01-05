import { View, Text, TouchableOpacity } from "react-native";

type PaginationProps = {
  page: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  isLoading?: boolean;
  hasNext?: boolean;
  total?: number;
};

const Pagination = ({
  page,
  pageSize,
  onPageChange,
  isLoading,
  hasNext,
  total,
}: PaginationProps) => {
  const canPrev = page > 1 && !isLoading;
  const canNext = Boolean(hasNext) && !isLoading;
  const showingFrom =
    total !== undefined ? Math.min((page - 1) * pageSize + 1, total || 0) : undefined;
  const showingTo =
    total !== undefined ? Math.min(page * pageSize, total || 0) : undefined;

  return (
    <View className="flex-row items-center justify-between mt-4">
      <View>
        {total ? (
          <Text className="text-gray-600 dark:text-gray-400 text-xs">
            Showing {showingFrom}-{showingTo} of {total}
          </Text>
        ) : (
          <Text className="text-gray-600 dark:text-gray-400 text-xs">Page {page}</Text>
        )}
      </View>
      <View className="flex-row gap-2">
        <TouchableOpacity
          disabled={!canPrev}
          onPress={() => canPrev && onPageChange(page - 1)}
          className={`px-3 py-1.5 rounded-lg border ${
            canPrev ? "border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700" : "border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-800 opacity-60"
          }`}
        >
          <Text className="text-sm text-gray-700 dark:text-gray-300 font-semibold">Prev</Text>
        </TouchableOpacity>
        <TouchableOpacity
          disabled={!canNext}
          onPress={() => canNext && onPageChange(page + 1)}
          className={`px-3 py-1.5 rounded-lg border ${
            canNext ? "border-orange-300 dark:border-orange-600 bg-orange-50 dark:bg-orange-900/30" : "border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-800 opacity-60"
          }`}
        >
          <Text className="text-sm text-orange-700 font-semibold">Next</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default Pagination;
