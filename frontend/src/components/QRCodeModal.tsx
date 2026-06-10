import React, { useEffect, useState, useRef } from 'react';
import { vehicleApi } from '../api/vehicles';
import { QRCodeData } from '../types/vehicle';
import { Vehicle } from '../types/vehicle';
import jsPDF from 'jspdf';
import toast from 'react-hot-toast';

interface Props {
  vehicle: Vehicle;
  onClose: () => void;
}

const QRCodeModal: React.FC<Props> = ({ vehicle, onClose }) => {
  const [qrData, setQrData] = useState<QRCodeData | null>(null);
  const [loading, setLoading] = useState(true);
  const printRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    vehicleApi
      .getQRCode(vehicle.id)
      .then((res) => setQrData(res.data.data))
      .catch(() => toast.error('Failed to load QR code'))
      .finally(() => setLoading(false));
  }, [vehicle.id]);

  const downloadPNG = () => {
    if (!qrData) return;
    const link = document.createElement('a');
    link.href = qrData.qrDataUrl;
    link.download = `QR_${vehicle.vehicleNumber}.png`;
    link.click();
    toast.success('PNG downloaded');
  };

  const downloadPDF = () => {
    if (!qrData) return;
    const doc = new jsPDF({ unit: 'mm', format: [80, 100] });
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('VEHICLE QR CODE', 40, 10, { align: 'center' });
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.text(vehicle.vehicleNumber, 40, 16, { align: 'center' });
    doc.addImage(qrData.qrDataUrl, 'PNG', 15, 20, 50, 50);
    doc.setFontSize(7);
    doc.text(vehicle.driverName, 40, 76, { align: 'center' });
    doc.text(vehicle.vehicleType, 40, 81, { align: 'center' });
    doc.save(`QR_${vehicle.vehicleNumber}.pdf`);
    toast.success('PDF downloaded');
  };

  const handlePrint = () => {
    const content = printRef.current;
    if (!content || !qrData) return;
    const win = window.open('', '_blank');
    if (!win) return;
    win.document.write(`
      <html><head><title>QR Sticker - ${vehicle.vehicleNumber}</title>
      <style>
        body { margin: 0; padding: 20px; font-family: sans-serif; text-align: center; }
        img { width: 200px; height: 200px; }
        h2 { font-size: 16px; margin: 8px 0 4px; }
        p { font-size: 12px; margin: 2px 0; color: #555; }
      </style></head><body>
      <h2>${vehicle.vehicleNumber}</h2>
      <img src="${qrData.qrDataUrl}" />
      <p>${vehicle.driverName}</p>
      <p>${vehicle.vehicleType}${vehicle.companyName ? ' · ' + vehicle.companyName : ''}</p>
      <p style="font-size:10px;color:#999;margin-top:8px;">${qrData.qrUrl}</p>
      </body></html>
    `);
    win.document.close();
    win.print();
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="QR Code"
    >
      <div
        className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-lg font-bold text-gray-900">QR Code</h2>
            <p className="text-sm text-gray-500">{vehicle.vehicleNumber}</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-500"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" />
          </div>
        ) : qrData ? (
          <>
            <div ref={printRef} className="flex flex-col items-center bg-gray-50 rounded-xl p-4 mb-5">
              <img
                src={qrData.qrDataUrl}
                alt={`QR code for ${vehicle.vehicleNumber}`}
                className="w-48 h-48"
              />
              <p className="text-xs text-gray-500 mt-2 text-center break-all">{qrData.qrUrl}</p>
            </div>

            <p className="text-xs text-amber-600 bg-amber-50 rounded-lg p-3 mb-4 text-center">
              🔒 This QR code is permanent. Only the data behind it changes.
            </p>

            <div className="grid grid-cols-3 gap-2">
              <button onClick={downloadPNG} className="btn-secondary justify-center text-xs py-2">
                📥 PNG
              </button>
              <button onClick={downloadPDF} className="btn-secondary justify-center text-xs py-2">
                📄 PDF
              </button>
              <button onClick={handlePrint} className="btn-secondary justify-center text-xs py-2">
                🖨️ Print
              </button>
            </div>
          </>
        ) : (
          <p className="text-center text-gray-500 py-8">Failed to load QR code</p>
        )}
      </div>
    </div>
  );
};

export default QRCodeModal;
