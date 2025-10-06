import { useState } from "react";

import {
  Sprout,
  Store,
  Building2,
  Lock,
  Mail,
  ChevronRight,
} from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

type UserRole = "farmer" | "retailer" | "government" | null;

const roles = [
  {
    id: "farmer" as const,
    label: "Farmer",
    icon: Sprout,
    description: "Manage crops and supply chain",
    gradient: "from-green-500 to-emerald-600",
  },
  {
    id: "retailer" as const,
    label: "Retailer",
    icon: Store,
    description: "Track product distribution",
    gradient: "from-blue-500 to-cyan-600",
  },
  {
    id: "government" as const,
    label: "Government Agency",
    icon: Building2,
    description: "Monitor and regulate",
    gradient: "from-purple-500 to-indigo-600",
  },
];

interface LoginFormProps {
  onNavigateToRegister: () => void;
}

export default function LoginPage({ onNavigateToRegister }: LoginFormProps) {
  const [selectedRole, setSelectedRole] = useState<UserRole>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Login attempt:", { email, password, role: selectedRole });
    // Handle login logic here
  };

  const handleGoogleLogin = () => {
    console.log("Google login attempt for role:", selectedRole);
    // Handle Google OAuth login here
    // In production, this would redirect to Google OAuth
  };

  const handleBackToRoles = () => {
    setSelectedRole(null);
    setEmail("");
    setPassword("");
  };

  return (
    <Card className="w-full max-w-5xl shadow-2xl border-0 overflow-hidden">
      <div className="grid md:grid-cols-2 gap-0">
        {/* Left side - Branding */}
        <div className="bg-gradient-to-br from-green-600 via-emerald-600 to-teal-700 p-8 md:p-12 flex flex-col justify-between text-white">
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-white/20 backdrop-blur rounded-xl flex items-center justify-center">
                <Sprout className="w-7 h-7" />
              </div>
              <div>
                <h1 className="text-white">AgriChain</h1>
                <p className="text-emerald-100 text-sm">
                  Blockchain Agriculture Platform
                </p>
              </div>
            </div>

            <div className="space-y-6 mt-12">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                  <Lock className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-white mb-1">Secure & Transparent</h3>
                  <p className="text-emerald-100 text-sm opacity-90">
                    Blockchain-powered traceability for the entire agricultural
                    supply chain
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                  <ChevronRight className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-white mb-1">Real-time Tracking</h3>
                  <p className="text-emerald-100 text-sm opacity-90">
                    Monitor your products from farm to table with complete
                    transparency
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-12 pt-6 border-t border-white/20">
            <p className="text-emerald-100 text-sm">
              Empowering sustainable agriculture through blockchain technology
            </p>
          </div>
        </div>

        {/* Right side - Login Form */}
        <div className="p-8 md:p-12">
          {selectedRole && (
            <div className="mb-6">
              <button
                type="button"
                onClick={handleBackToRoles}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-br from-muted to-muted/50 hover:from-muted/80 hover:to-muted/30 transition-all duration-200 group border border-border/50"
              >
                <div
                  className={`w-8 h-8 rounded-md bg-gradient-to-br ${
                    roles.find((r) => r.id === selectedRole)?.gradient
                  } flex items-center justify-center flex-shrink-0`}
                >
                  {(() => {
                    const Icon = roles.find((r) => r.id === selectedRole)?.icon;
                    return Icon ? (
                      <Icon className="w-4 h-4 text-white" />
                    ) : null;
                  })()}
                </div>
                <div className="text-left">
                  <p className="text-xs text-muted-foreground">Signing in as</p>
                  <p className="text-sm text-foreground group-hover:text-primary transition-colors">
                    {roles.find((r) => r.id === selectedRole)?.label}
                  </p>
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground ml-2 rotate-90 group-hover:rotate-180 transition-transform duration-200" />
              </button>
            </div>
          )}

          <CardHeader className="p-0 mb-8">
            <CardTitle>
              {selectedRole ? "Welcome Back" : "Welcome Back"}
            </CardTitle>
            <CardDescription>
              {selectedRole
                ? "Enter your credentials to access your account"
                : "Select your role to continue"}
            </CardDescription>
          </CardHeader>

          <CardContent className="p-0">
            {!selectedRole ? (
              // Role Selection
              <div className="space-y-4">
                {roles.map((role) => {
                  const Icon = role.icon;
                  return (
                    <button
                      key={role.id}
                      onClick={() => setSelectedRole(role.id)}
                      className="w-full p-4 rounded-xl border-2 border-border hover:border-primary transition-all duration-200 flex items-center gap-4 group hover:shadow-md bg-white"
                    >
                      <div
                        className={`w-12 h-12 rounded-lg bg-gradient-to-br ${role.gradient} flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform`}
                      >
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                      <div className="text-left flex-1">
                        <h4 className="text-foreground group-hover:text-primary transition-colors">
                          {role.label}
                        </h4>
                        <p className="text-muted-foreground text-sm">
                          {role.description}
                        </p>
                      </div>
                      <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                    </button>
                  );
                })}
              </div>
            ) : (
              // Login Form
              <form onSubmit={handleLogin} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      id="password"
                      type="password"
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end text-sm">
                  <a href="#" className="text-primary hover:underline">
                    Forgot password?
                  </a>
                </div>

                <Button type="submit" className="w-full">
                  Sign In
                </Button>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <Separator />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-white px-2 text-muted-foreground">
                      Or continue with
                    </span>
                  </div>
                </div>

                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={handleGoogleLogin}
                >
                  <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                  Sign in with Google
                </Button>

                <div className="text-center text-sm text-muted-foreground">
                  Don&apos;t have an account?{" "}
                  <button
                    type="button"
                    onClick={onNavigateToRegister}
                    className="text-primary hover:underline"
                  >
                    Register here
                  </button>
                </div>
              </form>
            )}
          </CardContent>
        </div>
      </div>
    </Card>
  );
}
