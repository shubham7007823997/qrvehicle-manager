export interface Vehicle {
  id: string;
  vehicleNumber: string;
  driverName: string;
  driverMobile: string;
  driverPhoto: string | null;
  emergencyContact: string;
  emergencyContactName: string | null;
  vehicleType: string;
  companyName: string | null;
  insuranceNumber: string | null;
  insuranceExpiry: Date | null;
  address: string | null;
  notes: string | null;
  qrUrl: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
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
  insuranceExpiry?: string; // ISO date string from client
  address?: string;
  notes?: string;
}

export type UpdateVehicleDto = Partial<CreateVehicleDto>;
