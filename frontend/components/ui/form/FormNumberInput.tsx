"use client";

import * as React from "react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { FormField } from "./FormField";

export interface FormNumberInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> {
  label?: string;
  error?: string;
  description?: string;
}

const FormNumberInput = React.forwardRef<HTMLInputElement, FormNumberInputProps>(
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
          type="number"
          required={required}
          className={cn(
            error && "border-red-500 focus-visible:ring-red-500",
            className
          )}
          {...props}
        />
      </FormField>
    );
  }
);

FormNumberInput.displayName = "FormNumberInput";

export { FormNumberInput };
