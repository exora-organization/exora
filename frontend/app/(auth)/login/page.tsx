"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { signIn } from "../../../lib/firebase/auth";
import { apiAuth } from "../../../lib/api/auth";
import { apiUsers } from "../../../lib/api/users";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "../../../components/ui/card";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import { Button } from "../../../components/ui/button";

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectPath = searchParams.get("redirect");
  
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormValues) => {
    setIsLoading(true);
    setError(null);

    try {
      // 1. Firebase Auth
      const userCredential = await signIn(data.email, data.password);
      
      // Force set the cookie immediately to prevent middleware race condition
      const token = await userCredential.user.getIdToken();
      document.cookie = `firebaseToken=${token}; path=/; max-age=3600; Secure; SameSite=Strict`;
      
      // 2. Sync session with backend (FR-001)
      await apiAuth.login();
      
      // 3. Fetch profile to determine routing
      const profileRes = await apiUsers.getCurrentUser();
      const role = profileRes.data?.role;
      
      // 4. Redirect
      if (redirectPath) {
        router.push(redirectPath);
      } else {
        if (role === "guest") {
          const companyId = profileRes.data?.companyId;
          const status = profileRes.data?.companyStatus;
          if (companyId || status) {
            router.push("/application-status");
          } else {
            router.push("/company-application");
          }
        } else if (role === "admin") {
          router.push("/admin-dashboard");
        } else if (role === "company_owner") {
          router.push("/owner-dashboard");
        } else if (role === "export_manager") {
          router.push("/export-manager-dashboard");
        } else if (role === "finance_staff") {
          router.push("/finance-dashboard");
        } else {
          router.push("/");
        }
      }
    } catch (err: any) {
      setError(err.message || "Failed to login. Please check your credentials.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Login to EXORA</CardTitle>
        <CardDescription>Enter your email and password to access your account.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="name@example.com"
              {...register("email")}
            />
            {errors.email && (
              <p className="text-sm text-red-500">{errors.email.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              {...register("password")}
            />
            {errors.password && (
              <p className="text-sm text-red-500">{errors.password.message}</p>
            )}
          </div>
          
          {error && (
            <div className="p-3 text-sm bg-red-50 text-red-500 rounded-md">
              {error}
            </div>
          )}
          
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Signing in..." : "Sign In"}
          </Button>
        </form>
      </CardContent>
      <CardFooter className="flex flex-col space-y-2 text-sm text-center text-gray-500">
        <div>
          Don't have an account?{" "}
          <a href={`/register${redirectPath ? `?redirect=${encodeURIComponent(redirectPath)}` : ""}`} className="text-blue-500 hover:underline">
            Register here
          </a>
        </div>
        <div>
          <a href="/reset-password" className="text-blue-500 hover:underline">
            Forgot password?
          </a>
        </div>
      </CardFooter>
    </Card>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LoginForm />
    </Suspense>
  );
}
