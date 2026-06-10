/**
 * VehicleScanPage — PUBLIC page, no login required.
 *
 * Flow:
 *   User scans QR code on vehicle
 *   → Browser opens  https://yourdomain.com/vehicle/VH10001
 *   → This page fetches  GET /api/vehicles/VH10001  (no auth)
 *   → Shows latest vehicle + driver details
 *
 * This file has ZERO dependency on AuthContext, JWT, or the
 * admin axios instance. It uses publicApi which never redirects.
 */
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import publicApi from '../api/publicApi';
import { Vehicle } from '../types/vehicle';

// ── helpers ────────────────────────────────────────────────────────────────────

function formatDate(val: string | Date | null | undefined): string {
  if (!val) return '';
  const d = new Date(val as string);
  if (isNaN(d.getTime())) return String(val);
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

function insuranceDaysLeft(expiry: string | Date | null | undefined): number | null {
  if (!expiry) return null;
  const diff = new Date(expiry as string).getTime() - Date.now();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

// ── sub-components ─────────────────────────────────────────────────────────────

const InfoRow: React.FC<{ label: string; value: string | null | undefined }> = ({ label, value }) => {
  if (!value) return null;
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-xs text-gray-400 uppercase tracking-wide font-medium">{label}</span>
      <span className="text-sm font-semibold text-gray-800">{value}</span>
    </div>
  );
};

const CallButton: React.FC<{
  phone: string;
  label: string;
  color: 'green' | 'red';
}> = ({ phone, label, color }) => (
  <a
    href={`tel:${phone}`}
    className={`
      flex items-center justify-center gap-2 w-full py-4 rounded-2xl font-bold text-white text-base
      active:scale-95 transition-transform select-none
      ${color === 'green'
        ? 'bg-green-500 shadow-lg shadow-green-200'
        : 'bg-red-500 shadow-lg shadow-red-200'}
    `}
    role="button"
    aria-label={label}
  >
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M6.6 10.8c1.4 2.8 3.8 5.1 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1-9.4 0-17-7.6-17-17 0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.3.2 2.5.6 3.6.1.3 0 .7-.2 1L6.6 10.8z"/>
    </svg>
    {label}
  </a>
);

// ── loading skeleton ───────────────────────────────────────────────────────────

const LoadingScreen: React.FC = () => (
  <div className="min-h-screen bg-gradient-to-b from-blue-600 to-blue-800 flex items-center justify-center">
    <div className="text-center text-white">
      <div className="relative mx-auto mb-6 w-16 h-16">
        <div className="absolute inset-0 rounded-full border-4 border-white/20" />
        <div className="absolute inset-0 rounded-full border-4 border-t-white animate-spin" />
      </div>
      <p className="text-lg font-semibold">Loading vehicle info…</p>
      <p className="text-blue-200 text-sm mt-1">Please wait</p>
    </div>
  </div>
);

// ── error screen ───────────────────────────────────────────────────────────────

const ErrorScreen: React.FC<{ message: string }> = ({ message }) => (
  <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
    <div className="text-center max-w-xs">
      <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-5">
        <svg className="w-10 h-10 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      </div>
      <h1 className="text-xl font-bold text-gray-900 mb-2">Not Found</h1>
      <p className="text-gray-500 text-sm leading-relaxed">{message}</p>
    </div>
  </div>
);

// ── main page ──────────────────────────────────────────────────────────────────

const VehicleScanPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      setError('Invalid QR code — no vehicle ID found.');
      setIsLoading(false);
      return;
    }

    // Uses publicApi — no token, no redirect on failure
    publicApi
      .get<{ success: boolean; data: Vehicle }>(`/vehicles/${id}`)
      .then((res) => {
        if (res.data.success && res.data.data) {
          setVehicle(res.data.data);
        } else {
          setError('Vehicle details could not be loaded.');
        }
      })
      .catch((err) => {
        if (err.response?.status === 404) {
          setError('This QR code is not registered in the system.');
        } else {
          setError('Could not connect to the server. Please try again.');
        }
      })
      .finally(() => setIsLoading(false));
  }, [id]);

  if (isLoading) return <LoadingScreen />;
  if (error || !vehicle) return <ErrorScreen message={error || 'Vehicle not found.'} />;

  const daysLeft = insuranceDaysLeft(vehicle.insuranceExpiry);
  const insuranceExpired = daysLeft !== null && daysLeft < 0;
  const insuranceSoon = daysLeft !== null && daysLeft >= 0 && daysLeft <= 30;

  return (
    <div className="min-h-screen bg-gray-100">

      {/* ── Hero header ─────────────────────────────────────────────────── */}
      <div className="bg-gradient-to-br from-blue-700 via-blue-600 to-blue-500 pt-10 pb-24 px-4 text-center relative overflow-hidden">
        {/* decorative circles */}
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full" aria-hidden="true" />
        <div className="absolute -bottom-6 -left-6 w-28 h-28 bg-white/10 rounded-full" aria-hidden="true" />

        <div className="relative">
          {/* verified badge */}
          <span className="inline-flex items-center gap-1.5 bg-white/20 backdrop-blur-sm text-white
                           text-xs font-semibold px-3 py-1.5 rounded-full mb-4">
            <svg className="w-3.5 h-3.5 text-green-300" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            Verified Vehicle
          </span>

          <h1 className="text-4xl font-black text-white tracking-wide">
            {vehicle.vehicleNumber}
          </h1>

          <p className="text-blue-100 mt-1 text-sm font-medium">
            {vehicle.vehicleType}
            {vehicle.companyName && <span className="opacity-75"> · {vehicle.companyName}</span>}
          </p>
        </div>
      </div>

      {/* ── Cards ───────────────────────────────────────────────────────── */}
      <div className="max-w-md mx-auto px-4 -mt-16 pb-10 space-y-4">

        {/* Driver card */}
        <section className="bg-white rounded-3xl shadow-xl p-5" aria-label="Driver information">

          {/* Avatar + name */}
          <div className="flex items-center gap-4 mb-5">
            {vehicle.driverPhoto ? (
              <img
                src={vehicle.driverPhoto}
                alt={vehicle.driverName}
                className="w-20 h-20 rounded-2xl object-cover border-2 border-blue-100 flex-shrink-0"
              />
            ) : (
              <div
                className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600
                           flex items-center justify-center text-white text-3xl font-black flex-shrink-0"
                aria-hidden="true"
              >
                {vehicle.driverName[0]?.toUpperCase()}
              </div>
            )}
            <div className="min-w-0">
              <p className="text-xs text-gray-400 font-semibold uppercase tracking-wide mb-0.5">
                Driver
              </p>
              <p className="text-xl font-black text-gray-900 leading-tight">
                {vehicle.driverName}
              </p>
              <p className="text-blue-600 font-semibold text-sm mt-0.5">
                {vehicle.driverMobile}
              </p>
            </div>
          </div>

          {/* Call driver — big tap target */}
          <CallButton
            phone={vehicle.driverMobile}
            label={`Call Driver — ${vehicle.driverMobile}`}
            color="green"
          />
        </section>

        {/* Emergency contact */}
        <section
          className="bg-white rounded-3xl shadow-md p-5"
          aria-label="Emergency contact"
        >
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
              <svg className="w-4 h-4 text-red-500" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <p className="text-sm font-bold text-red-600 uppercase tracking-wide">
              Emergency Contact
            </p>
          </div>

          <div className="flex items-center justify-between mb-4">
            <div>
              {vehicle.emergencyContactName && (
                <p className="font-bold text-gray-900 text-base">{vehicle.emergencyContactName}</p>
              )}
              <p className="text-gray-600 font-semibold">{vehicle.emergencyContact}</p>
            </div>
          </div>

          <CallButton
            phone={vehicle.emergencyContact}
            label={`Call Emergency — ${vehicle.emergencyContact}`}
            color="red"
          />
        </section>

        {/* Vehicle details */}
        <section className="bg-white rounded-3xl shadow-md p-5" aria-label="Vehicle details">
          <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-4">
            Vehicle Details
          </h2>
          <div className="grid grid-cols-2 gap-x-4 gap-y-4">
            <InfoRow label="Vehicle No." value={vehicle.vehicleNumber} />
            <InfoRow label="Type" value={vehicle.vehicleType} />
            <InfoRow label="Company" value={vehicle.companyName} />
            <InfoRow label="Address" value={vehicle.address} />
          </div>
        </section>

        {/* Insurance — only if data exists */}
        {(vehicle.insuranceNumber || vehicle.insuranceExpiry) && (
          <section
            className={`rounded-3xl shadow-md p-5 ${
              insuranceExpired
                ? 'bg-red-50 border-2 border-red-300'
                : insuranceSoon
                ? 'bg-amber-50 border-2 border-amber-300'
                : 'bg-white'
            }`}
            aria-label="Insurance details"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wide">
                Insurance
              </h2>
              {insuranceExpired && (
                <span className="text-xs font-bold text-white bg-red-500 px-2.5 py-1 rounded-full">
                  Expired
                </span>
              )}
              {insuranceSoon && !insuranceExpired && (
                <span className="text-xs font-bold text-amber-800 bg-amber-200 px-2.5 py-1 rounded-full">
                  Expires in {daysLeft}d
                </span>
              )}
              {!insuranceExpired && !insuranceSoon && daysLeft !== null && (
                <span className="text-xs font-bold text-green-800 bg-green-100 px-2.5 py-1 rounded-full">
                  Valid
                </span>
              )}
            </div>
            <div className="grid grid-cols-2 gap-x-4 gap-y-4">
              <InfoRow label="Policy No." value={vehicle.insuranceNumber} />
              {vehicle.insuranceExpiry && (
                <InfoRow label="Expiry" value={formatDate(vehicle.insuranceExpiry)} />
              )}
            </div>
          </section>
        )}

        {/* Notes */}
        {vehicle.notes && (
          <section className="bg-white rounded-3xl shadow-md p-5" aria-label="Notes">
            <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-2">Notes</h2>
            <p className="text-sm text-gray-700 leading-relaxed">{vehicle.notes}</p>
          </section>
        )}

        {/* Footer */}
        <div className="text-center pt-2 pb-4">
          <p className="text-xs text-gray-400">Vehicle QR Manager</p>
          <p className="text-xs text-gray-300 font-mono mt-0.5">{vehicle.id}</p>
        </div>
      </div>
    </div>
  );
};

export default VehicleScanPage;
