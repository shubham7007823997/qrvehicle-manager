import { useState, useEffect, useCallback } from 'react';
import { vehicleApi } from '../api/vehicles';
import { Vehicle, VehicleListResponse } from '../types/vehicle';
import toast from 'react-hot-toast';

export const useVehicles = (initialPage = 1, limit = 20) => {
  const [data, setData] = useState<VehicleListResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(initialPage);

  const fetch = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await vehicleApi.list(page, limit, search || undefined);
      setData(res.data.data);
    } catch {
      toast.error('Failed to load vehicles');
    } finally {
      setIsLoading(false);
    }
  }, [page, limit, search]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { data, isLoading, search, setSearch, page, setPage, refetch: fetch };
};

export const useVehicle = (id: string) => {
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    setIsLoading(true);
    vehicleApi
      .getById(id)
      .then((res) => setVehicle(res.data.data))
      .catch(() => setError('Vehicle not found'))
      .finally(() => setIsLoading(false));
  }, [id]);

  return { vehicle, isLoading, error };
};
