import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useAuthStore } from "@/lib/auth/store";
import { loginSchema, type LoginFormData } from "@/lib/auth/validation";

export function LoginForm() {
  const { setUser, setLoading } = useAuthStore();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      setLoading(true);
      setServerError(null);

      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Login failed");
      }

      setUser(result.user);
      window.location.href = "/generate"; // Redirect to generate page after login
    } catch (error) {
      setServerError(error instanceof Error ? error.message : "An unknown error occurred");
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6" data-test-id="login-form-container">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" data-test-id="login-form">
        <div className="space-y-2">
          <Input
            {...register("email")}
            type="email"
            placeholder="Email"
            aria-label="Email"
            disabled={isSubmitting}
            data-test-id="login-email-input"
          />
          {errors.email && (
            <p className="text-sm text-red-500" data-test-id="login-email-error">
              {errors.email.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Input
            {...register("password")}
            type="password"
            placeholder="Password"
            aria-label="Password"
            disabled={isSubmitting}
            data-test-id="login-password-input"
          />
          {errors.password && (
            <p className="text-sm text-red-500" data-test-id="login-password-error">
              {errors.password.message}
            </p>
          )}
        </div>

        {serverError && (
          <Alert variant="destructive" data-test-id="login-error">
            <AlertDescription>{serverError}</AlertDescription>
          </Alert>
        )}

        <Button type="submit" className="w-full" disabled={isSubmitting} data-test-id="login-submit-button">
          {isSubmitting ? "Signing in..." : "Sign in"}
        </Button>
      </form>

      <div className="flex justify-between text-sm">
        <a
          href="/auth/register"
          className="text-muted-foreground hover:text-primary"
          data-test-id="create-account-link"
        >
          Create account
        </a>
        <a
          href="/auth/forgot-password"
          className="text-muted-foreground hover:text-primary"
          data-test-id="forgot-password-link"
        >
          Forgot password?
        </a>
      </div>
    </div>
  );
}
