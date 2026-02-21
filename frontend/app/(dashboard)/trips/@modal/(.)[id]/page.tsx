import { notFound } from 'next/navigation';
import { MOCK_TRIPS } from '@/constants/trips';
import { Modal } from '@/components/ui/modal';
import { TripDetails } from '../../_components';
import type { TripPageProps } from '../../_types';

export default async function TripDetailsModal({ params }: TripPageProps) {
  const { id } = await params;
  const trip = MOCK_TRIPS.find((t) => t.id === id);

  if (!trip) {
    notFound();
  }

  return (
    <Modal size="2xl">
      <TripDetails trip={trip} />
    </Modal>
  );
}
