"use client";

import * as React from "react";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { FormField } from "./FormField";

export interface FormTextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  description?: string;
}

const FormTextarea = React.forwardRef<HTMLTextAreaElement, FormTextareaProps>(
  ({ label, error, description, className, id, required, ...props }, ref) => {
    const generatedId = React.useId();
    const textareaId = id || generatedId;

    return (
      <FormField
        label={label}
        error={error}
        description={description}
        required={required}
        htmlFor={textareaId}
      >
        <Textarea
          id={textareaId}
          ref={ref}
          required={required}
          className={cn(
            error && "border-red-500 focus:ring-red-500",
            className
          )}
          {...props}
        />
      </FormField>
    );
  }
);

FormTextarea.displayName = "FormTextarea";

export { FormTextarea };
