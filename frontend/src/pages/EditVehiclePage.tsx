import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import VehicleForm from '../components/VehicleForm';
import QRCodeModal from '../components/QRCodeModal';
import { vehicleApi } from '../api/vehicles';
import { CreateVehicleDto } from '../types/vehicle';
import { useVehicle } from '../hooks/useVehicles';
import toast from 'react-hot-toast';

const EditVehiclePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { vehicle, isLoading: loadingVehicle, error } = useVehicle(id!);
  const [isSaving, setIsSaving] = useState(false);
  const [showQR, setShowQR] = useState(false);

  const handleSubmit = async (data: CreateVehicleDto) => {
    if (!id) return;
    setIsSaving(true);
    try {
      await vehicleApi.update(id, data);
      toast.success('Vehicle updated successfully');
    } catch (err: any) {
      const msg = err?.response?.data?.message || 'Failed to update vehicle';
      toast.error(msg);
    } finally {
      setIsSaving(false);
    }
  };

  if (loadingVehicle) {
    return (
      <div className="flex justify-center py-20">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" />
      </div>
    );
  }

  if (error || !vehicle) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-500">Vehicle not found</p>
        <Link to="/admin/vehicles" className="text-blue-600 hover:underline mt-2 inline-block">
          ← Back to vehicles
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6">
        <Link to="/admin/vehicles" className="hover:text-blue-600">Vehicles</Link>
        <span>›</span>
        <span className="text-gray-900 font-medium">{vehicle.vehicleNumber}</span>
      </nav>

      {/* Vehicle ID & QR Banner */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs text-blue-600 font-medium">Vehicle ID</p>
          <p className="text-lg font-bold text-blue-900 font-mono">{vehicle.id}</p>
          <p className="text-xs text-blue-600 break-all">{vehicle.qrUrl}</p>
        </div>
        <div className="flex gap-2">
          <Link
            to={`/admin/vehicles/${vehicle.id}/history`}
            className="btn-secondary text-sm"
          >
            📋 History
          </Link>
          <button
            onClick={() => setShowQR(true)}
            className="btn-primary text-sm"
          >
            📱 QR Code
          </button>
        </div>
      </div>

      <div className="card">
        <div className="mb-6">
          <h1 className="text-xl font-bold text-gray-900">Edit Vehicle</h1>
          <p className="text-sm text-gray-500 mt-1">
            Updating this form changes the data shown when the QR code is scanned.
            The QR code URL remains the same.
          </p>
        </div>
        <VehicleForm
          initialValues={vehicle}
          onSubmit={handleSubmit}
          isLoading={isSaving}
          submitLabel="Save Changes"
        />
      </div>

      {showQR && <QRCodeModal vehicle={vehicle} onClose={() => setShowQR(false)} />}
    </div>
  );
};

export default EditVehiclePage;
