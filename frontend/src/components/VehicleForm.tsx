import React, { useState } from 'react';
import { CreateVehicleDto } from '../types/vehicle';

interface Props {
  initialValues?: Partial<CreateVehicleDto>;
  onSubmit: (data: CreateVehicleDto) => Promise<void>;
  isLoading: boolean;
  submitLabel?: string;
}

const VEHICLE_TYPES = ['Car', 'Truck', 'Bus', 'Bike', 'Auto', 'Van', 'SUV', 'Ambulance', 'Other'];

const VehicleForm: React.FC<Props> = ({
  initialValues = {},
  onSubmit,
  isLoading,
  submitLabel = 'Save Vehicle',
}) => {
  const [form, setForm] = useState<CreateVehicleDto>({
    vehicleNumber: initialValues.vehicleNumber || '',
    driverName: initialValues.driverName || '',
    driverMobile: initialValues.driverMobile || '',
    emergencyContact: initialValues.emergencyContact || '',
    emergencyContactName: initialValues.emergencyContactName || '',
    vehicleType: initialValues.vehicleType || 'Car',
    companyName: initialValues.companyName || '',
    insuranceNumber: initialValues.insuranceNumber || '',
    insuranceExpiry: initialValues.insuranceExpiry || '',
    address: initialValues.address || '',
    notes: initialValues.notes || '',
    driverPhoto: initialValues.driverPhoto || '',
  });

  const [errors, setErrors] = useState<Partial<Record<keyof CreateVehicleDto, string>>>({});

  const set = (field: keyof CreateVehicleDto, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof CreateVehicleDto, string>> = {};
    if (!form.vehicleNumber.trim()) newErrors.vehicleNumber = 'Required';
    if (!form.driverName.trim()) newErrors.driverName = 'Required';
    if (!/^\d{10}$/.test(form.driverMobile)) newErrors.driverMobile = 'Must be 10 digits';
    if (!/^\d{10}$/.test(form.emergencyContact)) newErrors.emergencyContact = 'Must be 10 digits';
    if (!form.vehicleType) newErrors.vehicleType = 'Required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    await onSubmit(form);
  };

  const Field = ({
    label,
    field,
    type = 'text',
    placeholder = '',
    required = false,
  }: {
    label: string;
    field: keyof CreateVehicleDto;
    type?: string;
    placeholder?: string;
    required?: boolean;
  }) => (
    <div>
      <label className="label">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <input
        type={type}
        className={`input ${errors[field] ? 'border-red-500 focus:ring-red-500' : ''}`}
        value={form[field] as string}
        onChange={(e) => set(field, e.target.value)}
        placeholder={placeholder}
      />
      {errors[field] && <p className="text-red-500 text-xs mt-1">{errors[field]}</p>}
    </div>
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Vehicle Info */}
      <div>
        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">
          Vehicle Information
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Vehicle Number" field="vehicleNumber" placeholder="MH43CG4388" required />
          <div>
            <label className="label">
              Vehicle Type <span className="text-red-500">*</span>
            </label>
            <select
              className={`input ${errors.vehicleType ? 'border-red-500' : ''}`}
              value={form.vehicleType}
              onChange={(e) => set('vehicleType', e.target.value)}
            >
              {VEHICLE_TYPES.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>
          <Field label="Company Name" field="companyName" placeholder="ABC Logistics" />
          <Field label="Insurance Number" field="insuranceNumber" placeholder="INS-2024-XXXXX" />
          <Field label="Insurance Expiry" field="insuranceExpiry" type="date" />
          <Field label="Address" field="address" placeholder="City, State" />
        </div>
      </div>

      {/* Driver Info */}
      <div>
        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">
          Driver Information
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Driver Name" field="driverName" placeholder="Shubham Gupta" required />
          <Field label="Driver Mobile" field="driverMobile" placeholder="9876543210" required />
          <Field label="Driver Photo URL" field="driverPhoto" placeholder="https://..." />
        </div>
      </div>

      {/* Emergency Contact */}
      <div>
        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">
          Emergency Contact
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field
            label="Emergency Contact Name"
            field="emergencyContactName"
            placeholder="Contact person name"
          />
          <Field
            label="Emergency Mobile"
            field="emergencyContact"
            placeholder="9876543211"
            required
          />
        </div>
      </div>

      {/* Notes */}
      <div>
        <label className="label">Notes</label>
        <textarea
          className="input resize-none"
          rows={3}
          value={form.notes}
          onChange={(e) => set('notes', e.target.value)}
          placeholder="Any additional information..."
        />
      </div>

      <div className="flex justify-end">
        <button type="submit" className="btn-primary" disabled={isLoading}>
          {isLoading ? (
            <>
              <span className="animate-spin inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
              Saving...
            </>
          ) : (
            submitLabel
          )}
        </button>
      </div>
    </form>
  );
};

export default VehicleForm;
