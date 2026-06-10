export interface Vehicle {
  id: string;
  vehicleNumber: string;
  driverName: string;
  driverMobile: string;
  driverPhoto?: string;
  emergencyContact: string;
  emergencyContactName?: string;
  vehicleType: string;
  companyName?: string;
  insuranceNumber?: string;
  insuranceExpiry?: string;
  address?: string;
  notes?: string;
  qrUrl: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateVehicleDto {
  vehicleNumber: string;
  driverName: string;
  driverMobile: string;
  driverPhoto?: string;
  emergencyContact: string;
  emergencyContactName?: string;
  vehicleType: string;
  companyName?: string;
  insuranceNumber?: string;
  insuranceExpiry?: string;
  address?: string;
  notes?: string;
}

export type UpdateVehicleDto = Partial<CreateVehicleDto>;

export interface VehicleListResponse {
  vehicles: Vehicle[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface QRCodeData {
  vehicleId: string;
  vehicleNumber: string;
  qrUrl: string;
  qrDataUrl: string;
  qrSvg: string;
}
