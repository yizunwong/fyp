import { useState } from "react";
import { View, Text } from "react-native";
import { User, Lock, Mail, Phone, Hash } from "lucide-react-native";
 
import SubmitButton from "@/components/ui/SubmitButton";
import InputField from "@/components/ui/InputField";

interface FarmerFormProps {
  onSubmit: (data: any) => void;
}

export default function FarmerForm({ onSubmit }: FarmerFormProps) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [nric, setNRIC] = useState("");

  const handleSubmit = () => {
    const payload = {
      role: "farmer",
      username,
      password,
      email: email || undefined,
      phone: phone || undefined,
      nric,
    };
    console.log("Farmer Registration Payload:", payload);
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
        label="NRIC"
        icon={<Hash color="#9ca3af" size={20} />}
        placeholder="Enter your NRIC number"
        value={nric}
        onChangeText={setNRIC}
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

      <SubmitButton
        onPress={handleSubmit}
        title="Register as Farmer"
        gradientColors={["#22c55e", "#059669"]}
        className="rounded-lg overflow-hidden mt-4"
      />
    </View>
  );
}
