import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { vehicleApi } from '../api/vehicles';
import { Vehicle } from '../types/vehicle';
import { useAuth } from '../context/AuthContext';

interface Stats {
  total: number;
  active: number;
  expiringSoon: number;
}

const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<Stats>({ total: 0, active: 0, expiringSoon: 0 });
  const [recent, setRecent] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    vehicleApi.list(1, 100).then((res) => {
      const vehicles = res.data.data.vehicles;
      const now = new Date();
      const soon = new Date();
      soon.setDate(soon.getDate() + 30);

      setStats({
        total: res.data.data.total,
        active: vehicles.filter((v) => v.isActive).length,
        expiringSoon: vehicles.filter((v) => {
          if (!v.insuranceExpiry) return false;
          const exp = new Date(v.insuranceExpiry);
          return exp >= now && exp <= soon;
        }).length,
      });
      setRecent(vehicles.slice(0, 5));
    }).finally(() => setLoading(false));
  }, []);

  const StatCard = ({
    label,
    value,
    icon,
    color,
  }: {
    label: string;
    value: number;
    icon: string;
    color: string;
  }) => (
    <div className="card flex items-center gap-4">
      <div className={`w-12 h-12 ${color} rounded-xl flex items-center justify-center text-2xl flex-shrink-0`}>
        {icon}
      </div>
      <div>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
        <p className="text-sm text-gray-500">{label}</p>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-500 text-sm mt-0.5">
            Welcome back, {user?.email?.split('@')[0]}
          </p>
        </div>
        <Link to="/admin/vehicles/new" className="btn-primary">
          ➕ Add Vehicle
        </Link>
      </div>

      {/* Stats */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="card animate-pulse h-20 bg-gray-100" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatCard label="Total Vehicles" value={stats.total} icon="🚗" color="bg-blue-50" />
          <StatCard label="Active Vehicles" value={stats.active} icon="✅" color="bg-green-50" />
          <StatCard label="Insurance Expiring (30d)" value={stats.expiringSoon} icon="⚠️" color="bg-amber-50" />
        </div>
      )}

      {/* Recent Vehicles */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-gray-900">Recent Vehicles</h2>
          <Link to="/admin/vehicles" className="text-sm text-blue-600 hover:underline">
            View all →
          </Link>
        </div>

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-12 bg-gray-100 rounded-lg animate-pulse" />
            ))}
          </div>
        ) : recent.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <p className="text-3xl mb-2">🚗</p>
            <p>No vehicles yet</p>
            <Link to="/admin/vehicles/new" className="text-blue-600 text-sm hover:underline mt-1 inline-block">
              Add your first vehicle
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left py-2 text-gray-500 font-medium">ID</th>
                  <th className="text-left py-2 text-gray-500 font-medium">Vehicle</th>
                  <th className="text-left py-2 text-gray-500 font-medium hidden sm:table-cell">Driver</th>
                  <th className="text-left py-2 text-gray-500 font-medium hidden md:table-cell">Type</th>
                  <th className="text-right py-2 text-gray-500 font-medium">Action</th>
                </tr>
              </thead>
              <tbody>
                {recent.map((v) => (
                  <tr key={v.id} className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="py-3 font-mono text-xs text-gray-500">{v.id}</td>
                    <td className="py-3 font-medium">{v.vehicleNumber}</td>
                    <td className="py-3 text-gray-600 hidden sm:table-cell">{v.driverName}</td>
                    <td className="py-3 text-gray-600 hidden md:table-cell">
                      <span className="px-2 py-0.5 bg-gray-100 rounded text-xs">{v.vehicleType}</span>
                    </td>
                    <td className="py-3 text-right">
                      <Link
                        to={`/admin/vehicles/${v.id}/edit`}
                        className="text-blue-600 hover:underline text-xs"
                      >
                        Edit
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Link to="/admin/vehicles" className="card hover:shadow-md transition-shadow cursor-pointer flex items-center gap-4">
          <span className="text-3xl">🔍</span>
          <div>
            <p className="font-semibold">Search Vehicles</p>
            <p className="text-sm text-gray-500">Find and manage all vehicles</p>
          </div>
        </Link>
        <Link to="/admin/vehicles/new" className="card hover:shadow-md transition-shadow cursor-pointer flex items-center gap-4">
          <span className="text-3xl">📤</span>
          <div>
            <p className="font-semibold">Import Vehicles</p>
            <p className="text-sm text-gray-500">Bulk import via Excel file</p>
          </div>
        </Link>
      </div>
    </div>
  );
};

export default DashboardPage;
