"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { FormInput, FormCheckbox } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { authService } from "@/api/auth/auth.service";
import type { LoginFormState, LoginFormErrors } from "../_types";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const INITIAL_STATE: LoginFormState = {
  email: "",
  password: "",
  rememberMe: false,
};

// ---------------------------------------------------------------------------
// Validation
// ---------------------------------------------------------------------------

function validate(values: LoginFormState): LoginFormErrors {
  const errors: LoginFormErrors = {};

  if (!values.email.trim()) {
    errors.email = "Email is required";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) {
    errors.email = "Enter a valid email address";
  }

  if (!values.password) {
    errors.password = "Password is required";
  } else if (values.password.length < 6) {
    errors.password = "Password must be at least 6 characters";
  }

  return errors;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function LoginForm() {
  const router = useRouter();
  const [formData, setFormData] = React.useState<LoginFormState>(INITIAL_STATE);
  const [errors, setErrors] = React.useState<LoginFormErrors>({});
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const handleChange = React.useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const { name, value } = e.target;
      setFormData((prev) => ({ ...prev, [name]: value }));
      // Clear field error on change
      setErrors((prev) => ({ ...prev, [name]: undefined, form: undefined }));
    },
    [],
  );

  const handleRememberMe = React.useCallback((checked: boolean) => {
    setFormData((prev) => ({ ...prev, rememberMe: checked }));
  }, []);

  const handleSubmit = React.useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();

      const validationErrors = validate(formData);
      if (Object.keys(validationErrors).length > 0) {
        setErrors(validationErrors);
        return;
      }

      setIsSubmitting(true);
      setErrors({});

      try {
        await authService.login({
          email: formData.email,
          password: formData.password,
        });
        router.push("/dashboard");
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Login failed. Please try again.";
        setErrors({ form: message });
      } finally {
        setIsSubmitting(false);
      }
    },
    [formData, router],
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      <FormInput
        label="Email address"
        name="email"
        type="email"
        autoComplete="email"
        placeholder="you@example.com"
        value={formData.email}
        onChange={handleChange}
        error={errors.email}
        required
        disabled={isSubmitting}
      />

      <FormInput
        label="Password"
        name="password"
        type="password"
        autoComplete="current-password"
        placeholder="••••••••"
        value={formData.password}
        onChange={handleChange}
        error={errors.password}
        required
        disabled={isSubmitting}
      />

      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <FormCheckbox
            label="Remember me"
            checked={formData.rememberMe}
            onCheckedChange={handleRememberMe}
            disabled={isSubmitting}
          />
        </div>
      </div>

      {errors.form && (
        <p className="text-sm text-red-500 text-center" role="alert">
          {errors.form}
        </p>
      )}

      <Button
        type="submit"
        className="w-full bg-[#020887] hover:bg-[#020887] text-white"
        disabled={isSubmitting}
      >
        {isSubmitting ? "Signing in…" : "Sign in"}
      </Button>
    </form>
  );
}
