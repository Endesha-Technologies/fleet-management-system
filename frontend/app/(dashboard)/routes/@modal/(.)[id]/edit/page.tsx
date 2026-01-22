import { notFound } from 'next/navigation';
import { MOCK_ROUTES } from '@/constants/routes';
import { Modal } from '@/components/ui/modal';
import { RouteForm } from '@/components/features/routes/RouteForm';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditRouteModal({ params }: PageProps) {
  const { id } = await params;
  const route = MOCK_ROUTES.find((r) => r.id === id);

  if (!route) {
    notFound();
  }

  return (
    <Modal>
      <RouteForm initialData={route} isEditing />
    </Modal>
  );
}
