import React, { useRef, useState, useEffect } from 'react';
import { X, RotateCcw, Check, Upload, PenTool } from 'lucide-react';

interface SignatureCanvasModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (dataUrl: string) => void;
  title: string;
}

export function SignatureCanvasModal({ isOpen, onClose, onSave, title }: SignatureCanvasModalProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [penColor, setPenColor] = useState('#000000');
  const [penWidth, setPenWidth] = useState(3);

  useEffect(() => {
    if (isOpen && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
      }
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    setIsDrawing(true);
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    ctx.strokeStyle = penColor;
    ctx.lineWidth = penWidth;
    ctx.beginPath();
    ctx.moveTo(clientX - rect.left, clientY - rect.top);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    ctx.lineTo(clientX - rect.left, clientY - rect.top);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const handleClear = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  };

  const handleSave = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dataUrl = canvas.toDataURL('image/png');
    onSave(dataUrl);
    onClose();
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          onSave(event.target.result as string);
          onClose();
        }
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full p-6 border border-slate-200">
        <div className="flex justify-between items-center pb-3 border-b border-slate-200 mb-4">
          <div className="flex items-center gap-2 text-slate-800 font-semibold text-lg">
            <PenTool className="w-5 h-5 text-indigo-600" />
            <span>{title}</span>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Canvas & Controls */}
        <div className="space-y-4">
          <div className="border-2 border-dashed border-slate-300 rounded-lg overflow-hidden bg-slate-50 relative">
            <canvas
              ref={canvasRef}
              width={450}
              height={180}
              onMouseDown={startDrawing}
              onMouseMove={draw}
              onMouseUp={stopDrawing}
              onMouseLeave={stopDrawing}
              onTouchStart={startDrawing}
              onTouchMove={draw}
              onTouchEnd={stopDrawing}
              className="w-full h-44 cursor-crosshair touch-none"
            />
            <div className="absolute bottom-2 left-3 text-xs text-slate-400 pointer-events-none select-none">
              Sign or draw above
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
            <div className="flex items-center gap-3">
              <span className="text-slate-600 font-medium">Color:</span>
              {['#000000', '#0f172a', '#1e3a8a', '#801838'].map((col) => (
                <button
                  key={col}
                  onClick={() => setPenColor(col)}
                  className={`w-6 h-6 rounded-full border border-slate-300 transition-transform ${
                    penColor === col ? 'scale-125 ring-2 ring-indigo-500' : ''
                  }`}
                  style={{ backgroundColor: col }}
                />
              ))}
            </div>

            <div className="flex items-center gap-2">
              <span className="text-slate-600 text-xs font-medium">Width:</span>
              <input
                type="range"
                min="1"
                max="8"
                value={penWidth}
                onChange={(e) => setPenWidth(Number(e.target.value))}
                className="w-20 accent-indigo-600"
              />
            </div>
          </div>

          <div className="pt-3 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2">
            <label className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-lg text-xs font-medium cursor-pointer transition-colors">
              <Upload className="w-4 h-4 text-slate-500" />
              <span>Upload Image</span>
              <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
            </label>

            <div className="flex items-center gap-2">
              <button
                onClick={handleClear}
                className="flex items-center gap-1 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium rounded-lg transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Clear
              </button>
              <button
                onClick={handleSave}
                className="flex items-center gap-1 px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors"
              >
                <Check className="w-4 h-4" />
                Apply
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
