import api from './axios';
import { Vehicle, CreateVehicleDto, UpdateVehicleDto, VehicleListResponse, QRCodeData } from '../types/vehicle';

export const vehicleApi = {
  list: (page = 1, limit = 20, search?: string) =>
    api.get<{ success: boolean; data: VehicleListResponse }>('/vehicles', {
      params: { page, limit, ...(search ? { search } : {}) },
    }),

  getById: (id: string) =>
    api.get<{ success: boolean; data: Vehicle }>(`/vehicles/${id}`),

  create: (data: CreateVehicleDto) =>
    api.post<{ success: boolean; data: Vehicle }>('/vehicles', data),

  update: (id: string, data: UpdateVehicleDto) =>
    api.put<{ success: boolean; data: Vehicle }>(`/vehicles/${id}`, data),

  delete: (id: string) =>
    api.delete<{ success: boolean; message: string }>(`/vehicles/${id}`),

  getQRCode: (id: string) =>
    api.get<{ success: boolean; data: QRCodeData }>(`/vehicles/${id}/qrcode`),

  bulkImport: (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post<{ success: boolean; data: { created: number; errors: string[] }; message: string }>(
      '/vehicles/bulk',
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } }
    );
  },
};
