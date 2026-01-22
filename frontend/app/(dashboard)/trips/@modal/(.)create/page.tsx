import { Modal } from '@/components/ui/modal';
import { TripForm } from '@/components/features/trips/TripForm';

export default function CreateTripModal() {
  return (
    <Modal size="2xl">
      <TripForm />
    </Modal>
  );
}
