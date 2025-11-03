import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { ArrowLeft, Users } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import type { UserRole } from "@/types/auth";

const registerSchema = z
  .object({
    email: z.string().email("Invalid email address"),
    phone: z.string().min(10, "Phone number must be at least 10 digits"),
    name: z.string().min(2, "Name must be at least 2 characters"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string(),
    role: z.enum(["driver", "welder", "student"] as const),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type RegisterFormData = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const { register: registerUser } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedRole, setSelectedRole] = useState<UserRole>("driver");

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      role: "driver",
    },
  });

  const onSubmit = async (data: RegisterFormData) => {
    setIsLoading(true);
    try {
      await registerUser({
        email: data.email,
        phone: data.phone,
        name: data.name,
        password: data.password,
        role: data.role,
      });
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-background p-4 transition-colors duration-300">
      <div className="w-full max-w-md">
        <div className="absolute top-4 right-4 bg-background">
          <ThemeToggle />
        </div>

        <div className="bg-card border border-border rounded-2xl p-8 shadow-xl transition-all duration-300 animate-in fade-in slide-in-from-bottom-4">
          <div className="flex flex-col items-center mb-8">
            <div className="mb-6 p-4 rounded-full bg-emerald-500/10">
              <Users className="w-12 h-12 text-emerald-500" />
            </div>
            <h1 className="text-3xl font-bold mb-2 text-foreground">
              Register Portal
            </h1>
            <p className="text-muted-foreground text-center">
              register to continue as a driver/welder
            </p>
          </div>

          <Tabs defaultValue="register" className="mb-6">
            <TabsList className="grid w-full grid-cols-2 bg-muted/50">
              <TabsTrigger value="login" asChild>
                <Link to="/login" className="cursor-pointer">
                  Login
                </Link>
              </TabsTrigger>
              <TabsTrigger
                value="register"
                className="data-[state=active]:bg-emerald-500 data-[state=active]:text-white transition-all"
              >
                Register
              </TabsTrigger>
            </TabsList>
          </Tabs>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
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
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="Enter phone number"
                {...register("phone")}
                className="h-12 bg-background"
              />
              {errors.phone && (
                <p className="text-sm text-destructive">
                  {errors.phone.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                type="text"
                placeholder="Enter your full name"
                {...register("name")}
                className="h-12 bg-background"
              />
              {errors.name && (
                <p className="text-sm text-destructive">
                  {errors.name.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Minimum 6 characters"
                {...register("password")}
                className="h-12 bg-background"
              />
              {errors.password && (
                <p className="text-sm text-destructive">
                  {errors.password.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="Confirm password"
                {...register("confirmPassword")}
                className="h-12 bg-background"
              />
              {errors.confirmPassword && (
                <p className="text-sm text-destructive">
                  {errors.confirmPassword.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <Select
                value={selectedRole}
                onValueChange={(value: string) => {
                  setSelectedRole(value as UserRole);
                  setValue("role", value as "driver" | "welder" | "student");
                }}
              >
                <SelectTrigger className="h-12 bg-background">
                  <SelectValue placeholder="Select your role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="driver">Candidate (Driver)</SelectItem>
                  <SelectItem value="welder">Candidate (Welder)</SelectItem>
                  <SelectItem value="student">Student</SelectItem>
                </SelectContent>
              </Select>
              {errors.role && (
                <p className="text-sm text-destructive">
                  {errors.role.message}
                </p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full h-12 bg-emerald-500 hover:bg-emerald-600 text-white font-medium transition-all"
              disabled={isLoading}
            >
              {isLoading ? "Creating Account..." : "Create Account"}
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
