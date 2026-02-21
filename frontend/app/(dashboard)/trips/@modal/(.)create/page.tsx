import { Modal } from '@/components/ui/modal';
import { TripForm } from '../../_components';

export default function CreateTripModal() {
  return (
    <Modal size="2xl">
      <TripForm />
    </Modal>
  );
}
