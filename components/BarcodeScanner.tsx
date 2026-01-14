
import React, { useRef, useEffect, useState } from 'react';

interface BarcodeScannerProps {
  onDetected: (code: string) => void;
  onClose: () => void;
}

const BarcodeScanner: React.FC<BarcodeScannerProps> = ({ onDetected, onClose }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let stream: MediaStream | null = null;

    const startCamera = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment' }
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }

        // Lógica de detección (BarcodeDetector API si está disponible)
        if ('BarcodeDetector' in window) {
          const barcodeDetector = new (window as any).BarcodeDetector({
            formats: ['ean_13', 'ean_8', 'upc_a', 'code_128']
          });

          const detect = async () => {
            if (videoRef.current && videoRef.current.readyState === 4) {
              try {
                const barcodes = await barcodeDetector.detect(videoRef.current);
                if (barcodes.length > 0) {
                  onDetected(barcodes[0].rawValue);
                  return; // Detener después del primero
                }
              } catch (e) {
                console.error("Barcode detection error:", e);
              }
            }
            requestAnimationFrame(detect);
          };
          detect();
        } else {
          setError("Tu navegador no soporta escaneo nativo de códigos. Usa el buscador manual.");
        }
      } catch (err) {
        setError("No se pudo acceder a la cámara. Revisa los permisos.");
      }
    };

    startCamera();

    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [onDetected]);

  return (
    <div className="fixed inset-0 bg-black z-[120] flex flex-col">
      <div className="p-4 flex justify-between items-center text-white bg-black/50 absolute top-0 w-full z-10">
        <h3 className="font-bold">Escanear Producto</h3>
        <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full">✕</button>
      </div>
      
      <div className="flex-1 relative overflow-hidden flex items-center justify-center">
        <video 
          ref={videoRef} 
          autoPlay 
          playsInline 
          className="w-full h-full object-cover"
        />
        
        {/* Overlay de escaneo */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-64 h-48 border-2 border-indigo-500 rounded-lg relative overflow-hidden shadow-[0_0_0_1000px_rgba(0,0,0,0.5)]">
            <div className="absolute w-full h-0.5 bg-red-500 shadow-[0_0_15px_rgba(239,68,68,0.8)] animate-[scan_2s_linear_infinite]" />
          </div>
        </div>

        {error && (
          <div className="absolute bottom-10 left-4 right-4 bg-red-600 text-white p-4 rounded-xl text-center">
            {error}
          </div>
        )}
      </div>

      <div className="p-8 bg-black text-white text-center text-sm">
        Apunta al código de barras del producto
      </div>

      <style>{`
        @keyframes scan {
          0% { top: 0; }
          50% { top: 100%; }
          100% { top: 0; }
        }
      `}</style>
    </div>
  );
};

export default BarcodeScanner;
