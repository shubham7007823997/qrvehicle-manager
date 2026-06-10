import React from 'react';

interface Props {
  vehicleNumber: string;
  onConfirm: () => void;
  onCancel: () => void;
  isLoading: boolean;
}

const DeleteConfirm: React.FC<Props> = ({ vehicleNumber, onConfirm, onCancel, isLoading }) => (
  <div
    className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
    role="dialog"
    aria-modal="true"
  >
    <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-6">
      <div className="text-center mb-5">
        <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center text-2xl mx-auto mb-3">
          🗑️
        </div>
        <h2 className="text-lg font-bold text-gray-900">Delete Vehicle?</h2>
        <p className="text-sm text-gray-500 mt-1">
          This will permanently delete <span className="font-semibold">{vehicleNumber}</span> and
          its QR code data. This cannot be undone.
        </p>
      </div>
      <div className="flex gap-3">
        <button className="btn-secondary flex-1 justify-center" onClick={onCancel} disabled={isLoading}>
          Cancel
        </button>
        <button className="btn-danger flex-1 justify-center" onClick={onConfirm} disabled={isLoading}>
          {isLoading ? 'Deleting...' : 'Delete'}
        </button>
      </div>
    </div>
  </div>
);

export default DeleteConfirm;
