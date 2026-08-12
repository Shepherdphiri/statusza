import React from 'react';
import {
  FileText,
  Download,
  Upload,
  Sliders,
  Move,
  RotateCcw,
  ZoomIn,
  ZoomOut,
  Sparkles,
  FileCode,
} from 'lucide-react';

interface TopToolbarProps {
  onToggleDrawer: () => void;
  isDrawerOpen: boolean;
  onExportPdf: () => void;
  isExportingPdf: boolean;
  onExportJson: () => void;
  onImportJson: (e: React.ChangeEvent<HTMLInputElement>) => void;
  isDragMode: boolean;
  onToggleDragMode: () => void;
  onResetLayout: () => void;
  zoom: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
}

export function TopToolbar({
  onToggleDrawer,
  isDrawerOpen,
  onExportPdf,
  isExportingPdf,
  onExportJson,
  onImportJson,
  isDragMode,
  onToggleDragMode,
  onResetLayout,
  zoom,
  onZoomIn,
  onZoomOut,
}: TopToolbarProps) {
  return (
    <header className="bg-slate-900 border-b border-slate-800 text-white sticky top-0 z-30 shadow-md">
      <div className="max-w-7xl mx-auto px-4 py-2.5 flex flex-wrap items-center justify-between gap-3">
        {/* Brand & Document Name */}
        <div className="flex items-center gap-3">
          <div className="bg-indigo-600 p-2 rounded-lg text-white shadow-xs">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-bold text-sm leading-tight text-white flex items-center gap-2">
              <span>RSA Refugee Document BI-1693</span>
              <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded-full font-mono">
                Section 24
              </span>
            </h1>
            <p className="text-[11px] text-slate-400">
              Department of Home Affairs Document Creator
            </p>
          </div>
        </div>

        {/* Toolbar Action Buttons */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          {/* Drawer Form Button */}
          <button
            onClick={onToggleDrawer}
            className={`flex items-center gap-1.5 px-3.5 py-2 font-semibold rounded-lg transition-all ${
              isDrawerOpen
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
            }`}
          >
            <Sliders className="w-4 h-4 text-indigo-400" />
            <span>Form Drawer</span>
          </button>

          {/* Drag & Drop Layout Mode Toggle */}
          <button
            onClick={onToggleDragMode}
            className={`flex items-center gap-1.5 px-3 py-2 font-semibold rounded-lg transition-all ${
              isDragMode
                ? 'bg-amber-500 text-slate-950 font-bold ring-2 ring-amber-300'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
            }`}
          >
            <Move className="w-4 h-4" />
            <span>{isDragMode ? 'Exit Drag Mode' : 'Drag Layout'}</span>
          </button>

          {/* Reset Layout if in drag mode */}
          {isDragMode && (
            <button
              onClick={onResetLayout}
              className="flex items-center gap-1 px-2.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors"
              title="Reset Element Positions"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Layout</span>
            </button>
          )}

          {/* Zoom Controls */}
          <div className="flex items-center bg-slate-800 rounded-lg p-0.5 text-slate-300">
            <button
              onClick={onZoomOut}
              className="p-1.5 hover:text-white rounded hover:bg-slate-700 transition-colors"
              title="Zoom Out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="px-2 font-mono text-[11px] font-medium text-slate-300">
              {Math.round(zoom * 100)}%
            </span>
            <button
              onClick={onZoomIn}
              className="p-1.5 hover:text-white rounded hover:bg-slate-700 transition-colors"
              title="Zoom In"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="h-5 w-px bg-slate-800 mx-1 hidden sm:block" />

          {/* Template JSON Export / Import */}
          <div className="flex items-center gap-1">
            <button
              onClick={onExportJson}
              className="flex items-center gap-1 px-2.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium rounded-lg transition-colors"
              title="Export Template Data (.json)"
            >
              <FileCode className="w-3.5 h-3.5 text-slate-400" />
              <span>Save Template</span>
            </button>

            <label
              className="flex items-center gap-1 px-2.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium rounded-lg cursor-pointer transition-colors"
              title="Load Template Data (.json)"
            >
              <Upload className="w-3.5 h-3.5 text-slate-400" />
              <span>Load Template</span>
              <input
                type="file"
                accept=".json"
                onChange={onImportJson}
                className="hidden"
              />
            </label>
          </div>

          {/* Export Fine PDF */}
          <button
            onClick={onExportPdf}
            disabled={isExportingPdf}
            className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg shadow-sm transition-all disabled:opacity-50"
          >
            <Download className="w-4 h-4" />
            <span>{isExportingPdf ? 'Exporting...' : 'Export Fine PDF'}</span>
          </button>
        </div>
      </div>
    </header>
  );
}
