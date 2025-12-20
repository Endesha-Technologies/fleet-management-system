import { notFound } from 'next/navigation';
import { MOCK_TRIPS } from '@/constants/trips';
import { Modal } from '@/components/ui/modal';
import { TripForm } from '@/components/features/trips/TripForm';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditTripModal({ params }: PageProps) {
  const { id } = await params;
  const trip = MOCK_TRIPS.find((t) => t.id === id);

  if (!trip) {
    notFound();
  }

  return (
    <Modal size="2xl">
      <TripForm initialData={trip} isEditing />
    </Modal>
  );
}
