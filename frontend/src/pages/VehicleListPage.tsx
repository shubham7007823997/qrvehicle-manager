import React, { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useVehicles } from '../hooks/useVehicles';
import { vehicleApi } from '../api/vehicles';
import { Vehicle } from '../types/vehicle';
import QRCodeModal from '../components/QRCodeModal';
import DeleteConfirm from '../components/DeleteConfirm';
import toast from 'react-hot-toast';

const VehicleListPage: React.FC = () => {
  const { data, isLoading, search, setSearch, page, setPage, refetch } = useVehicles();
  const [qrVehicle, setQrVehicle] = useState<Vehicle | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Vehicle | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [importing, setImporting] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const [searchInput, setSearchInput] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearch(searchInput);
    setPage(1);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await vehicleApi.delete(deleteTarget.id);
      toast.success(`${deleteTarget.vehicleNumber} deleted`);
      setDeleteTarget(null);
      refetch();
    } catch {
      toast.error('Failed to delete vehicle');
    } finally {
      setDeleting(false);
    }
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImporting(true);
    try {
      const res = await vehicleApi.bulkImport(file);
      toast.success(res.data.message);
      refetch();
    } catch {
      toast.error('Import failed');
    } finally {
      setImporting(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  const insuranceStatus = (expiry?: string) => {
    if (!expiry) return null;
    const exp = new Date(expiry);
    const now = new Date();
    const diff = Math.ceil((exp.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    if (diff < 0) return <span className="text-red-600 text-xs font-medium">Expired</span>;
    if (diff <= 30) return <span className="text-amber-600 text-xs font-medium">Expiring in {diff}d</span>;
    return <span className="text-green-600 text-xs font-medium">Valid</span>;
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Vehicles</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {data?.total ?? 0} total vehicles
          </p>
        </div>
        <div className="flex items-center gap-2">
          <input
            ref={fileRef}
            type="file"
            accept=".xlsx,.xls"
            className="hidden"
            onChange={handleImport}
          />
          <button
            className="btn-secondary text-sm"
            onClick={() => fileRef.current?.click()}
            disabled={importing}
          >
            {importing ? '⏳ Importing...' : '📤 Import Excel'}
          </button>
          <Link to="/admin/vehicles/new" className="btn-primary text-sm">
            ➕ Add Vehicle
          </Link>
        </div>
      </div>

      {/* Search */}
      <form onSubmit={handleSearch} className="flex gap-2">
        <input
          className="input flex-1"
          placeholder="Search by vehicle number, driver name, mobile..."
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
        />
        <button type="submit" className="btn-primary px-5">
          🔍
        </button>
        {search && (
          <button
            type="button"
            className="btn-secondary px-3"
            onClick={() => { setSearchInput(''); setSearch(''); setPage(1); }}
          >
            ✕
          </button>
        )}
      </form>

      {/* Table */}
      <div className="card p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-4 py-3 text-gray-500 font-medium">Vehicle</th>
                <th className="text-left px-4 py-3 text-gray-500 font-medium hidden sm:table-cell">Driver</th>
                <th className="text-left px-4 py-3 text-gray-500 font-medium hidden md:table-cell">Type</th>
                <th className="text-left px-4 py-3 text-gray-500 font-medium hidden lg:table-cell">Insurance</th>
                <th className="text-right px-4 py-3 text-gray-500 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>
                    <td colSpan={5} className="px-4 py-3">
                      <div className="h-5 bg-gray-100 rounded animate-pulse" />
                    </td>
                  </tr>
                ))
              ) : data?.vehicles.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center text-gray-400">
                    <p className="text-3xl mb-2">🚗</p>
                    <p>No vehicles found</p>
                  </td>
                </tr>
              ) : (
                data?.vehicles.map((vehicle) => (
                  <tr key={vehicle.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <div>
                        <p className="font-semibold">{vehicle.vehicleNumber}</p>
                        <p className="text-xs text-gray-400 font-mono">{vehicle.id}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3 hidden sm:table-cell">
                      <div>
                        <p className="font-medium">{vehicle.driverName}</p>
                        <p className="text-xs text-gray-400">{vehicle.driverMobile}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <span className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded-full text-xs font-medium">
                        {vehicle.vehicleType}
                      </span>
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell">
                      {vehicle.insuranceExpiry ? (
                        <div>
                          {insuranceStatus(vehicle.insuranceExpiry)}
                          <p className="text-xs text-gray-400">{vehicle.insuranceExpiry}</p>
                        </div>
                      ) : (
                        <span className="text-gray-400 text-xs">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => setQrVehicle(vehicle)}
                          className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-500 hover:text-blue-600 transition-colors"
                          title="View QR Code"
                        >
                          📱
                        </button>
                        <Link
                          to={`/admin/vehicles/${vehicle.id}/edit`}
                          className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-500 hover:text-blue-600 transition-colors"
                          title="Edit"
                        >
                          ✏️
                        </Link>
                        <a
                          href={`/vehicle/${vehicle.id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-500 hover:text-green-600 transition-colors"
                          title="View Public Page"
                        >
                          👁️
                        </a>
                        <button
                          onClick={() => setDeleteTarget(vehicle)}
                          className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-500 hover:text-red-600 transition-colors"
                          title="Delete"
                        >
                          🗑️
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {data && data.totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
            <p className="text-sm text-gray-500">
              Page {page} of {data.totalPages}
            </p>
            <div className="flex gap-2">
              <button
                className="btn-secondary text-xs px-3 py-1"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                ← Prev
              </button>
              <button
                className="btn-secondary text-xs px-3 py-1"
                onClick={() => setPage((p) => Math.min(data.totalPages, p + 1))}
                disabled={page === data.totalPages}
              >
                Next →
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      {qrVehicle && (
        <QRCodeModal vehicle={qrVehicle} onClose={() => setQrVehicle(null)} />
      )}
      {deleteTarget && (
        <DeleteConfirm
          vehicleNumber={deleteTarget.vehicleNumber}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
          isLoading={deleting}
        />
      )}
    </div>
  );
};

export default VehicleListPage;
