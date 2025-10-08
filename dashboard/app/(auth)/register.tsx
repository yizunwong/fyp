import { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";

export default function RegisterScreen() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleRegister = () => {
    if (password !== confirmPassword) {
      // Basic client-side check
      alert("Passwords do not match");
      return;
    }
    // TODO: wire up API
    router.replace("/home");
  };

  return (
    <ScrollView className="flex-1 bg-gray-50">
      <View className="gap-6 p-8">
        <Text className="text-gray-900 text-3xl font-bold">Create account</Text>
        <View className="gap-2">
          <Text className="text-gray-700 text-sm font-semibold">Full Name</Text>
          <TextInput
            className="h-12 px-3 rounded-lg border border-gray-300 bg-white text-gray-900"
            placeholder="Enter your full name"
            placeholderTextColor="#9ca3af"
            value={fullName}
            onChangeText={setFullName}
          />
        </View>
        <View className="gap-2">
          <Text className="text-gray-700 text-sm font-semibold">Email</Text>
          <TextInput
            className="h-12 px-3 rounded-lg border border-gray-300 bg-white text-gray-900"
            placeholder="Enter your email"
            placeholderTextColor="#9ca3af"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            autoComplete="email"
          />
        </View>
        <View className="gap-2">
          <Text className="text-gray-700 text-sm font-semibold">Password</Text>
          <TextInput
            className="h-12 px-3 rounded-lg border border-gray-300 bg-white text-gray-900"
            placeholder="Create a password"
            placeholderTextColor="#9ca3af"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            autoCapitalize="none"
            autoComplete="password-new"
          />
        </View>
        <View className="gap-2">
          <Text className="text-gray-700 text-sm font-semibold">Confirm Password</Text>
          <TextInput
            className="h-12 px-3 rounded-lg border border-gray-300 bg-white text-gray-900"
            placeholder="Re-enter your password"
            placeholderTextColor="#9ca3af"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
            autoCapitalize="none"
            autoComplete="password-new"
          />
        </View>
        <TouchableOpacity onPress={handleRegister} className="rounded-lg overflow-hidden">
          <LinearGradient
            colors={["#059669", "#10b981"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            className="h-12 items-center justify-center"
          >
            <Text className="text-white text-[15px] font-semibold">Sign Up</Text>
          </LinearGradient>
        </TouchableOpacity>
        <View className="flex-row justify-center items-center">
          <Text className="text-gray-600 text-sm">Already have an account? </Text>
          <TouchableOpacity onPress={() => router.push("/login")}>
            <Text className="text-emerald-600 text-sm font-semibold">Sign in</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}
//                       <div
//                         className={`w-12 h-12 rounded-lg bg-gradient-to-br ${role.gradient} flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform`}
//                       >
//                         <Icon className="w-6 h-6 text-white" />
//                       </div>
//                       <div className="text-left flex-1">
//                         <h4 className="text-foreground group-hover:text-primary transition-colors">
//                           {role.label}
//                         </h4>
//                         <p className="text-muted-foreground text-sm">
//                           {role.description}
//                         </p>
//                       </div>
//                       <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
//                     </button>
//                   );
//                 })}

//                 <div className="text-center text-sm text-muted-foreground pt-4">
//                   Already have an account?{" "}
//                   <button
//                     type="button"
//                     onClick={() => router.push("/login")}
//                     className="text-primary hover:underline"
//                   >
//                     Sign in here
//                   </button>
//                 </div>
//               </div>
//             ) : (
//               // Registration Form
//               <form onSubmit={handleRegister} className="space-y-5">
//                 <div className="space-y-2">
//                   <Label htmlFor="fullName">Full Name</Label>
//                   <div className="relative">
//                     <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
//                     <Input
//                       id="fullName"
//                       type="text"
//                       placeholder="Enter your full name"
//                       value={fullName}
//                       onChange={(e) => setFullName(e.target.value)}
//                       className="pl-10"
//                       required
//                     />
//                   </div>
//                 </div>

//                 <div className="space-y-2">
//                   <Label htmlFor="email">Email Address</Label>
//                   <div className="relative">
//                     <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
//                     <Input
//                       id="email"
//                       type="email"
//                       placeholder="Enter your email"
//                       value={email}
//                       onChange={(e) => setEmail(e.target.value)}
//                       className="pl-10"
//                       required
//                     />
//                   </div>
//                 </div>

//                 <div className="space-y-2">
//                   <Label htmlFor="password">Password</Label>
//                   <div className="relative">
//                     <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
//                     <Input
//                       id="password"
//                       type="password"
//                       placeholder="Create a password"
//                       value={password}
//                       onChange={(e) => setPassword(e.target.value)}
//                       className="pl-10"
//                       required
//                     />
//                   </div>
//                 </div>

//                 <div className="space-y-2">
//                   <Label htmlFor="confirmPassword">Confirm Password</Label>
//                   <div className="relative">
//                     <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
//                     <Input
//                       id="confirmPassword"
//                       type="password"
//                       placeholder="Confirm your password"
//                       value={confirmPassword}
//                       onChange={(e) => setConfirmPassword(e.target.value)}
//                       className="pl-10"
//                       required
//                     />
//                   </div>
//                 </div>

//                 <Button type="submit" className="w-full">
//                   Create Account
//                 </Button>

//                 <div className="relative">
//                   <div className="absolute inset-0 flex items-center">
//                     <Separator />
//                   </div>
//                   <div className="relative flex justify-center text-xs uppercase">
//                     <span className="bg-white px-2 text-muted-foreground">
//                       Or continue with
//                     </span>
//                   </div>
//                 </div>

//                 <Button
//                   type="button"
//                   variant="outline"
//                   className="w-full"
//                   onClick={handleGoogleRegister}
//                 >
//                   <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
//                     <path
//                       fill="#4285F4"
//                       d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
//                     />
//                     <path
//                       fill="#34A853"
//                       d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
//                     />
//                     <path
//                       fill="#FBBC05"
//                       d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
//                     />
//                     <path
//                       fill="#EA4335"
//                       d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
//                     />
//                   </svg>
//                   Sign up with Google
//                 </Button>

//                 <div className="text-center text-sm text-muted-foreground">
//                   Already have an account?{" "}
//                   <button
//                     type="button"
//                     onClick={() => router.push("/login")}
//                     className="text-primary hover:underline"
//                   >
//                     Sign in here
//                   </button>
//                 </div>
//               </form>
//             )}
//           </CardContent>
//         </div>
//       </div>
//     </Card>
//   );
// }
