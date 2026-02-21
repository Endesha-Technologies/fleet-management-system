import { notFound } from 'next/navigation';
import { MOCK_ROUTES } from '@/constants/routes';
import { Modal } from '@/components/ui/modal';
import { RouteForm } from '../../../_components/RouteForm';
import type { RoutePageProps } from '../../../_types';

export default async function EditRouteModal({ params }: RoutePageProps) {
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
