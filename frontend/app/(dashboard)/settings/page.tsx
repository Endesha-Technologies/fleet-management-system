import { redirect } from 'next/navigation';

// ---------------------------------------------------------------------------
// Settings root page — redirects to the default sub-section
// ---------------------------------------------------------------------------
// The settings layout renders a persistent sidebar for navigation. The root
// `/settings` route simply redirects to the first enabled section so that
// the content area is never empty.
// ---------------------------------------------------------------------------

export default function SettingsPage() {
  redirect('/settings/users');
}
