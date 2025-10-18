import { useState } from "react";
import { View, Text, TextInput, TouchableOpacity } from "react-native";
import { User, Lock, Mail, Phone, MapPin, Hash } from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";

interface FarmerFormProps {
  onSubmit: (data: any) => void;
}

export default function FarmerForm({ onSubmit }: FarmerFormProps) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [nationalId, setNationalId] = useState("");
  const [region, setRegion] = useState("");

  const handleSubmit = () => {
    const payload = {
      role: "farmer",
      username,
      password,
      email: email || undefined,
      phone: phone || undefined,
      nationalId,
      region,
    };
    console.log("Farmer Registration Payload:", payload);
    onSubmit(payload);
  };

  return (
    <View className="gap-6">
      <View className="gap-2">
        <Text className="text-gray-700 text-sm font-semibold">Username</Text>
        <View className="flex-row items-center border border-gray-300 rounded-lg bg-white">
          <View className="ml-3">
            <User color="#9ca3af" size={20} />
          </View>
          <TextInput
            className="flex-1 h-12 px-3 text-gray-900 text-[15px]"
            placeholder="Enter your username"
            placeholderTextColor="#9ca3af"
            value={username}
            onChangeText={setUsername}
            autoCapitalize="none"
            autoComplete="username"
          />
        </View>
      </View>

      <View className="gap-2">
        <Text className="text-gray-700 text-sm font-semibold">Password</Text>
        <View className="flex-row items-center border border-gray-300 rounded-lg bg-white">
          <View className="ml-3">
            <Lock color="#9ca3af" size={20} />
          </View>
          <TextInput
            className="flex-1 h-12 px-3 text-gray-900 text-[15px]"
            placeholder="Create a password"
            placeholderTextColor="#9ca3af"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            autoCapitalize="none"
            autoComplete="password-new"
          />
        </View>
      </View>

      <View className="gap-2">
        <Text className="text-gray-700 text-sm font-semibold">
          Email <Text className="text-gray-400 text-xs">(Optional)</Text>
        </Text>
        <View className="flex-row items-center border border-gray-300 rounded-lg bg-white">
          <View className="ml-3">
            <Mail color="#9ca3af" size={20} />
          </View>
          <TextInput
            className="flex-1 h-12 px-3 text-gray-900 text-[15px]"
            placeholder="Enter your email"
            placeholderTextColor="#9ca3af"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
          />
        </View>
      </View>

      <View className="gap-2">
        <Text className="text-gray-700 text-sm font-semibold">
          Phone <Text className="text-gray-400 text-xs">(Optional)</Text>
        </Text>
        <View className="flex-row items-center border border-gray-300 rounded-lg bg-white">
          <View className="ml-3">
            <Phone color="#9ca3af" size={20} />
          </View>
          <TextInput
            className="flex-1 h-12 px-3 text-gray-900 text-[15px]"
            placeholder="Enter your phone number"
            placeholderTextColor="#9ca3af"
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
            autoComplete="tel"
          />
        </View>
      </View>

      <View className="border-t border-gray-200 mt-6 pt-4">
        <Text className="text-gray-900 text-base font-semibold mb-4">
          Farmer Information
        </Text>

        <View className="gap-4">
          <View className="gap-2">
            <Text className="text-gray-700 text-sm font-semibold">
              National ID
            </Text>
            <View className="flex-row items-center border border-gray-300 rounded-lg bg-white">
              <View className="ml-3">
                <Hash color="#9ca3af" size={20} />
              </View>
              <TextInput
                className="flex-1 h-12 px-3 text-gray-900 text-[15px]"
                placeholder="Enter your national ID"
                placeholderTextColor="#9ca3af"
                value={nationalId}
                onChangeText={setNationalId}
              />
            </View>
          </View>

          <View className="gap-2">
            <Text className="text-gray-700 text-sm font-semibold">Region</Text>
            <View className="flex-row items-center border border-gray-300 rounded-lg bg-white">
              <View className="ml-3">
                <MapPin color="#9ca3af" size={20} />
              </View>
              <TextInput
                className="flex-1 h-12 px-3 text-gray-900 text-[15px]"
                placeholder="Enter your region"
                placeholderTextColor="#9ca3af"
                value={region}
                onChangeText={setRegion}
              />
            </View>
          </View>
        </View>
      </View>

      <TouchableOpacity
        onPress={handleSubmit}
        className="rounded-lg overflow-hidden mt-4"
      >
        <LinearGradient
          colors={["#22c55e", "#059669"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          className="h-12 items-center justify-center"
        >
          <Text className="text-white text-[15px] font-semibold">
            Register as Farmer
          </Text>
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );
}
