import { useState } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { User, Lock, Mail, Phone, Building, MapPin } from "lucide-react-native";
 
import SubmitButton from "@/components/ui/SubmitButton";
import InputField from "@/components/ui/InputField";

interface RetailerFormProps {
  onSubmit: (data: any) => void;
}

export default function RetailerForm({ onSubmit }: RetailerFormProps) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [company, setCompany] = useState("");
  const [address, setAddress] = useState("");

  const handleSubmit = () => {
    const payload = {
      role: "retailer",
      username,
      password,
      email: email || undefined,
      phone: phone || undefined,
      company,
      address,
    };
    console.log("Retailer Registration Payload:", payload);
    onSubmit(payload);
  };

  return (
    <View className="gap-6">
      <InputField
        label="Username"
        icon={<User color="#9ca3af" size={20} />}
        placeholder="Enter your username"
        value={username}
        onChangeText={setUsername}
        autoCapitalize="none"
        autoComplete="username"
      />

      <InputField
        label="Password"
        icon={<Lock color="#9ca3af" size={20} />}
        placeholder="Create a password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        autoCapitalize="none"
        autoComplete="password-new"
      />

      <InputField
        label={
          <Text className="text-gray-700 text-sm font-semibold">
            Email <Text className="text-gray-400 text-xs">(Optional)</Text>
          </Text>
        }
        icon={<Mail color="#9ca3af" size={20} />}
        placeholder="Enter your email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        autoComplete="email"
      />

      <InputField
        label={
          <Text className="text-gray-700 text-sm font-semibold">
            Phone <Text className="text-gray-400 text-xs">(Optional)</Text>
          </Text>
        }
        icon={<Phone color="#9ca3af" size={20} />}
        placeholder="Enter your phone number"
        value={phone}
        onChangeText={setPhone}
        keyboardType="phone-pad"
        autoComplete="tel"
      />

      <View className="border-t border-gray-200 mt-6 pt-4">
        <Text className="text-gray-900 text-base font-semibold mb-4">
          Retailer Information
        </Text>

        <View className="gap-4">
          <InputField
            label="Company Name"
            icon={<Building color="#9ca3af" size={20} />}
            placeholder="Enter your company name"
            value={company}
            onChangeText={setCompany}
          />

          <InputField
            label="Business Address"
            icon={<MapPin color="#9ca3af" size={20} />}
            placeholder="Enter your business address"
            value={address}
            onChangeText={setAddress}
          />
        </View>
      </View>

      <SubmitButton
        onPress={handleSubmit}
        title="Register as Retailer"
        gradientColors={["#3b82f6", "#06b6d4"]}
        className="rounded-lg overflow-hidden mt-4"
      />
    </View>
  );
}
