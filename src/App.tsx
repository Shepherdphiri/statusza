import React, { useState, useEffect } from 'react';
import { DocumentState, ElementKey, ElementPosition } from './types';
import { defaultDocumentState } from './data/defaultData';
import { DocumentCanvas } from './components/DocumentCanvas';
import { FormDrawer } from './components/FormDrawer';
import { TopToolbar } from './components/TopToolbar';
import { SignatureCanvasModal } from './components/SignatureCanvasModal';
import { exportDocumentToPdf } from './utils/pdfExport';
import { Info, Sparkles, CheckCircle2, AlertCircle } from 'lucide-react';

export default function App() {
  const [docState, setDocState] = useState<DocumentState>(() => {
    const saved = localStorage.getItem('rsa_refugee_doc_state');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.warn('Failed to parse saved state, using default.');
      }
    }
    return defaultDocumentState;
  });

  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(true);
  const [isDragMode, setIsDragMode] = useState<boolean>(false);
  const [isExportingPdf, setIsExportingPdf] = useState<boolean>(false);
  const [zoom, setZoom] = useState<number>(0.9);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Signature Modal state
  const [signatureModal, setSignatureModal] = useState<{
    isOpen: boolean;
    title: string;
    onSave: (url: string) => void;
  }>({
    isOpen: false,
    title: '',
    onSave: () => {},
  });

  // Save to localStorage on state change
  useEffect(() => {
    localStorage.setItem('rsa_refugee_doc_state', JSON.stringify(docState));
  }, [docState]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleUpdatePosition = (key: ElementKey, x: number, y: number) => {
    setDocState((prev) => ({
      ...prev,
      layout: {
        ...prev.layout,
        [key]: {
          ...(prev.layout[key] || { x: 0, y: 0, scale: 1 }),
          x,
          y,
        },
      },
    }));
  };

  const handleUpdateElementLayout = (key: ElementKey, updates: Partial<ElementPosition>) => {
    setDocState((prev) => ({
      ...prev,
      layout: {
        ...prev.layout,
        [key]: {
          ...(prev.layout[key] || { x: 0, y: 0, scale: 1 }),
          ...updates,
        },
      },
    }));
  };

  const handleUpdateTextFormat = (key: ElementKey, format: any) => {
    setDocState((prev) => ({
      ...prev,
      textFormats: {
        ...(prev.textFormats || {}),
        [key]: format,
      },
    }));
  };

  const handleToggleVisibility = (key: ElementKey) => {
    setDocState((prev) => ({
      ...prev,
      layout: {
        ...prev.layout,
        [key]: {
          ...(prev.layout[key] || { x: 0, y: 0 }),
          visible: prev.layout[key]?.visible === false ? true : false,
        },
      },
    }));
  };

  const handleResetLayout = () => {
    setDocState((prev) => ({
      ...prev,
      layout: defaultDocumentState.layout,
    }));
    showToast('Layout element positions reset to default.');
  };

  const handleResetToDefault = () => {
    if (window.confirm('Reset all form fields and styling back to original sample document?')) {
      setDocState(defaultDocumentState);
      showToast('Document reset to original sample entries.');
    }
  };

  const handleExportPdf = async () => {
    setIsExportingPdf(true);
    try {
      await exportDocumentToPdf(
        'rsa-document-canvas',
        `RSA_Refugee_Status_BI-1693_${docState.particulars.nameAndSurname.replace(/\s+/g, '_')}.pdf`
      );
      showToast('PDF exported successfully!');
    } catch (err) {
      console.error('PDF export error:', err);
      showToast('Failed to export PDF. Please check canvas rendering.');
    } finally {
      setIsExportingPdf(false);
    }
  };

  const handleExportJson = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(docState, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute(
      'download',
      `BI-1693_Template_${docState.particulars.nameAndSurname.replace(/\s+/g, '_')}.json`
    );
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    showToast('Template JSON file exported!');
  };

  const handleImportJson = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const parsed = JSON.parse(event.target?.result as string);
          if (parsed && parsed.particulars) {
            setDocState(parsed);
            showToast('Template JSON loaded successfully!');
          } else {
            showToast('Invalid template JSON format.');
          }
        } catch (err) {
          showToast('Failed to parse JSON file.');
        }
      };
      reader.readAsText(file);
    }
  };

  const handleOpenSignatureModal = (title: string, onSave: (url: string) => void) => {
    setSignatureModal({
      isOpen: true,
      title,
      onSave,
    });
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Top Action Navigation Bar */}
      <TopToolbar
        onToggleDrawer={() => setIsDrawerOpen(!isDrawerOpen)}
        isDrawerOpen={isDrawerOpen}
        onExportPdf={handleExportPdf}
        isExportingPdf={isExportingPdf}
        onExportJson={handleExportJson}
        onImportJson={handleImportJson}
        isDragMode={isDragMode}
        onToggleDragMode={() => setIsDragMode(!isDragMode)}
        onResetLayout={handleResetLayout}
        zoom={zoom}
        onZoomIn={() => setZoom((z) => Math.min(z + 0.1, 1.3))}
        onZoomOut={() => setZoom((z) => Math.max(z - 0.1, 0.55))}
      />

      {/* Main Workspace */}
      <div className="flex-1 flex relative overflow-hidden">
        {/* Document Editor Stage */}
        <main className="flex-1 overflow-auto p-6 md:p-10 flex flex-col items-center justify-start bg-slate-950/90 relative">
          {/* Notification Banner / Toast */}
          {toastMessage && (
            <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 bg-slate-900 border border-indigo-500/40 text-white px-4 py-2.5 rounded-xl shadow-2xl flex items-center gap-2 text-xs font-semibold animate-fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>{toastMessage}</span>
            </div>
          )}

          {/* Drag Mode Banner */}
          {isDragMode && (
            <div className="mb-4 bg-amber-500/10 border border-amber-500/40 text-amber-200 px-4 py-2 rounded-xl text-xs flex items-center gap-2 shadow-sm">
              <Info className="w-4 h-4 text-amber-400 flex-shrink-0" />
              <span>
                <strong>Drag & Drop Layout Active:</strong> Click and drag any document section (Header, Emblem, Photo, Particulars, Stamp) to adjust its position.
              </span>
            </div>
          )}

          {/* A4 Canvas Container Wrapper */}
          <div className="relative my-4 flex justify-center w-full">
            <DocumentCanvas
              state={docState}
              isDragMode={isDragMode}
              onUpdatePosition={handleUpdatePosition}
              onUpdateElementLayout={handleUpdateElementLayout}
              onUpdateTextFormat={handleUpdateTextFormat}
              onToggleVisibility={handleToggleVisibility}
              onChangeState={setDocState}
              scale={zoom}
            />
          </div>
        </main>

        {/* Slide-out Form Drawer */}
        <FormDrawer
          isOpen={isDrawerOpen}
          onClose={() => setIsDrawerOpen(false)}
          state={docState}
          onChangeState={setDocState}
          onOpenSignatureModal={handleOpenSignatureModal}
          onResetToDefault={handleResetToDefault}
        />
      </div>

      {/* Signature & Fingerprint Pad Modal */}
      <SignatureCanvasModal
        isOpen={signatureModal.isOpen}
        onClose={() => setSignatureModal((prev) => ({ ...prev, isOpen: false }))}
        onSave={signatureModal.onSave}
        title={signatureModal.title}
      />
    </div>
  );
}
