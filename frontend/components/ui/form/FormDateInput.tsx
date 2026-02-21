"use client";

import * as React from "react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { FormField } from "./FormField";

export interface FormDateInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> {
  label?: string;
  error?: string;
  description?: string;
  /** When true, renders type="datetime-local" instead of type="date" */
  includeTime?: boolean;
}

const FormDateInput = React.forwardRef<HTMLInputElement, FormDateInputProps>(
  (
    {
      label,
      error,
      description,
      includeTime = false,
      className,
      id,
      required,
      ...props
    },
    ref
  ) => {
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
          type={includeTime ? "datetime-local" : "date"}
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

FormDateInput.displayName = "FormDateInput";

export { FormDateInput };
