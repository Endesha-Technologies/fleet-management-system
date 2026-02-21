import { RouteForm } from '../_components/RouteForm';

export default function CreateRoutePage() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <RouteForm />
      </div>
    </div>
  );
}
