"use client";

import * as React from "react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { FormField } from "./FormField";

export interface FormInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  description?: string;
}

const FormInput = React.forwardRef<HTMLInputElement, FormInputProps>(
  ({ label, error, description, className, id, required, ...props }, ref) => {
    const generatedId = React.useId();
    const inputId = id || generatedId;

    return (
      <FormField
        label={label}
        error={error}
        description={description}
        required={required}
        htmlFor={inputId}
      >
        <Input
          id={inputId}
          ref={ref}
          required={required}
          className={cn(error && "border-red-500 focus-visible:ring-red-500", className)}
          {...props}
        />
      </FormField>
    );
  }
);

FormInput.displayName = "FormInput";

export { FormInput };
