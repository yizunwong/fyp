import { useState } from "react";
import { View, Text, TextInput, TouchableOpacity } from "react-native";
import { User, Lock, Mail, Phone, Building2 } from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";

interface AgencyFormProps {
  onSubmit: (data: any) => void;
}

export default function AgencyForm({ onSubmit }: AgencyFormProps) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [department, setDepartment] = useState("");

  const handleSubmit = () => {
    const payload = {
      role: "agency",
      username,
      password,
      email: email || undefined,
      phone: phone || undefined,
      department,
    };
    console.log("Agency Registration Payload:", payload);
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
          Agency Information
        </Text>

        <View className="gap-4">
          <View className="gap-2">
            <Text className="text-gray-700 text-sm font-semibold">
              Department
            </Text>
            <View className="flex-row items-center border border-gray-300 rounded-lg bg-white">
              <View className="ml-3">
                <Building2 color="#9ca3af" size={20} />
              </View>
              <TextInput
                className="flex-1 h-12 px-3 text-gray-900 text-[15px]"
                placeholder="Enter your department"
                placeholderTextColor="#9ca3af"
                value={department}
                onChangeText={setDepartment}
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
          colors={["#8b5cf6", "#7c3aed"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          className="h-12 items-center justify-center"
        >
          <Text className="text-white text-[15px] font-semibold">
            Register as Agency
          </Text>
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );
}
