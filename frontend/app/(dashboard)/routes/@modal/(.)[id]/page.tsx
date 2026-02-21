import { notFound } from 'next/navigation';
import { MOCK_ROUTES } from '@/constants/routes';
import { Modal } from '@/components/ui/modal';
import { RouteDetails } from '../../_components/RouteDetails';
import type { RoutePageProps } from '../../_types';

export default async function RouteDetailsModal({ params }: RoutePageProps) {
  const { id } = await params;
  const route = MOCK_ROUTES.find((r) => r.id === id);

  if (!route) {
    notFound();
  }

  return (
    <Modal>
      <RouteDetails route={route} />
    </Modal>
  );
}
