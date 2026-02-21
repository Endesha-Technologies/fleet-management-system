import { notFound } from 'next/navigation';
import { MOCK_ROUTES } from '@/constants/routes';
import { RouteForm } from '../../_components/RouteForm';
import type { RoutePageProps } from '../../_types';

export default async function EditRoutePage({ params }: RoutePageProps) {
  const { id } = await params;
  const route = MOCK_ROUTES.find((r) => r.id === id);

  if (!route) {
    notFound();
  }

  return (
    <div className="max-w-2xl mx-auto py-8 h-[calc(100vh-4rem)]">
      <div className="bg-white rounded-lg shadow-lg h-full p-6">
        <RouteForm initialData={route} isEditing />
      </div>
    </div>
  );
}
