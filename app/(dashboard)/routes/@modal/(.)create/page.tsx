import { Modal } from '@/components/ui/modal';
import { RouteForm } from '@/components/features/routes/RouteForm';

export default function CreateRouteModal() {
  return (
    <Modal>
      <RouteForm />
    </Modal>
  );
}
