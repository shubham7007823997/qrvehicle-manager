import QRCode from 'qrcode';

export interface QRCodeResult {
  dataUrl: string;   // base64 PNG
  svgString: string; // SVG markup
}

export async function generateQRCode(url: string): Promise<QRCodeResult> {
  const [dataUrl, svgString] = await Promise.all([
    QRCode.toDataURL(url, {
      errorCorrectionLevel: 'H',
      type: 'image/png',
      width: 400,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF',
      },
    }),
    QRCode.toString(url, {
      type: 'svg',
      errorCorrectionLevel: 'H',
      width: 400,
      margin: 2,
    }),
  ]);

  return { dataUrl, svgString };
}

export async function generateQRCodeBuffer(url: string): Promise<Buffer> {
  return QRCode.toBuffer(url, {
    errorCorrectionLevel: 'H',
    type: 'png',
    width: 400,
    margin: 2,
  });
}
