'use client';

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import type { SettingsPageHeaderProps } from '../_types';

export function SettingsPageHeader({
  title,
  description,
  backHref,
  action,
}: SettingsPageHeaderProps) {
  return (
    <header className="mb-8 space-y-1">
      {/* Back link */}
      {backHref && (
        <Link
          href={backHref}
          className="mb-2 inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Settings
        </Link>
      )}

      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">
            {title}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">{description}</p>
        </div>

        {/* Optional action slot (e.g., "Add User" button) */}
        {action && <div className="shrink-0">{action}</div>}
      </div>
    </header>
  );
}
