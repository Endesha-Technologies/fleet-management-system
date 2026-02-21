import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Settings',
  description: 'System configuration and administration',
};

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
