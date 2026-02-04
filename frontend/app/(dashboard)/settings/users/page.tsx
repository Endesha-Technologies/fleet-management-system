import { UsersTab } from '@/components/settings/UsersTab';

export const metadata = {
  title: 'Users Settings',
  description: 'Manage system users and their roles',
};

export default function UsersPage() {
  return <UsersTab />;
}
