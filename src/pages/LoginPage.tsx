import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { ArrowLeft, Users } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Navigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ThemeToggle } from "@/components/ui/ThemeToggle";

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const { login, token, user, isLoading: authLoading } = useAuth();
  const [formLoading, setFormLoading] = useState(false);

  // If auth state is still loading, show spinner. If authenticated, redirect.
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  if (token && user) {
    switch (user.role) {
      case "admin":
        return <Navigate to="/dashboard/admin" replace />;
      case "driver":
        return <Navigate to="/dashboard/driver" replace />;
      case "welder":
        return <Navigate to="/dashboard/welder" replace />;
      case "student":
        return <Navigate to="/dashboard/student" replace />;
      default:
        return <Navigate to="/dashboard" replace />;
    }
  }

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    setFormLoading(true);
    try {
      await login(data.email, data.password);
    } catch (error) {
      console.error(error);
    } finally {
      setFormLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-background p-4 transition-colors duration-300">
      <div className="w-full max-w-md">
        <div className="absolute top-4 right-4">
          <ThemeToggle />
        </div>

        <div className="bg-card border border-border rounded-2xl p-8 shadow-xl transition-all duration-300 animate-in fade-in slide-in-from-bottom-4">
          <div className="flex flex-col items-center mb-8">
            <div className="mb-6 p-4 rounded-full bg-emerald-500/10">
              <Users className="w-12 h-12 text-emerald-500" />
            </div>
            <h1 className="text-3xl font-bold mb-2 text-foreground">
              Login Portal
            </h1>
            <p className="text-muted-foreground text-center">
              Login to continue as a driver/welder
            </p>
          </div>

          <Tabs defaultValue="login" className="mb-6">
            <TabsList className="grid w-full grid-cols-2 bg-muted/50">
              <TabsTrigger
                value="login"
                className="data-[state=active]:bg-emerald-500 data-[state=active]:text-white transition-all"
              >
                Login
              </TabsTrigger>
              <TabsTrigger value="register" asChild>
                <Link to="/register" className="cursor-pointer">
                  Register
                </Link>
              </TabsTrigger>
            </TabsList>
          </Tabs>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter email"
                {...register("email")}
                className="h-12 bg-background"
              />
              {errors.email && (
                <p className="text-sm text-destructive">
                  {errors.email.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter password"
                {...register("password")}
                className="h-12 bg-background"
              />
              {errors.password && (
                <p className="text-sm text-destructive">
                  {errors.password.message}
                </p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full h-12 bg-emerald-500 hover:bg-emerald-600 text-white font-medium transition-all"
              disabled={formLoading}
            >
              {formLoading ? "Signing In..." : "Sign In"}
            </Button>
          </form>

          <div className="mt-8 text-center">
            <Link
              to="/"
              className="inline-flex items-center gap-2 text-emerald-500 hover:text-emerald-600 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
