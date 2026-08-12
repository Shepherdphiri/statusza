import React, { useRef, useEffect, useState } from 'react';
import { DocumentState, ElementKey, ElementPosition, TextFormatSettings, CustomTextBlock } from '../types';
import { CoatOfArms } from './CoatOfArms';
import { generateBarcodeSvg } from '../utils/barcode';
import {
  Move,
  Type,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Bold,
  Palette,
  Minus,
  Plus,
  Eye,
  EyeOff,
  Upload,
  RotateCcw,
  Maximize2,
  Trash2,
} from 'lucide-react';

interface DocumentCanvasProps {
  state: DocumentState;
  isDragMode: boolean;
  onUpdatePosition?: (key: ElementKey, x: number, y: number) => void;
  onUpdateElementLayout?: (key: ElementKey, updates: Partial<ElementPosition>) => void;
  onUpdateTextFormat?: (key: ElementKey, format: TextFormatSettings) => void;
  onToggleVisibility?: (key: ElementKey) => void;
  onChangeState?: (newState: DocumentState) => void;
  scale?: number;
}

export function DocumentCanvas({
  state,
  isDragMode,
  onUpdatePosition,
  onUpdateElementLayout,
  onUpdateTextFormat,
  onToggleVisibility,
  onChangeState,
  scale = 1.0,
}: DocumentCanvasProps) {
  const { metadata, particulars, officials, stamp, background, photoUrl, layout, textFormats } = state;

  const [topBarcodeSvg, setTopBarcodeSvg] = useState('');
  const [bottomBarcodeSvg, setBottomBarcodeSvg] = useState('');

  // Active element selection for dragging & formatting
  const [selectedKey, setSelectedKey] = useState<ElementKey>('particulars');
  const [selectedCustomTextId, setSelectedCustomTextId] = useState<string | null>(null);

  // Dragging state
  const [activeDragKey, setActiveDragKey] = useState<ElementKey | null>(null);
  const dragStartRef = useRef<{ x: number; y: number; initialX: number; initialY: number } | null>(null);

  // Resizing / scaling state
  const [activeResizeKey, setActiveResizeKey] = useState<ElementKey | null>(null);
  const resizeStartRef = useRef<{ x: number; y: number; initialScale: number } | null>(null);

  // Custom Text Drag & Resize state
  const [activeDragCustomTextId, setActiveDragCustomTextId] = useState<string | null>(null);
  const dragCustomTextStartRef = useRef<{ x: number; y: number; initialX: number; initialY: number } | null>(null);

  const [activeResizeCustomTextId, setActiveResizeCustomTextId] = useState<string | null>(null);
  const resizeCustomTextStartRef = useRef<{ x: number; y: number; initialScale: number } | null>(null);

  const handleResizeMouseDown = (key: ElementKey, e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setSelectedKey(key);
    setSelectedCustomTextId(null);
    setActiveResizeKey(key);
    const pos = layout[key] || { x: 0, y: 0, scale: 1 };
    resizeStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      initialScale: pos.scale !== undefined ? pos.scale : 1.0,
    };
  };

  const handleAddCustomText = () => {
    const newText: CustomTextBlock = {
      id: `custom_${Date.now()}`,
      text: 'CUSTOM TEXT ANNOTATION',
      x: 180,
      y: 280 + (state.customTexts?.length || 0) * 30,
      scale: 1.0,
      fontSize: 13,
      fontWeight: 'bold',
      fontFamily: 'arial',
      color: '#000000',
      textAlign: 'left',
      visible: true,
    };
    if (onChangeState) {
      onChangeState({
        ...state,
        customTexts: [...(state.customTexts || []), newText],
      });
      setSelectedCustomTextId(newText.id);
    }
  };

  const updateCustomText = (id: string, changes: Partial<CustomTextBlock>) => {
    if (!onChangeState) return;
    const updated = (state.customTexts || []).map((ct) =>
      ct.id === id ? { ...ct, ...changes } : ct
    );
    onChangeState({
      ...state,
      customTexts: updated,
    });
  };

  const deleteCustomText = (id: string) => {
    if (!onChangeState) return;
    const filtered = (state.customTexts || []).filter((ct) => ct.id !== id);
    onChangeState({
      ...state,
      customTexts: filtered,
    });
    if (selectedCustomTextId === id) {
      setSelectedCustomTextId(null);
    }
  };

  const handleCustomTextMouseDown = (item: CustomTextBlock, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedCustomTextId(item.id);
    setActiveDragCustomTextId(item.id);
    dragCustomTextStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      initialX: item.x,
      initialY: item.y,
    };
  };

  const handleCustomTextResizeMouseDown = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setSelectedCustomTextId(id);
    setActiveResizeCustomTextId(id);
    const item = (state.customTexts || []).find((ct) => ct.id === id);
    resizeCustomTextStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      initialScale: item?.scale !== undefined ? item.scale : 1.0,
    };
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (activeResizeKey && resizeStartRef.current && onUpdateElementLayout) {
        const dx = (e.clientX - resizeStartRef.current.x) / scale;
        const dy = (e.clientY - resizeStartRef.current.y) / scale;
        const deltaAvg = (dx + dy) / 2;
        const scaleChange = deltaAvg / 100;
        const newScale = Math.max(0.3, Math.min(3.0, Math.round((resizeStartRef.current.initialScale + scaleChange) * 100) / 100));
        onUpdateElementLayout(activeResizeKey, { scale: newScale });
      }

      if (activeDragCustomTextId && dragCustomTextStartRef.current && onChangeState) {
        const dx = (e.clientX - dragCustomTextStartRef.current.x) / scale;
        const dy = (e.clientY - dragCustomTextStartRef.current.y) / scale;
        const newX = Math.round(dragCustomTextStartRef.current.initialX + dx);
        const newY = Math.round(dragCustomTextStartRef.current.initialY + dy);
        updateCustomText(activeDragCustomTextId, { x: newX, y: newY });
      }

      if (activeResizeCustomTextId && resizeCustomTextStartRef.current && onChangeState) {
        const dx = (e.clientX - resizeCustomTextStartRef.current.x) / scale;
        const dy = (e.clientY - resizeCustomTextStartRef.current.y) / scale;
        const delta = (dx + dy) / 2;
        const scaleChange = delta / 100;
        const newScale = Math.max(
          0.3,
          Math.min(3.0, Math.round((resizeCustomTextStartRef.current.initialScale + scaleChange) * 100) / 100)
        );
        updateCustomText(activeResizeCustomTextId, { scale: newScale });
      }
    };

    const handleMouseUp = () => {
      setActiveResizeKey(null);
      resizeStartRef.current = null;
      setActiveDragCustomTextId(null);
      dragCustomTextStartRef.current = null;
      setActiveResizeCustomTextId(null);
      resizeCustomTextStartRef.current = null;
    };

    if (activeResizeKey || activeDragCustomTextId || activeResizeCustomTextId) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [activeResizeKey, activeDragCustomTextId, activeResizeCustomTextId, onUpdateElementLayout, scale]);

  useEffect(() => {
    setTopBarcodeSvg(generateBarcodeSvg(metadata.topBarcodeValue || 'CTRMW000660412', 28, 1.1, false));
    setBottomBarcodeSvg(generateBarcodeSvg(metadata.bottomBarcodeValue || '200141870', 32, 1.25, false));
  }, [metadata.topBarcodeValue, metadata.bottomBarcodeValue]);

  const handleMouseDown = (key: ElementKey, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedKey(key);
    setSelectedCustomTextId(null);

    if (!onUpdatePosition) return;

    // Start dragging
    setActiveDragKey(key);
    const pos = layout[key] || { x: 0, y: 0 };
    dragStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      initialX: pos.x,
      initialY: pos.y,
    };
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!activeDragKey || !dragStartRef.current || !onUpdatePosition) return;
      const dx = (e.clientX - dragStartRef.current.x) / scale;
      const dy = (e.clientY - dragStartRef.current.y) / scale;
      const newX = Math.round(dragStartRef.current.initialX + dx);
      const newY = Math.round(dragStartRef.current.initialY + dy);
      onUpdatePosition(activeDragKey, newX, newY);
    };

    const handleMouseUp = () => {
      setActiveDragKey(null);
      dragStartRef.current = null;
    };

    if (activeDragKey) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [activeDragKey, onUpdatePosition, scale]);

  const fontFamilyMap: Record<string, string> = {
    arial: 'Arial, "Helvetica Neue", Helvetica, sans-serif',
    helvetica: 'Helvetica, Arial, "Helvetica Neue", sans-serif',
    sans: 'ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    times: '"Times New Roman", Times, Georgia, serif',
    georgia: 'Georgia, Cambria, "Times New Roman", Times, serif',
    serif: 'Georgia, Cambria, "Times New Roman", Times, serif',
    trebuchet: '"Trebuchet MS", "Lucida Sans Unicode", "Lucida Grande", sans-serif',
    verdana: 'Verdana, Geneva, sans-serif',
    impact: 'Impact, Haettenschweiler, "Arial Narrow Bold", sans-serif',
    courier: '"Courier New", Courier, monospace',
    mono: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
  };

  const fontWeightMap: Record<string, number> = {
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
    extrabold: 800,
    black: 900,
  };

  const getElementStyle = (key: ElementKey): React.CSSProperties => {
    const pos = layout[key] || { x: 0, y: 0 };
    const fmt = textFormats?.[key] || {};
    const scaleVal = pos.scale !== undefined ? pos.scale : 1.0;

    return {
      transform: `translate(${pos.x}px, ${pos.y}px) scale(${scaleVal})`,
      transformOrigin: 'top left',
      transition: activeDragKey === key || activeResizeKey === key ? 'none' : 'transform 0.1s ease-out',
      display: pos.visible === false ? 'none' : 'block',
      width: pos.width ? `${pos.width}px` : undefined,
      height: pos.height ? `${pos.height}px` : undefined,
      fontSize: fmt.fontSize ? `${fmt.fontSize}px` : undefined,
      fontWeight: fmt.fontWeight ? fontWeightMap[fmt.fontWeight] || 700 : undefined,
      fontFamily: fmt.fontFamily ? fontFamilyMap[fmt.fontFamily] || fontFamilyMap.arial : fontFamilyMap.arial,
      color: fmt.color || undefined,
      textAlign: fmt.textAlign || undefined,
      lineHeight: fmt.lineHeight || undefined,
      letterSpacing: fmt.letterSpacing || undefined,
    };
  };

  const renderResizeGrip = (key: ElementKey) => {
    if (selectedKey !== key || selectedCustomTextId !== null || !onUpdateElementLayout) return null;
    return (
      <div
        onMouseDown={(e) => handleResizeMouseDown(key, e)}
        className="selection-badge pdf-hide absolute -bottom-2 -right-2 w-5 h-5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full flex items-center justify-center cursor-nwse-resize shadow-lg z-50 hover:scale-125 transition-transform"
        data-pdf-hide="true"
        title="Drag corner to scale/resize element"
      >
        <Maximize2 className="w-3 h-3" />
      </div>
    );
  };

  const getDragWrapperClass = (key: ElementKey) => {
    const isSelected = selectedKey === key && selectedCustomTextId === null;
    const isDragging = activeDragKey === key;

    return `relative cursor-move transition-all rounded ${
      isDragging
        ? 'ring-2 ring-amber-500 shadow-xl z-40'
        : isSelected
        ? 'ring-2 ring-indigo-500/80 ring-offset-1 z-30 bg-indigo-500/5 selection-ring'
        : 'hover:ring-1 hover:ring-indigo-400/60 hover:ring-offset-1'
    }`;
  };

  // Current active formatting for selected element
  const currentFormat: TextFormatSettings = textFormats?.[selectedKey] || {
    fontSize: 13,
    fontWeight: 'bold',
    fontFamily: 'arial',
    color: '#000000',
    textAlign: 'left',
    lineHeight: 1.25,
  };

  const updateSelectedFormat = (changes: Partial<TextFormatSettings>) => {
    if (!onUpdateTextFormat) return;
    onUpdateTextFormat(selectedKey, {
      ...currentFormat,
      ...changes,
    });
  };

  const activeCustomText = (state.customTexts || []).find((ct) => ct.id === selectedCustomTextId);

  // Background Paper Texture Styles
  const getPaperBgStyle = (): React.CSSProperties => {
    if (background.paperStyle === 'custom-image' && background.customBgImageUrl) {
      return {
        backgroundImage: `url(${background.customBgImageUrl})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      };
    }
    if (background.paperStyle === 'aged-vintage') {
      return {
        backgroundColor: '#fbf7ee',
        backgroundImage: 'radial-gradient(#e5d8b8 1px, transparent 0)',
        backgroundSize: '16px 16px',
      };
    }
    if (background.paperStyle === 'authentic') {
      return {
        backgroundColor: '#fdfbfb',
        backgroundImage: `radial-gradient(rgba(216, 35, 98, ${background.paperTextureOpacity}), transparent 0.75px)`,
        backgroundSize: '12px 12px',
      };
    }
    if (background.paperStyle === 'creme-pattern') {
      return {
        backgroundColor: '#faf8f5',
        backgroundImage:
          'linear-gradient(45deg, #f2efe9 25%, transparent 25%, transparent 75%, #f2efe9 75%, #f2efe9)',
        backgroundSize: '20px 20px',
      };
    }
    return { backgroundColor: '#ffffff' };
  };

  return (
    <div className="flex flex-col items-center w-full">
      {/* Floating Interactive Formatting Bar */}
      <div className="mb-4 bg-slate-900 border border-slate-700/80 text-white rounded-xl shadow-2xl px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs w-full max-w-[794px] z-30">
        <div className="flex items-center gap-2">
          <Type className="w-4 h-4 text-indigo-400 flex-shrink-0" />
          <span className="font-semibold text-slate-300">Target Element:</span>
          <select
            value={selectedCustomTextId ? `custom:${selectedCustomTextId}` : selectedKey}
            onChange={(e) => {
              const val = e.target.value;
              if (val.startsWith('custom:')) {
                setSelectedCustomTextId(val.replace('custom:', ''));
              } else {
                setSelectedCustomTextId(null);
                setSelectedKey(val as ElementKey);
              }
            }}
            className="bg-slate-800 border border-slate-700 text-white rounded-lg px-2.5 py-1 font-medium focus:outline-none focus:ring-1 focus:ring-indigo-500"
          >
            <optgroup label="Standard Document Elements">
              <option value="header">Top Header Text</option>
              <option value="topBarcode">Top Barcode</option>
              <option value="coatOfArms">Coat of Arms Emblem</option>
              <option value="coatOfArmsText">Emblem Subtext ("REPUBLIC OF SOUTH AFRICA")</option>
              <option value="biBox">BI-1693 Box</option>
              <option value="photo">Refugee Photo</option>
              <option value="title">Main Document Titles</option>
              <option value="particulars">Refugee Particulars List</option>
              <option value="certification">Certification Paragraph</option>
              <option value="directorGeneral">Director-General Block</option>
              <option value="stampBlock">Official Reception Stamp</option>
              <option value="officialsTable">Reception Officials Table</option>
              <option value="bottomBarcode">Bottom Barcode</option>
              <option value="formCode">Bottom Right Form Code</option>
            </optgroup>
            {state.customTexts && state.customTexts.length > 0 && (
              <optgroup label="Custom Text Blocks">
                {state.customTexts.map((ct, idx) => (
                  <option key={ct.id} value={`custom:${ct.id}`}>
                    Text #{idx + 1}: {ct.text.slice(0, 18)}{ct.text.length > 18 ? '...' : ''}
                  </option>
                ))}
              </optgroup>
            )}
          </select>

          <button
            onClick={handleAddCustomText}
            className="flex items-center gap-1 bg-amber-600 hover:bg-amber-500 text-white font-semibold px-2.5 py-1 rounded-lg shadow transition-colors text-[11px]"
            title="Add Custom Text Block onto Canvas"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ Custom Text</span>
          </button>

          {/* Quick Background Upload/Replace */}
          {onChangeState && (
            <label
              className="flex items-center gap-1 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-2.5 py-1 rounded-lg shadow transition-colors text-[11px] cursor-pointer"
              title="Upload or replace document background image scan"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>{background.customBgImageUrl ? 'Replace Bg Image' : 'Upload Bg Image'}</span>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    const reader = new FileReader();
                    reader.onload = (evt) => {
                      if (evt.target?.result) {
                        onChangeState({
                          ...state,
                          background: {
                            ...state.background,
                            customBgImageUrl: evt.target.result as string,
                            paperStyle: 'custom-image',
                          },
                        });
                      }
                    };
                    reader.readAsDataURL(file);
                    e.target.value = '';
                  }
                }}
                className="hidden"
              />
            </label>
          )}

          {onChangeState && background.customBgImageUrl && (
            <button
              onClick={() => {
                onChangeState({
                  ...state,
                  background: {
                    ...state.background,
                    customBgImageUrl: undefined,
                    paperStyle: state.background.paperStyle === 'custom-image' ? 'authentic' : state.background.paperStyle,
                  },
                });
              }}
              className="flex items-center gap-1 bg-slate-800 hover:bg-slate-700 text-rose-300 font-semibold px-2 py-1 rounded-lg border border-slate-700 text-[11px] transition-colors"
              title="Reset to default background pattern"
            >
              <RotateCcw className="w-3 h-3 text-rose-400" />
              <span>Reset Bg</span>
            </button>
          )}
        </div>

        {/* Floating Quick Edit for Selected Custom Text Block */}
        {selectedCustomTextId && activeCustomText && (
          <div className="flex items-center gap-1.5 bg-slate-800 border border-amber-500/80 rounded-lg px-2 py-0.5">
            <span className="text-amber-400 font-bold text-[10px]">Text:</span>
            <input
              type="text"
              value={activeCustomText.text}
              onChange={(e) => updateCustomText(activeCustomText.id, { text: e.target.value })}
              className="bg-slate-900 text-white font-bold px-1.5 py-0.5 rounded text-[11px] w-36 focus:outline-none focus:ring-1 focus:ring-amber-400"
              placeholder="Custom text..."
            />
            <button
              onClick={() => deleteCustomText(activeCustomText.id)}
              className="p-1 text-red-400 hover:text-red-300 rounded hover:bg-slate-700"
              title="Delete Custom Text"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Formatting Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Font Family */}
          <select
            value={
              selectedCustomTextId && activeCustomText
                ? activeCustomText.fontFamily || 'arial'
                : currentFormat.fontFamily || 'arial'
            }
            onChange={(e) => {
              if (selectedCustomTextId && activeCustomText) {
                updateCustomText(activeCustomText.id, { fontFamily: e.target.value });
              } else {
                updateSelectedFormat({ fontFamily: e.target.value as any });
              }
            }}
            className="bg-slate-800 border border-slate-700 text-slate-200 rounded-lg px-2 py-1 font-mono text-[11px]"
            title="Font Family"
          >
            <option value="arial">Arial (Standard)</option>
            <option value="helvetica">Helvetica</option>
            <option value="times">Times New Roman</option>
            <option value="georgia">Georgia</option>
            <option value="trebuchet">Trebuchet MS</option>
            <option value="verdana">Verdana</option>
            <option value="impact">Impact</option>
            <option value="sans">System Sans-Serif</option>
            <option value="serif">Georgia Serif</option>
            <option value="courier">Courier New</option>
            <option value="mono">Monospace</option>
          </select>

          {/* Font Size Adjuster */}
          <div className="flex items-center bg-slate-800 rounded-lg border border-slate-700 px-1 py-0.5">
            <button
              onClick={() => {
                if (selectedCustomTextId && activeCustomText) {
                  updateCustomText(activeCustomText.id, {
                    fontSize: Math.max((activeCustomText.fontSize || 13) - 1, 8),
                  });
                } else {
                  updateSelectedFormat({ fontSize: Math.max((currentFormat.fontSize || 12) - 1, 8) });
                }
              }}
              className="p-1 hover:text-white rounded text-slate-400 hover:bg-slate-700"
              title="Decrease Font Size"
            >
              <Minus className="w-3 h-3" />
            </button>
            <span className="px-1.5 font-mono text-[11px] font-bold text-indigo-300">
              {selectedCustomTextId && activeCustomText
                ? activeCustomText.fontSize || 13
                : currentFormat.fontSize || 12}
              px
            </span>
            <button
              onClick={() => {
                if (selectedCustomTextId && activeCustomText) {
                  updateCustomText(activeCustomText.id, {
                    fontSize: Math.min((activeCustomText.fontSize || 13) + 1, 48),
                  });
                } else {
                  updateSelectedFormat({ fontSize: Math.min((currentFormat.fontSize || 12) + 1, 36) });
                }
              }}
              className="p-1 hover:text-white rounded text-slate-400 hover:bg-slate-700"
              title="Increase Font Size"
            >
              <Plus className="w-3 h-3" />
            </button>
          </div>

          {/* Font Weight */}
          <select
            value={
              selectedCustomTextId && activeCustomText
                ? activeCustomText.fontWeight || 'bold'
                : currentFormat.fontWeight || 'bold'
            }
            onChange={(e) => {
              if (selectedCustomTextId && activeCustomText) {
                updateCustomText(activeCustomText.id, { fontWeight: e.target.value as any });
              } else {
                updateSelectedFormat({ fontWeight: e.target.value as any });
              }
            }}
            className="bg-slate-800 border border-slate-700 text-slate-200 rounded-lg px-2 py-1 text-[11px]"
            title="Font Weight"
          >
            <option value="normal">Normal</option>
            <option value="medium">Medium</option>
            <option value="semibold">SemiBold</option>
            <option value="bold">Bold</option>
            <option value="extrabold">ExtraBold</option>
            <option value="black">Black</option>
          </select>

          {/* Text Alignment */}
          <div className="flex items-center bg-slate-800 rounded-lg border border-slate-700 p-0.5">
            <button
              onClick={() => {
                if (selectedCustomTextId && activeCustomText) {
                  updateCustomText(activeCustomText.id, { textAlign: 'left' });
                } else {
                  updateSelectedFormat({ textAlign: 'left' });
                }
              }}
              className={`p-1 rounded ${
                (selectedCustomTextId && activeCustomText
                  ? activeCustomText.textAlign === 'left'
                  : currentFormat.textAlign === 'left')
                  ? 'bg-indigo-600 text-white'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Align Left"
            >
              <AlignLeft className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => {
                if (selectedCustomTextId && activeCustomText) {
                  updateCustomText(activeCustomText.id, { textAlign: 'center' });
                } else {
                  updateSelectedFormat({ textAlign: 'center' });
                }
              }}
              className={`p-1 rounded ${
                (selectedCustomTextId && activeCustomText
                  ? activeCustomText.textAlign === 'center'
                  : currentFormat.textAlign === 'center')
                  ? 'bg-indigo-600 text-white'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Align Center"
            >
              <AlignCenter className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => {
                if (selectedCustomTextId && activeCustomText) {
                  updateCustomText(activeCustomText.id, { textAlign: 'right' });
                } else {
                  updateSelectedFormat({ textAlign: 'right' });
                }
              }}
              className={`p-1 rounded ${
                (selectedCustomTextId && activeCustomText
                  ? activeCustomText.textAlign === 'right'
                  : currentFormat.textAlign === 'right')
                  ? 'bg-indigo-600 text-white'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Align Right"
            >
              <AlignRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Color Picker */}
          <div className="flex items-center gap-1 bg-slate-800 border border-slate-700 rounded-lg px-2 py-1">
            <Palette className="w-3.5 h-3.5 text-slate-400" />
            <input
              type="color"
              value={
                selectedCustomTextId && activeCustomText
                  ? activeCustomText.color || '#000000'
                  : currentFormat.color || '#000000'
              }
              onChange={(e) => {
                if (selectedCustomTextId && activeCustomText) {
                  updateCustomText(activeCustomText.id, { color: e.target.value });
                } else {
                  updateSelectedFormat({ color: e.target.value });
                }
              }}
              className="w-4 h-4 rounded cursor-pointer bg-transparent border-0"
              title="Text Color"
            />
          </div>

          {/* Element Size & Scale controls */}
          <div className="flex items-center gap-1 bg-slate-800 border border-slate-700 rounded-lg px-2 py-1 text-[11px]">
            <Maximize2 className="w-3.5 h-3.5 text-indigo-400" />
            <span className="text-slate-400 font-semibold hidden sm:inline">Size:</span>
            <button
              onClick={() => {
                if (!onUpdateElementLayout) return;
                const currentScale = layout[selectedKey]?.scale !== undefined ? layout[selectedKey].scale! : 1.0;
                const newScale = Math.max(0.3, Math.round((currentScale - 0.1) * 10) / 10);
                onUpdateElementLayout(selectedKey, { scale: newScale });
              }}
              className="p-1 hover:text-white text-slate-300 hover:bg-slate-700 rounded"
              title="Scale Down Element"
            >
              <Minus className="w-3 h-3" />
            </button>
            <span className="font-mono font-bold text-amber-300 min-w-[36px] text-center">
              {Math.round((layout[selectedKey]?.scale !== undefined ? layout[selectedKey].scale! : 1.0) * 100)}%
            </span>
            <button
              onClick={() => {
                if (!onUpdateElementLayout) return;
                const currentScale = layout[selectedKey]?.scale !== undefined ? layout[selectedKey].scale! : 1.0;
                const newScale = Math.min(3.0, Math.round((currentScale + 0.1) * 10) / 10);
                onUpdateElementLayout(selectedKey, { scale: newScale });
              }}
              className="p-1 hover:text-white text-slate-300 hover:bg-slate-700 rounded"
              title="Scale Up Element"
            >
              <Plus className="w-3 h-3" />
            </button>
            {layout[selectedKey]?.scale !== undefined && layout[selectedKey].scale !== 1.0 && (
              <button
                onClick={() => {
                  if (!onUpdateElementLayout) return;
                  onUpdateElementLayout(selectedKey, { scale: 1.0 });
                }}
                className="p-0.5 text-slate-400 hover:text-amber-300 ml-0.5"
                title="Reset Size to 100%"
              >
                <RotateCcw className="w-3 h-3" />
              </button>
            )}
          </div>

          {/* Visibility Toggle */}
          {onToggleVisibility && (
            <button
              onClick={() => onToggleVisibility(selectedKey)}
              className={`flex items-center gap-1 px-2 py-1 rounded-lg border text-[11px] font-semibold transition-colors ${
                layout[selectedKey]?.visible === false
                  ? 'bg-rose-950/80 border-rose-700 text-rose-300 hover:bg-rose-900'
                  : 'bg-slate-800 border-slate-700 text-slate-300 hover:text-white'
              }`}
              title={layout[selectedKey]?.visible === false ? 'Show Element' : 'Hide Element'}
            >
              {layout[selectedKey]?.visible === false ? (
                <>
                  <EyeOff className="w-3.5 h-3.5 text-rose-400" />
                  <span>Hidden</span>
                </>
              ) : (
                <>
                  <Eye className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Visible</span>
                </>
              )}
            </button>
          )}

          {/* Quick Emblem Replace & Reset */}
          {(selectedKey === 'coatOfArms' || selectedKey === 'coatOfArmsText') && onChangeState && (
            <div className="flex items-center gap-1.5 pl-1.5 border-l border-slate-700">
              <label className="flex items-center gap-1 bg-amber-600 hover:bg-amber-700 text-white font-semibold px-2 py-1 rounded cursor-pointer text-[11px] transition-colors shadow-xs">
                <Upload className="w-3.5 h-3.5" />
                <span>Replace Emblem</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onload = (evt) => {
                        if (evt.target?.result) {
                          onChangeState({
                            ...state,
                            customCoatOfArmsUrl: evt.target.result as string,
                          });
                        }
                      };
                      reader.readAsDataURL(file);
                    }
                  }}
                  className="hidden"
                />
              </label>

              {state.customCoatOfArmsUrl && (
                <button
                  onClick={() => onChangeState({ ...state, customCoatOfArmsUrl: undefined })}
                  className="flex items-center gap-1 bg-slate-800 hover:bg-slate-700 text-amber-300 px-2 py-1 rounded text-[11px] font-medium border border-slate-700"
                  title="Reset to Official RSA Coat of Arms"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Reset Official</span>
                </button>
              )}
            </div>
          )}

          {/* Top Barcode Replacement Toolbar */}
          {selectedKey === 'topBarcode' && onChangeState && (
            <div className="flex items-center gap-1.5 pl-1.5 border-l border-slate-700">
              <label className="flex items-center gap-1 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-2 py-1 rounded cursor-pointer text-[11px] transition-colors shadow-xs">
                <Upload className="w-3.5 h-3.5" />
                <span>Replace Top Barcode</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onload = (evt) => {
                        if (evt.target?.result) {
                          onChangeState({
                            ...state,
                            customTopBarcodeUrl: evt.target.result as string,
                          });
                        }
                      };
                      reader.readAsDataURL(file);
                    }
                  }}
                  className="hidden"
                />
              </label>
              {state.customTopBarcodeUrl && (
                <button
                  onClick={() => onChangeState({ ...state, customTopBarcodeUrl: undefined })}
                  className="flex items-center gap-1 bg-slate-800 hover:bg-slate-700 text-indigo-300 px-2 py-1 rounded text-[11px] font-medium border border-slate-700"
                  title="Reset to generated SVG barcode"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Reset Barcode</span>
                </button>
              )}
            </div>
          )}

          {/* Bottom Barcode Replacement Toolbar */}
          {selectedKey === 'bottomBarcode' && onChangeState && (
            <div className="flex items-center gap-1.5 pl-1.5 border-l border-slate-700">
              <label className="flex items-center gap-1 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-2 py-1 rounded cursor-pointer text-[11px] transition-colors shadow-xs">
                <Upload className="w-3.5 h-3.5" />
                <span>Replace Bottom Barcode</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onload = (evt) => {
                        if (evt.target?.result) {
                          onChangeState({
                            ...state,
                            customBottomBarcodeUrl: evt.target.result as string,
                          });
                        }
                      };
                      reader.readAsDataURL(file);
                    }
                  }}
                  className="hidden"
                />
              </label>
              {state.customBottomBarcodeUrl && (
                <button
                  onClick={() => onChangeState({ ...state, customBottomBarcodeUrl: undefined })}
                  className="flex items-center gap-1 bg-slate-800 hover:bg-slate-700 text-indigo-300 px-2 py-1 rounded text-[11px] font-medium border border-slate-700"
                  title="Reset to generated SVG barcode"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Reset Barcode</span>
                </button>
              )}
            </div>
          )}

          {/* Stamp Block Toolbar Controls */}
          {selectedKey === 'stampBlock' && (
            <div className="flex items-center gap-1.5 pl-1.5 border-l border-slate-700">
              <button
                onClick={() => {
                  if (onToggleVisibility) {
                    onToggleVisibility('stampBlock');
                  }
                }}
                className={`flex items-center gap-1 px-2.5 py-1 rounded text-[11px] font-bold shadow-xs transition-colors ${
                  layout.stampBlock?.visible === false
                    ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                    : 'bg-rose-600 hover:bg-rose-700 text-white'
                }`}
              >
                {layout.stampBlock?.visible === false ? (
                  <>
                    <Eye className="w-3.5 h-3.5" />
                    <span>Restore Stamp</span>
                  </>
                ) : (
                  <>
                    <EyeOff className="w-3.5 h-3.5" />
                    <span>Remove Stamp</span>
                  </>
                )}
              </button>
            </div>
          )}

          {/* Director-General Block Quick Edit Toolbar */}
          {selectedKey === 'directorGeneral' && onChangeState && (
            <div className="flex items-center gap-2 pl-2 border-l border-slate-700 flex-wrap text-xs">
              <div className="flex items-center gap-1">
                <span className="text-slate-400 font-medium">Title:</span>
                <input
                  type="text"
                  value={metadata.directorGeneralTitle || 'p.p. DIRECTOR-GENERAL'}
                  onChange={(e) =>
                    onChangeState({
                      ...state,
                      metadata: { ...state.metadata, directorGeneralTitle: e.target.value },
                    })
                  }
                  className="bg-slate-800 text-white px-2 py-0.5 rounded border border-slate-700 text-[11px] font-bold w-36 focus:ring-1 focus:ring-indigo-500"
                />
              </div>
              <div className="flex items-center gap-1">
                <span className="text-slate-400 font-medium">Dept:</span>
                <input
                  type="text"
                  value={metadata.directorGeneralDepartment || 'DEPARTMENT OF HOME AFFAIRS'}
                  onChange={(e) =>
                    onChangeState({
                      ...state,
                      metadata: { ...state.metadata, directorGeneralDepartment: e.target.value },
                    })
                  }
                  className="bg-slate-800 text-white px-2 py-0.5 rounded border border-slate-700 text-[11px] font-bold w-40 focus:ring-1 focus:ring-indigo-500"
                />
              </div>
              <div className="flex items-center gap-1">
                <span className="text-slate-400 font-medium">Date:</span>
                <input
                  type="text"
                  value={metadata.issuingDate}
                  onChange={(e) =>
                    onChangeState({
                      ...state,
                      metadata: { ...state.metadata, issuingDate: e.target.value },
                    })
                  }
                  className="bg-slate-800 text-white px-2 py-0.5 rounded border border-slate-700 text-[11px] font-bold w-24 focus:ring-1 focus:ring-indigo-500"
                />
              </div>
              <div className="flex items-center gap-1">
                <span className="text-slate-400 font-medium">Place:</span>
                <input
                  type="text"
                  value={metadata.issuingPlace}
                  onChange={(e) =>
                    onChangeState({
                      ...state,
                      metadata: { ...state.metadata, issuingPlace: e.target.value },
                    })
                  }
                  className="bg-slate-800 text-white px-2 py-0.5 rounded border border-slate-700 text-[11px] font-bold w-24 focus:ring-1 focus:ring-indigo-500"
                />
              </div>
            </div>
          )}

          {/* Officials Table Quick Edit Toolbar */}
          {selectedKey === 'officialsTable' && onChangeState && (
            <div className="flex items-center gap-2 pl-2 border-l border-slate-700 flex-wrap text-xs">
              <div className="flex items-center gap-1">
                <span className="text-slate-400 font-medium">Header:</span>
                <input
                  type="text"
                  value={officials.sectionHeader || 'REFUGEE RECEPTION OFFICIAL'}
                  onChange={(e) =>
                    onChangeState({
                      ...state,
                      officials: { ...state.officials, sectionHeader: e.target.value },
                    })
                  }
                  className="bg-slate-800 text-white px-2 py-0.5 rounded border border-slate-700 text-[11px] font-bold w-40 focus:ring-1 focus:ring-indigo-500"
                />
              </div>
              <div className="flex items-center gap-1">
                <span className="text-slate-400 font-medium">Captured By:</span>
                <input
                  type="text"
                  value={officials.capturedByName}
                  onChange={(e) =>
                    onChangeState({
                      ...state,
                      officials: { ...state.officials, capturedByName: e.target.value },
                    })
                  }
                  placeholder="Captured Name"
                  className="bg-slate-800 text-white px-2 py-0.5 rounded border border-slate-700 text-[11px] w-28 focus:ring-1 focus:ring-indigo-500"
                />
              </div>
              <div className="flex items-center gap-1">
                <span className="text-slate-400 font-medium">Printed By:</span>
                <input
                  type="text"
                  value={officials.printedByName}
                  onChange={(e) =>
                    onChangeState({
                      ...state,
                      officials: { ...state.officials, printedByName: e.target.value },
                    })
                  }
                  placeholder="Printed Name"
                  className="bg-slate-800 text-white px-2 py-0.5 rounded border border-slate-700 text-[11px] w-28 focus:ring-1 focus:ring-indigo-500"
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* A4 Document Canvas Sheet */}
      <div
        id="rsa-document-canvas"
        className="relative text-slate-900 font-sans shadow-2xl select-none transition-transform origin-top overflow-hidden"
        style={{
          width: '794px', // A4 aspect width at 96 DPI
          height: '1123px', // Exact A4 height
          minHeight: '1123px',
          maxHeight: '1123px',
          padding: '24px',
          boxSizing: 'border-box',
          transform: `scale(${scale})`,
          transformOrigin: 'top center',
          ...getPaperBgStyle(),
        }}
      >
        {/* Security Guilloche Background Pattern Overlay */}
        {background.showSecurityPattern && (
          <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden opacity-15">
            <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern id="guilloche" width="120" height="120" patternUnits="userSpaceOnUse">
                  <path d="M60 0 C 30 30, 30 90, 60 120 C 90 90, 90 30, 60 0 Z" fill="none" stroke="#0284c7" strokeWidth="0.5" />
                  <path d="M0 60 C 30 30, 90 30, 120 60 C 90 90, 30 90, 0 60 Z" fill="none" stroke="#e11d48" strokeWidth="0.5" />
                  <circle cx="60" cy="60" r="45" fill="none" stroke="#0284c7" strokeWidth="0.3" strokeDasharray="2 2" />
                  <circle cx="60" cy="60" r="25" fill="none" stroke="#e11d48" strokeWidth="0.4" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#guilloche)" />
            </svg>
          </div>
        )}

        {/* Outer Pink/Magenta Border Frame */}
        {background.showBorderFrame !== false && background.borderWidth > 0 && (
          <div
            className="absolute inset-4 pointer-events-none z-10"
            style={{
              border: `${background.borderWidth}px solid ${background.borderColor}`,
            }}
          >
            {/* Inner thin security hairline */}
            <div
              className="absolute inset-1 pointer-events-none"
              style={{ border: `1px solid ${background.borderColor}`, opacity: 0.6 }}
            />

            {/* Corner Dots */}
            {background.showCornerDots && (
              <>
                <div className="absolute -top-1.5 -left-1.5 w-3 h-3 rounded-full" style={{ backgroundColor: background.borderColor }} />
                <div className="absolute -top-1.5 -right-1.5 w-3 h-3 rounded-full" style={{ backgroundColor: background.borderColor }} />
                <div className="absolute -bottom-1.5 -left-1.5 w-3 h-3 rounded-full" style={{ backgroundColor: background.borderColor }} />
                <div className="absolute -bottom-1.5 -right-1.5 w-3 h-3 rounded-full" style={{ backgroundColor: background.borderColor }} />
              </>
            )}
          </div>
        )}

        {/* Watermark text overlay */}
        {background.watermarkText && (
          <div
            className="absolute inset-0 flex items-center justify-center pointer-events-none select-none z-0 overflow-hidden"
            style={{ opacity: background.watermarkOpacity }}
          >
            <div className="text-7xl font-extrabold uppercase tracking-widest text-slate-900 -rotate-30 transform text-center">
              {background.watermarkText}
            </div>
          </div>
        )}

        {/* Content Container Inside Frame - CONTINUOUS PAPER LAYOUT (NO HORIZONTAL DIVIDING BORDER LINES) */}
        <div className="relative z-20 p-6 flex flex-col justify-between min-h-[1055px] text-black">
          {/* TOP SECTION: Header, Coat of Arms, Top Barcode, Photo & BI Box */}
          <div className="space-y-3">
            <div className="grid grid-cols-12 items-start gap-2 pb-2">
              {/* Top Left: Republic Text & Top Barcode (Detached Siblings) */}
              <div className="col-span-5 flex flex-col items-start gap-2">
                {/* Header Text */}
                <div
                  style={getElementStyle('header')}
                  onMouseDown={(e) => handleMouseDown('header', e)}
                  className={`space-y-0.5 w-full ${getDragWrapperClass('header')}`}
                >
                  {selectedKey === 'header' && (
                    <div className="selection-badge pdf-hide absolute -top-3 -left-1 bg-indigo-600 text-white px-1.5 py-0.5 rounded text-[9px] flex items-center gap-0.5 shadow-sm z-30" data-pdf-hide="true">
                      <Move className="w-2.5 h-2.5" /> Header Text
                    </div>
                  )}
                  <h1 className="font-extrabold text-[15px] leading-tight text-black tracking-tight uppercase">
                    REPUBLIC OF SOUTH AFRICA
                  </h1>
                  <h2 className="font-bold text-[13px] text-black uppercase tracking-tight">
                    DEPARTMENT: HOME AFFAIRS
                  </h2>
                  <p className="text-[10px] font-semibold text-black tracking-tighter">
                    REFUGEES ACT. 1998 (ACT 130 OF 1998)
                  </p>
                  {renderResizeGrip('header')}
                </div>

                {/* Top Barcode (Detached Standalone Draggable) */}
                <div
                  style={getElementStyle('topBarcode')}
                  onMouseDown={(e) => handleMouseDown('topBarcode', e)}
                  className={`pt-1 flex flex-col items-start ${getDragWrapperClass('topBarcode')}`}
                >
                  {selectedKey === 'topBarcode' && (
                    <div className="selection-badge pdf-hide absolute -top-3 left-0 bg-indigo-600 text-white px-1.5 py-0.5 rounded text-[9px] flex items-center gap-0.5 shadow-sm z-30" data-pdf-hide="true">
                      <Move className="w-2.5 h-2.5" /> Top Barcode
                    </div>
                  )}
                  {state.customTopBarcodeUrl ? (
                    <img
                      src={state.customTopBarcodeUrl}
                      alt="Top Barcode"
                      className="max-h-12 object-contain"
                    />
                  ) : (
                    <>
                      {topBarcodeSvg && (
                        <div
                          dangerouslySetInnerHTML={{ __html: topBarcodeSvg }}
                          className="max-h-8"
                        />
                      )}
                      <span className="text-[10px] font-mono tracking-wider font-semibold text-black -mt-0.5">
                        {metadata.topBarcodeValue}
                      </span>
                    </>
                  )}
                  {renderResizeGrip('topBarcode')}
                </div>
              </div>

              {/* Top Center: Coat of Arms Emblem & Emblem Subtext (Detached Siblings) */}
              <div className="col-span-4 flex flex-col items-center text-center gap-1">
                {/* Coat of Arms Emblem Graphic ONLY */}
                <div
                  style={getElementStyle('coatOfArms')}
                  onMouseDown={(e) => handleMouseDown('coatOfArms', e)}
                  className={`flex justify-center ${getDragWrapperClass('coatOfArms')}`}
                >
                  {selectedKey === 'coatOfArms' && (
                    <div className="selection-badge pdf-hide absolute -top-3 bg-indigo-600 text-white px-1.5 py-0.5 rounded text-[9px] flex items-center gap-0.5 shadow-sm z-30" data-pdf-hide="true">
                      <Move className="w-2.5 h-2.5" /> Emblem Icon
                    </div>
                  )}
                  {state.customCoatOfArmsUrl ? (
                    <img
                      src={state.customCoatOfArmsUrl}
                      alt="Custom Emblem"
                      className="w-20 h-24 object-contain"
                    />
                  ) : (
                    <CoatOfArms className="w-20 h-24" />
                  )}
                  {renderResizeGrip('coatOfArms')}
                </div>

                {/* Emblem Subtext (Detached Standalone Draggable) */}
                <div
                  style={getElementStyle('coatOfArmsText')}
                  onMouseDown={(e) => handleMouseDown('coatOfArmsText', e)}
                  className={`text-[9px] font-bold tracking-wider text-black text-center ${getDragWrapperClass('coatOfArmsText')}`}
                >
                  {selectedKey === 'coatOfArmsText' && (
                    <div className="selection-badge pdf-hide absolute -top-3 left-1/2 -translate-x-1/2 bg-indigo-600 text-white px-1.5 py-0.5 rounded text-[9px] flex items-center gap-0.5 shadow-sm z-30 whitespace-nowrap" data-pdf-hide="true">
                      <Move className="w-2.5 h-2.5" /> Emblem Subtext
                    </div>
                  )}
                  REPUBLIC OF SOUTH AFRICA
                  {renderResizeGrip('coatOfArmsText')}
                </div>
              </div>

              {/* Top Right: BI-1693 Box & ID Photo */}
              <div className="col-span-3 flex flex-col items-end space-y-2">
                {/* BI-1693 Box */}
                <div
                  style={getElementStyle('biBox')}
                  onMouseDown={(e) => handleMouseDown('biBox', e)}
                  className={`border-2 border-black px-3 py-0.5 bg-white font-extrabold text-[13px] tracking-wide text-black ${getDragWrapperClass(
                    'biBox'
                  )}`}
                >
                  {selectedKey === 'biBox' && (
                    <div className="selection-badge pdf-hide absolute -top-3 -right-1 bg-indigo-600 text-white px-1.5 py-0.5 rounded text-[9px] shadow-sm" data-pdf-hide="true">
                      BI Box
                    </div>
                  )}
                  {metadata.formNumber || 'BI-1693'}
                  {renderResizeGrip('biBox')}
                </div>

                {/* ID Photo */}
                <div
                  style={getElementStyle('photo')}
                  onMouseDown={(e) => handleMouseDown('photo', e)}
                  className={`w-24 h-28 border-2 border-black bg-slate-200 overflow-hidden relative shadow-sm ${getDragWrapperClass(
                    'photo'
                  )}`}
                >
                  {selectedKey === 'photo' && (
                    <div className="selection-badge pdf-hide absolute top-1 left-1 bg-indigo-600 text-white px-1 py-0.5 rounded text-[8px] z-20 shadow-sm" data-pdf-hide="true">
                      Photo
                    </div>
                  )}
                  {photoUrl ? (
                    <img
                      src={photoUrl}
                      alt="Refugee Photo"
                      className="w-full h-full object-cover grayscale contrast-110"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-400 text-xs font-semibold">
                      [PHOTO]
                    </div>
                  )}
                  {renderResizeGrip('photo')}
                </div>
              </div>
            </div>

            {/* MAIN DOCUMENT TITLES */}
            <div
              style={getElementStyle('title')}
              onMouseDown={(e) => handleMouseDown('title', e)}
              className={`text-center space-y-1 py-1 ${getDragWrapperClass('title')}`}
            >
              {selectedKey === 'title' && (
                <div className="selection-badge pdf-hide absolute -top-3 left-1/2 -translate-x-1/2 bg-indigo-600 text-white px-1.5 py-0.5 rounded text-[9px] shadow-sm" data-pdf-hide="true">
                  Document Titles
                </div>
              )}
              <h2 className="text-[17px] font-extrabold text-black tracking-normal uppercase">
                FORMAL RECOGNITION OF REFUGEE STATUS IN THE RSA
              </h2>
              <h3 className="text-[14px] font-bold text-black tracking-tight uppercase">
                PARTICULARS OF RECOGNISED REFUGEE IN THE RSA
              </h3>
              {renderResizeGrip('title')}
            </div>

            {/* REFUGEE PARTICULARS LIST (NO DIVIDING BORDER LINE) */}
            <div
              style={getElementStyle('particulars')}
              onMouseDown={(e) => handleMouseDown('particulars', e)}
              className={`space-y-1.5 text-[13px] font-bold text-black pl-2 py-1 ${getDragWrapperClass(
                'particulars'
              )}`}
            >
              {selectedKey === 'particulars' && (
                <div className="selection-badge pdf-hide absolute -top-3 left-2 bg-indigo-600 text-white px-1.5 py-0.5 rounded text-[9px] shadow-sm" data-pdf-hide="true">
                  Particulars List
                </div>
              )}
              <div className="grid grid-cols-12 items-baseline">
                <span className="col-span-4 uppercase tracking-tight">NAME AND SURNAME</span>
                <span className="col-span-[0.5] text-center">:</span>
                <span className="col-span-7 font-black tracking-wide text-[14px]">
                  {particulars.nameAndSurname}
                </span>
              </div>

              <div className="grid grid-cols-12 items-baseline">
                <span className="col-span-4 uppercase tracking-tight">GENDER</span>
                <span className="col-span-[0.5] text-center">:</span>
                <span className="col-span-7 font-extrabold">{particulars.gender}</span>
              </div>

              <div className="grid grid-cols-12 items-baseline">
                <span className="col-span-4 uppercase tracking-tight">DATE OF BIRTH</span>
                <span className="col-span-[0.5] text-center">:</span>
                <span className="col-span-7 font-extrabold">{particulars.dateOfBirth}</span>
              </div>

              <div className="grid grid-cols-12 items-baseline">
                <span className="col-span-4 uppercase tracking-tight">COUNTRY OF BIRTH</span>
                <span className="col-span-[0.5] text-center">:</span>
                <span className="col-span-7 font-extrabold">{particulars.countryOfBirth}</span>
              </div>

              <div className="grid grid-cols-12 items-baseline">
                <span className="col-span-4 uppercase tracking-tight">NATIONALITY</span>
                <span className="col-span-[0.5] text-center">:</span>
                <span className="col-span-7 font-extrabold">{particulars.nationality}</span>
              </div>

              <div className="grid grid-cols-12 items-baseline">
                <span className="col-span-4 uppercase tracking-tight">MARITAL STATUS</span>
                <span className="col-span-[0.5] text-center">:</span>
                <span className="col-span-7 font-extrabold">{particulars.maritalStatus}</span>
              </div>
              {renderResizeGrip('particulars')}
            </div>

            {/* CERTIFICATION PARAGRAPH */}
            <div
              style={getElementStyle('certification')}
              onMouseDown={(e) => handleMouseDown('certification', e)}
              className={`text-[11px] leading-snug font-medium text-black px-1 py-1 text-justify ${getDragWrapperClass(
                'certification'
              )}`}
            >
              {selectedKey === 'certification' && (
                <div className="selection-badge pdf-hide absolute -top-3 left-1 bg-indigo-600 text-white px-1.5 py-0.5 rounded text-[9px] shadow-sm" data-pdf-hide="true">
                  Certification Text
                </div>
              )}
              It is here by certified that the person whose particulars appear above has, in terms of{' '}
              <span className="font-semibold">{particulars.refugeesActSection}</span>, been recognized
              as a refugee in the republic of south Africa (RSA) from{' '}
              <span className="inline-block border border-black px-2 py-0.5 font-bold mx-1 bg-white">
                {particulars.validFrom}
              </span>{' '}
              to{' '}
              <span className="inline-block border border-black px-2 py-0.5 font-bold mx-1 bg-white">
                {particulars.validTo}
              </span>{' '}
              on condition that this formal recognition shall become Null if he/she departs
              permanently from the Republic. The Refugee shall within 14 days of receipt hereof apply
              for a Refugee identity Document in the RSA. The holder of this certificate is entitled to
              Socio-economic rights as provided for in Chapter 2 of the constitution including work and
              study in RSA.
              {renderResizeGrip('certification')}
            </div>

            {/* SIGNATURES & OFFICIAL STAMP ROW */}
            <div className="grid grid-cols-12 items-start gap-4 pt-1">
              {/* Left: Director-General Signature Block */}
              <div
                style={getElementStyle('directorGeneral')}
                onMouseDown={(e) => handleMouseDown('directorGeneral', e)}
                className={`col-span-6 space-y-1 font-bold text-[11px] text-black ${getDragWrapperClass(
                  'directorGeneral'
                )}`}
              >
                {selectedKey === 'directorGeneral' && (
                  <div className="selection-badge pdf-hide absolute -top-3 left-0 bg-indigo-600 text-white px-1.5 py-0.5 rounded text-[9px] shadow-sm" data-pdf-hide="true">
                    Director-General Block
                  </div>
                )}
                {/* Signature Graphic */}
                <div className="h-10 border-b border-black/80 flex items-end pb-1 relative">
                  {state.directorGeneralSignatureUrl ? (
                    <img
                      src={state.directorGeneralSignatureUrl}
                      alt="Director General Signature"
                      className="max-h-12 object-contain"
                    />
                  ) : (
                    <svg className="w-28 h-8 text-black opacity-90" viewBox="0 0 120 30" fill="none">
                      <path
                        d="M10 20 Q 25 5, 40 22 T 70 12 T 95 24 T 110 18"
                        stroke="currentColor"
                        strokeWidth="2"
                        fill="none"
                      />
                    </svg>
                  )}
                </div>
                <p className="font-extrabold">{metadata.directorGeneralTitle || 'p.p. DIRECTOR-GENERAL'}</p>
                <p>DATE: {metadata.issuingDate}</p>
                <p className="font-extrabold uppercase">{metadata.directorGeneralDepartment || 'DEPARTMENT OF HOME AFFAIRS'}</p>
                <div className="pt-2">
                  <p>
                    PLACE: <span className="font-semibold">{metadata.issuingPlace}</span>
                  </p>
                </div>
                {renderResizeGrip('directorGeneral')}
              </div>

              {/* Right: Official Purple/Red Stamp Frame */}
              <div
                style={getElementStyle('stampBlock')}
                onMouseDown={(e) => handleMouseDown('stampBlock', e)}
                className={`col-span-6 flex flex-col items-end relative ${getDragWrapperClass(
                  'stampBlock'
                )}`}
              >
                {selectedKey === 'stampBlock' && (
                  <div className="selection-badge pdf-hide absolute -top-3 right-0 bg-indigo-600 text-white px-1.5 py-0.5 rounded text-[9px] shadow-sm" data-pdf-hide="true">
                    Official Stamp
                  </div>
                )}

                {/* Rectangular Office Stamp */}
                <div
                  className="relative border-2 p-2 w-[220px] text-center select-none shadow-xs"
                  style={{
                    borderColor: stamp.stampColor,
                    color: stamp.stampColor,
                    transform: `rotate(${stamp.rotation}deg)`,
                    opacity: stamp.opacity,
                  }}
                >
                  <div className="font-bold text-[12px] uppercase leading-tight">
                    {stamp.officeName}
                  </div>
                  <div
                    className="font-extrabold text-[11px] leading-tight border-t border-b py-0.5 my-0.5 whitespace-pre-line"
                    style={{ borderColor: stamp.stampColor }}
                  >
                    {stamp.receptionOfficeText}
                  </div>
                  <div className="font-black text-[13px] tracking-wider py-0.5">
                    {stamp.dateText}
                  </div>
                  <div className="font-bold text-[9px] uppercase tracking-tighter">
                    {stamp.issuingOfficeText}
                  </div>
                  <div className="font-bold text-[11px] mt-0.5">
                    {stamp.locationCodeText}
                  </div>

                  {/* Diagonal Pen Slash across Stamp */}
                  {stamp.hasSlashMark && (
                    <svg
                      className="absolute inset-0 w-full h-full pointer-events-none"
                      viewBox="0 0 100 100"
                      preserveAspectRatio="none"
                    >
                      <line x1="15" y1="85" x2="85" y2="15" stroke={stamp.stampColor} strokeWidth="3" opacity="0.8" />
                    </svg>
                  )}

                  {/* Fingerprint Impression on right side of stamp */}
                  {stamp.hasFingerprint && (
                    <div className="absolute -bottom-6 -right-6 w-20 h-24 pointer-events-none opacity-85">
                      {state.fingerprintUrl ? (
                        <img src={state.fingerprintUrl} alt="Fingerprint" className="w-full h-full object-contain" />
                      ) : (
                        <svg viewBox="0 0 100 120" className="w-full h-full" fill="none">
                          <ellipse cx="50" cy="60" rx="35" ry="45" stroke="#1e293b" strokeWidth="2" strokeDasharray="3 2" />
                          <ellipse cx="50" cy="60" rx="28" ry="36" stroke="#1e293b" strokeWidth="2.5" />
                          <ellipse cx="50" cy="60" rx="20" ry="26" stroke="#1e293b" strokeWidth="2" strokeDasharray="4 2" />
                          <ellipse cx="50" cy="60" rx="12" ry="16" stroke="#1e293b" strokeWidth="2.5" />
                          <circle cx="50" cy="60" r="5" fill="#1e293b" />
                        </svg>
                      )}
                    </div>
                  )}
                </div>
                {renderResizeGrip('stampBlock')}
              </div>
            </div>

            {/* REFUGEE RECEPTION OFFICIAL TABLE (NO DIVIDING BORDER LINE ABOVE) */}
            <div
              style={getElementStyle('officialsTable')}
              onMouseDown={(e) => handleMouseDown('officialsTable', e)}
              className={`pt-2 ${getDragWrapperClass('officialsTable')}`}
            >
              {selectedKey === 'officialsTable' && (
                <div className="selection-badge pdf-hide absolute -top-3 left-0 bg-indigo-600 text-white px-1.5 py-0.5 rounded text-[9px] shadow-sm" data-pdf-hide="true">
                  Officials Table
                </div>
              )}
              <h4 className="font-extrabold text-[12px] uppercase text-black mb-1">
                {officials.sectionHeader || 'REFUGEE RECEPTION OFFICIAL'}
              </h4>

              <div className="grid grid-cols-2 gap-4 text-[11px] font-bold text-black">
                {/* Column 1: CAPTURED BY */}
                <div className="space-y-1 border-r border-black/20 pr-2">
                  <p className="font-extrabold uppercase">{officials.capturedByTitle || 'CAPTURED BY'}</p>
                  <div className="grid grid-cols-12">
                    <span className="col-span-5 text-[10px] uppercase">NAME:</span>
                    <span className="col-span-7 font-semibold">{officials.capturedByName}</span>
                  </div>
                  <div className="grid grid-cols-12">
                    <span className="col-span-5 text-[10px] uppercase">APPOINTMENT/FORCE NO:</span>
                    <span className="col-span-7 font-semibold">{officials.capturedByAppointmentNo}</span>
                  </div>
                  <div className="grid grid-cols-12">
                    <span className="col-span-5 text-[10px] uppercase">DATE:</span>
                    <span className="col-span-7 font-semibold">{officials.capturedByDate}</span>
                  </div>
                  <div className="grid grid-cols-12">
                    <span className="col-span-5 text-[10px] uppercase">PLACE:</span>
                    <span className="col-span-7 font-semibold">{officials.capturedByPlace}</span>
                  </div>
                  <div className="grid grid-cols-12 pt-1">
                    <span className="col-span-5 text-[10px] uppercase">ORIGINALLY ISSUED IN:</span>
                    <span className="col-span-7 font-semibold">{officials.originallyIssuedIn}</span>
                  </div>
                  <div className="pt-2 flex items-center justify-between">
                    <span className="text-[10px] uppercase">RSDO SIGNATURE:</span>
                    <div className="h-6 w-24 border-b border-black/60 flex items-end">
                      {state.rsdoSignatureUrl ? (
                        <img src={state.rsdoSignatureUrl} alt="RSDO Signature" className="max-h-6 object-contain" />
                      ) : (
                        <svg className="w-16 h-5 text-black" viewBox="0 0 100 20">
                          <path d="M5 15 Q 30 2, 50 15 T 85 8" stroke="currentColor" strokeWidth="1.5" fill="none" />
                        </svg>
                      )}
                    </div>
                  </div>
                </div>

                {/* Column 2: PRINTED BY */}
                <div className="space-y-1 pl-2">
                  <p className="font-extrabold uppercase">{officials.printedByTitle || 'PRINTED BY'}</p>
                  <div className="grid grid-cols-12">
                    <span className="col-span-5 text-[10px] uppercase">NAME:</span>
                    <span className="col-span-7 font-semibold">{officials.printedByName}</span>
                  </div>
                  <div className="grid grid-cols-12">
                    <span className="col-span-5 text-[10px] uppercase">APPOINTMENT/FORCE NO:</span>
                    <span className="col-span-7 font-semibold">{officials.printedByAppointmentNo}</span>
                  </div>
                  <div className="grid grid-cols-12">
                    <span className="col-span-5 text-[10px] uppercase">DATE:</span>
                    <span className="col-span-7 font-semibold">{officials.printedByDate}</span>
                  </div>
                  <div className="grid grid-cols-12">
                    <span className="col-span-5 text-[10px] uppercase">PLACE:</span>
                    <span className="col-span-7 font-semibold">{officials.printedByPlace}</span>
                  </div>
                  <div className="grid grid-cols-12 pt-1">
                    <span className="col-span-5 text-[10px] uppercase">NUMBER OF EXTENSIONS:</span>
                    <span className="col-span-7 font-semibold">{officials.numberOfExtensions}</span>
                  </div>
                  <div className="pt-2 flex items-center justify-between">
                    <span className="text-[10px] uppercase">PERMIT HOLDER SIGNATURE:</span>
                    <div className="h-6 w-24 border-b border-black/60 flex items-end">
                      {state.permitHolderSignatureUrl ? (
                        <img src={state.permitHolderSignatureUrl} alt="Permit Holder Signature" className="max-h-6 object-contain" />
                      ) : (
                        <svg className="w-16 h-5 text-black" viewBox="0 0 100 20">
                          <path d="M10 12 Q 25 18, 45 5 T 90 14" stroke="currentColor" strokeWidth="1.5" fill="none" />
                        </svg>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              {renderResizeGrip('officialsTable')}
            </div>
          </div>

          {/* BOTTOM SECTION: Barcode & Form Code (NO DIVIDING BORDER LINE ABOVE) */}
          <div className="pt-3 flex items-end justify-between text-black">
            {/* Bottom Left: Barcode + Watermark */}
            <div
              style={getElementStyle('bottomBarcode')}
              onMouseDown={(e) => handleMouseDown('bottomBarcode', e)}
              className={`flex flex-col items-start ${getDragWrapperClass('bottomBarcode')}`}
            >
              {selectedKey === 'bottomBarcode' && (
                <div className="selection-badge pdf-hide absolute -top-3 left-0 bg-indigo-600 text-white px-1.5 py-0.5 rounded text-[9px] shadow-sm z-30" data-pdf-hide="true">
                  Bottom Barcode
                </div>
              )}
              <div className="text-[10px] font-bold tracking-widest text-black/60 uppercase mb-1">
                {metadata.issuingPlace || 'CAPE TOWN'}
              </div>
              {state.customBottomBarcodeUrl ? (
                <img
                  src={state.customBottomBarcodeUrl}
                  alt="Bottom Barcode"
                  className="max-h-14 object-contain"
                />
              ) : (
                <>
                  {bottomBarcodeSvg && (
                    <div dangerouslySetInnerHTML={{ __html: bottomBarcodeSvg }} className="max-h-10" />
                  )}
                  <span className="text-[12px] font-mono font-bold tracking-widest text-black ml-4">
                    {metadata.bottomBarcodeValue}
                  </span>
                </>
              )}
              {renderResizeGrip('bottomBarcode')}
            </div>

            {/* Bottom Right: Form Code */}
            <div
              style={getElementStyle('formCode')}
              onMouseDown={(e) => handleMouseDown('formCode', e)}
              className={`text-[10px] font-extrabold tracking-wider text-black ${getDragWrapperClass('formCode')}`}
            >
              {selectedKey === 'formCode' && (
                <div className="selection-badge pdf-hide absolute -top-3 right-0 bg-indigo-600 text-white px-1.5 py-0.5 rounded text-[9px] shadow-sm z-30" data-pdf-hide="true">
                  Form Code
                </div>
              )}
              {metadata.templateCode || '83/DHA-1707B'}
              {renderResizeGrip('formCode')}
            </div>
          </div>

          {/* CUSTOM TEXT OVERLAYS LAYER */}
          {state.customTexts && state.customTexts.map((ct, idx) => {
            if (ct.visible === false) return null;
            const isSelected = selectedCustomTextId === ct.id;
            const isDragging = activeDragCustomTextId === ct.id;
            const scaleVal = ct.scale !== undefined ? ct.scale : 1.0;

            const customStyle: React.CSSProperties = {
              position: 'absolute',
              left: 0,
              top: 0,
              transform: `translate(${ct.x}px, ${ct.y}px) scale(${scaleVal})`,
              transformOrigin: 'top left',
              fontSize: ct.fontSize ? `${ct.fontSize}px` : '13px',
              fontWeight: ct.fontWeight ? fontWeightMap[ct.fontWeight] || 700 : 700,
              fontFamily: ct.fontFamily ? fontFamilyMap[ct.fontFamily] || fontFamilyMap.arial : fontFamilyMap.arial,
              color: ct.color || '#000000',
              textAlign: ct.textAlign || 'left',
              zIndex: isSelected ? 45 : 35,
              whiteSpace: 'pre-wrap',
            };

            return (
              <div
                key={ct.id}
                style={customStyle}
                onMouseDown={(e) => handleCustomTextMouseDown(ct, e)}
                className={`cursor-move select-none p-1 rounded ${
                  isDragging
                    ? 'ring-2 ring-amber-500 shadow-xl'
                    : isSelected
                    ? 'ring-2 ring-amber-500 ring-offset-1 bg-amber-500/10'
                    : 'hover:ring-1 hover:ring-amber-400/80 hover:bg-amber-50/20'
                }`}
              >
                {isSelected && (
                  <div className="selection-badge pdf-hide absolute -top-4 left-0 bg-amber-600 text-white px-1.5 py-0.2 rounded text-[9px] font-bold shadow-xs whitespace-nowrap z-50 flex items-center gap-1" data-pdf-hide="true">
                    <span>Text #{idx + 1}</span>
                  </div>
                )}
                <span>{ct.text}</span>
                {isSelected && (
                  <div
                    onMouseDown={(e) => handleCustomTextResizeMouseDown(ct.id, e)}
                    className="selection-badge pdf-hide absolute -bottom-2 -right-2 w-5 h-5 bg-amber-600 hover:bg-amber-700 text-white rounded-full flex items-center justify-center cursor-nwse-resize shadow-lg z-50 hover:scale-125 transition-transform"
                    data-pdf-hide="true"
                    title="Drag corner to scale custom text"
                  >
                    <Maximize2 className="w-3 h-3" />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
