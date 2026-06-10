import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api/axios';
import { useVehicle } from '../hooks/useVehicles';

interface HistoryEntry {
  id: string;
  vehicleId: string;
  changedBy: string | null;
  changes: Record<string, { from: unknown; to: unknown }>;
  createdAt: string;
}

const VehicleHistoryPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { vehicle } = useVehicle(id!);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    api
      .get<{ success: boolean; data: HistoryEntry[] }>(`/vehicles/${id}/history`)
      .then((res) => setHistory(res.data.data))
      .finally(() => setLoading(false));
  }, [id]);

  const fmt = (val: unknown): string => {
    if (val === null || val === undefined || val === '') return '—';
    if (typeof val === 'string' && val.includes('T')) {
      const d = new Date(val);
      if (!isNaN(d.getTime())) return d.toLocaleDateString();
    }
    return String(val);
  };

  return (
    <div className="max-w-3xl">
      <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6">
        <Link to="/admin/vehicles" className="hover:text-blue-600">Vehicles</Link>
        <span>›</span>
        <Link to={`/admin/vehicles/${id}/edit`} className="hover:text-blue-600">
          {vehicle?.vehicleNumber || id}
        </Link>
        <span>›</span>
        <span className="text-gray-900 font-medium">History</span>
      </nav>

      <div className="card">
        <h1 className="text-xl font-bold text-gray-900 mb-1">Change History</h1>
        <p className="text-sm text-gray-500 mb-6">
          Every update to this vehicle's data is recorded here.
        </p>

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-gray-100 rounded-lg animate-pulse" />
            ))}
          </div>
        ) : history.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <p className="text-3xl mb-2">📋</p>
            <p>No changes recorded yet</p>
          </div>
        ) : (
          <div className="space-y-4">
            {history.map((entry) => (
              <div key={entry.id} className="border border-gray-200 rounded-xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-700">
                      {entry.changedBy || 'Admin'}
                    </span>
                    <span className="text-xs text-gray-400">updated</span>
                  </div>
                  <span className="text-xs text-gray-400">
                    {new Date(entry.createdAt).toLocaleString()}
                  </span>
                </div>

                <div className="space-y-2">
                  {Object.entries(entry.changes).map(([field, { from, to }]) => (
                    <div
                      key={field}
                      className="grid grid-cols-3 gap-2 text-xs bg-gray-50 rounded-lg px-3 py-2"
                    >
                      <span className="font-medium text-gray-600 capitalize">
                        {field.replace(/([A-Z])/g, ' $1').trim()}
                      </span>
                      <span className="text-red-500 line-through truncate">{fmt(from)}</span>
                      <span className="text-green-600 font-medium truncate">{fmt(to)}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default VehicleHistoryPage;
