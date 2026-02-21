"use client";

import * as React from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

export interface FormCheckboxProps {
  label: string;
  error?: string;
  description?: string;
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  disabled?: boolean;
  className?: string;
}

const FormCheckbox = React.forwardRef<HTMLInputElement, FormCheckboxProps>(
  (
    { label, error, description, checked, onCheckedChange, disabled, className },
    ref
  ) => {
    const generatedId = React.useId();

    const handleChange = React.useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        onCheckedChange?.(e.target.checked);
      },
      [onCheckedChange]
    );

    return (
      <div className={cn("space-y-2", className)}>
        <div className="flex items-center space-x-2">
          <Checkbox
            id={generatedId}
            ref={ref}
            checked={checked}
            onChange={handleChange}
            disabled={disabled}
          />
          <Label
            htmlFor={generatedId}
            className="cursor-pointer font-normal"
          >
            {label}
          </Label>
        </div>
        {description && !error && (
          <p className="text-sm text-muted-foreground">{description}</p>
        )}
        {error && <p className="text-sm text-red-500">{error}</p>}
      </div>
    );
  }
);

FormCheckbox.displayName = "FormCheckbox";

export { FormCheckbox };
