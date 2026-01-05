import { View, Text, ScrollView } from "react-native";

import { KPIItem } from "./types";

type Props = {
  kpis: KPIItem[];
  isDesktop: boolean;
};

const FarmerDashboardKpiCards = ({ kpis, isDesktop }: Props) => {
  if (!kpis.length) {
    return (
      <View className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700 mb-6">
        <Text className="text-gray-900 dark:text-gray-100 text-base font-semibold">
          No farmer stats found.
        </Text>

          <Text className="text-gray-500 dark:text-gray-400 text-sm mt-1">
          Add produce or subsidies to see your stats here.
        </Text>
      </View>
    );
  }

  if (isDesktop) {
    return (
      <View className="gap-4 flex-row mb-6">
        {kpis.map((kpi, index) => {
          const Icon = kpi.icon;

          return (
            <View
              key={index}
              className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-200 dark:border-gray-700 flex-1"
            >
              <View className="flex-row items-start justify-between mb-3">
                <View
                  className="w-12 h-12 rounded-lg items-center justify-center"
                  style={{ backgroundColor: `${kpi.color}20` }}
                >
                  <Icon color={kpi.color} size={24} />
                </View>

              </View>

              <Text className="text-gray-900 dark:text-gray-100 text-3xl font-bold mb-1">
                {kpi.value}
              </Text>

              <Text className="text-gray-600 dark:text-gray-400 text-sm">{kpi.label}</Text>
            </View>
          );
        })}
      </View>
    );
  }

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      className="mb-6 -mx-6 px-6"
    >
      <View className="flex-row gap-4">
        {kpis.map((kpi, index) => {
          const Icon = kpi.icon;

          return (
            <View
              key={index}
              className="bg-white dark:bg-gray-800 rounded-xl p-4 w-40 border border-gray-100 dark:border-gray-700"
            >
              <View
                className="w-10 h-10 rounded-lg mb-3 items-center justify-center"
                style={{ backgroundColor: `${kpi.color}20` }}
              >
                <Icon color={kpi.color} size={20} />
              </View>

              <Text className="text-gray-900 dark:text-gray-100 text-2xl font-bold mb-1">
                {kpi.value}
              </Text>

              <Text className="text-gray-600 dark:text-gray-400 text-xs">{kpi.label}</Text>
            </View>
          );
        })}
      </View>
    </ScrollView>
  );
};

export default FarmerDashboardKpiCards;
