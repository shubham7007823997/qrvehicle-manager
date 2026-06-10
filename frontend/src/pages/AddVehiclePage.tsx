import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import VehicleForm from '../components/VehicleForm';
import { vehicleApi } from '../api/vehicles';
import { CreateVehicleDto } from '../types/vehicle';
import toast from 'react-hot-toast';

const AddVehiclePage: React.FC = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (data: CreateVehicleDto) => {
    setIsLoading(true);
    try {
      const res = await vehicleApi.create(data);
      toast.success(`Vehicle ${res.data.data.vehicleNumber} created! ID: ${res.data.data.id}`);
      navigate(`/admin/vehicles/${res.data.data.id}/edit`);
    } catch (err: any) {
      const msg = err?.response?.data?.message || 'Failed to create vehicle';
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-3xl">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6">
        <Link to="/admin/vehicles" className="hover:text-blue-600">Vehicles</Link>
        <span>›</span>
        <span className="text-gray-900 font-medium">Add New Vehicle</span>
      </nav>

      <div className="card">
        <div className="mb-6">
          <h1 className="text-xl font-bold text-gray-900">Add New Vehicle</h1>
          <p className="text-sm text-gray-500 mt-1">
            A unique QR code will be generated automatically. The QR code URL will never change.
          </p>
        </div>
        <VehicleForm
          onSubmit={handleSubmit}
          isLoading={isLoading}
          submitLabel="Create Vehicle & Generate QR"
        />
      </div>
    </div>
  );
};

export default AddVehiclePage;
