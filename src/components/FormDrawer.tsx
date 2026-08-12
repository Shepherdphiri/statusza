import React, { useState } from 'react';
import {
  X,
  User,
  Building2,
  Image as ImageIcon,
  Palette,
  QrCode,
  PenTool,
  Upload,
  RefreshCw,
  Sliders,
  Layers,
  Sparkles,
  Type,
  Plus,
  Trash2,
} from 'lucide-react';
import { DocumentState, ElementKey, CustomTextBlock } from '../types';

interface FormDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  state: DocumentState;
  onChangeState: (newState: DocumentState) => void;
  onOpenSignatureModal: (title: string, onSave: (url: string) => void) => void;
  onResetToDefault: () => void;
}

export function FormDrawer({
  isOpen,
  onClose,
  state,
  onChangeState,
  onOpenSignatureModal,
  onResetToDefault,
}: FormDrawerProps) {
  const [activeTab, setActiveTab] = useState<
    'particulars' | 'officials' | 'media' | 'background' | 'barcodes' | 'layout' | 'customText'
  >('particulars');

  if (!isOpen) return null;

  const updateParticulars = (field: keyof DocumentState['particulars'], value: string) => {
    onChangeState({
      ...state,
      particulars: { ...state.particulars, [field]: value },
    });
  };

  const updateOfficials = (field: keyof DocumentState['officials'], value: string) => {
    onChangeState({
      ...state,
      officials: { ...state.officials, [field]: value },
    });
  };

  const updateMetadata = (field: keyof DocumentState['metadata'], value: string) => {
    onChangeState({
      ...state,
      metadata: { ...state.metadata, [field]: value },
    });
  };

  const updateStamp = (field: keyof DocumentState['stamp'], value: any) => {
    onChangeState({
      ...state,
      stamp: { ...state.stamp, [field]: value },
    });
  };

  const updateBackground = (field: keyof DocumentState['background'], value: any) => {
    onChangeState({
      ...state,
      background: { ...state.background, [field]: value },
    });
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          onChangeState({
            ...state,
            photoUrl: event.target.result as string,
          });
        }
      };
      reader.readAsDataURL(file);
    }
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
    onChangeState({
      ...state,
      customTexts: [...(state.customTexts || []), newText],
    });
  };

  const updateCustomText = (id: string, changes: Partial<CustomTextBlock>) => {
    const updated = (state.customTexts || []).map((ct) =>
      ct.id === id ? { ...ct, ...changes } : ct
    );
    onChangeState({
      ...state,
      customTexts: updated,
    });
  };

  const deleteCustomText = (id: string) => {
    const filtered = (state.customTexts || []).filter((ct) => ct.id !== id);
    onChangeState({
      ...state,
      customTexts: filtered,
    });
  };

  return (
    <div className="fixed inset-y-0 right-0 z-40 w-full max-w-md bg-white shadow-2xl border-l border-slate-200 flex flex-col transition-all duration-300">
      {/* Drawer Header */}
      <div className="flex items-center justify-between px-5 py-4 bg-slate-900 text-white">
        <div className="flex items-center gap-2 font-semibold text-base">
          <Sliders className="w-5 h-5 text-indigo-400" />
          <span>Document Entries & Styling Drawer</span>
        </div>
        <button
          onClick={onClose}
          className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Tabs Navigation */}
      <div className="flex border-b border-slate-200 bg-slate-50 text-xs font-medium overflow-x-auto no-scrollbar">
        <button
          onClick={() => setActiveTab('particulars')}
          className={`flex items-center gap-1.5 px-4 py-3 border-b-2 whitespace-nowrap transition-colors ${
            activeTab === 'particulars'
              ? 'border-indigo-600 text-indigo-600 bg-white font-semibold'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <User className="w-4 h-4" />
          Particulars
        </button>

        <button
          onClick={() => setActiveTab('officials')}
          className={`flex items-center gap-1.5 px-4 py-3 border-b-2 whitespace-nowrap transition-colors ${
            activeTab === 'officials'
              ? 'border-indigo-600 text-indigo-600 bg-white font-semibold'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <Building2 className="w-4 h-4" />
          Officials & Office
        </button>

        <button
          onClick={() => setActiveTab('background')}
          className={`flex items-center gap-1.5 px-4 py-3 border-b-2 whitespace-nowrap transition-colors ${
            activeTab === 'background'
              ? 'border-indigo-600 text-indigo-600 bg-white font-semibold'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <Palette className="w-4 h-4" />
          Background
        </button>

        <button
          onClick={() => setActiveTab('media')}
          className={`flex items-center gap-1.5 px-4 py-3 border-b-2 whitespace-nowrap transition-colors ${
            activeTab === 'media'
              ? 'border-indigo-600 text-indigo-600 bg-white font-semibold'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <ImageIcon className="w-4 h-4" />
          Signatures & Photo
        </button>

        <button
          onClick={() => setActiveTab('barcodes')}
          className={`flex items-center gap-1.5 px-4 py-3 border-b-2 whitespace-nowrap transition-colors ${
            activeTab === 'barcodes'
              ? 'border-indigo-600 text-indigo-600 bg-white font-semibold'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <QrCode className="w-4 h-4" />
          Barcodes
        </button>

        <button
          onClick={() => setActiveTab('customText')}
          className={`flex items-center gap-1.5 px-4 py-3 border-b-2 whitespace-nowrap transition-colors ${
            activeTab === 'customText'
              ? 'border-indigo-600 text-indigo-600 bg-white font-semibold'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <Type className="w-4 h-4 text-amber-500" />
          Custom Text
        </button>
      </div>

      {/* Drawer Scrollable Body */}
      <div className="flex-1 overflow-y-auto p-5 space-y-6">
        {/* TAB 1: REFUGEE PARTICULARS */}
        {activeTab === 'particulars' && (
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
              <User className="w-4 h-4 text-indigo-600" />
              Recognised Refugee Particulars
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Name and Surname
                </label>
                <input
                  type="text"
                  value={state.particulars.nameAndSurname}
                  onChange={(e) => updateParticulars('nameAndSurname', e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Gender</label>
                  <select
                    value={state.particulars.gender}
                    onChange={(e) => updateParticulars('gender', e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 font-medium"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    Date of Birth
                  </label>
                  <input
                    type="text"
                    value={state.particulars.dateOfBirth}
                    onChange={(e) => updateParticulars('dateOfBirth', e.target.value)}
                    placeholder="DD/MM/YYYY"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    Country of Birth
                  </label>
                  <input
                    type="text"
                    value={state.particulars.countryOfBirth}
                    onChange={(e) => updateParticulars('countryOfBirth', e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 font-medium"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Nationality</label>
                  <input
                    type="text"
                    value={state.particulars.nationality}
                    onChange={(e) => updateParticulars('nationality', e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Marital Status
                </label>
                <input
                  type="text"
                  value={state.particulars.maritalStatus}
                  onChange={(e) => updateParticulars('maritalStatus', e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 font-medium"
                />
              </div>

              <div className="pt-2 border-t border-slate-200 grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    Valid Recognized From
                  </label>
                  <input
                    type="text"
                    value={state.particulars.validFrom}
                    onChange={(e) => updateParticulars('validFrom', e.target.value)}
                    placeholder="DD/MM/YYYY"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 font-bold text-indigo-700"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Valid To</label>
                  <input
                    type="text"
                    value={state.particulars.validTo}
                    onChange={(e) => updateParticulars('validTo', e.target.value)}
                    placeholder="DD/MM/YYYY"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 font-bold text-indigo-700"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Refugees Act Section Clause
                </label>
                <textarea
                  rows={2}
                  value={state.particulars.refugeesActSection}
                  onChange={(e) => updateParticulars('refugeesActSection', e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-mono"
                />
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: OFFICIALS & RECEPTION OFFICE */}
        {activeTab === 'officials' && (
          <div className="space-y-5">
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
              <Building2 className="w-4 h-4 text-indigo-600" />
              Reception Office & Officials Details
            </h3>

            {/* Director-General Block Configuration */}
            <div className="p-3 bg-blue-50/60 border border-blue-200 rounded-lg space-y-2.5 text-xs">
              <div className="font-bold text-blue-900 uppercase">Director-General Designation Block</div>
              <div>
                <label className="block text-slate-700 font-medium mb-0.5">Title / Designation Header</label>
                <input
                  type="text"
                  value={state.metadata.directorGeneralTitle || 'p.p. DIRECTOR-GENERAL'}
                  onChange={(e) => updateMetadata('directorGeneralTitle', e.target.value)}
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded-md bg-white font-bold"
                />
              </div>
              <div>
                <label className="block text-slate-700 font-medium mb-0.5">Department Name</label>
                <input
                  type="text"
                  value={state.metadata.directorGeneralDepartment || 'DEPARTMENT OF HOME AFFAIRS'}
                  onChange={(e) => updateMetadata('directorGeneralDepartment', e.target.value)}
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded-md bg-white font-bold"
                />
              </div>
            </div>

            {/* General Office Info */}
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-3 text-xs">
              <div className="font-semibold text-slate-800">Issuing Office Location & Date</div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 mb-1">Issuing Place</label>
                  <input
                    type="text"
                    value={state.metadata.issuingPlace}
                    onChange={(e) => updateMetadata('issuingPlace', e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded-md bg-white font-medium"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 mb-1">Issuing Date</label>
                  <input
                    type="text"
                    value={state.metadata.issuingDate}
                    onChange={(e) => updateMetadata('issuingDate', e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded-md bg-white font-medium"
                  />
                </div>
              </div>
            </div>

            {/* Section Header Customization */}
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-2 text-xs">
              <div className="font-bold text-slate-800 uppercase">Officials Table Main Header</div>
              <input
                type="text"
                value={state.officials.sectionHeader || 'REFUGEE RECEPTION OFFICIAL'}
                onChange={(e) => updateOfficials('sectionHeader', e.target.value)}
                className="w-full px-2.5 py-1.5 border border-slate-300 rounded-md bg-white font-extrabold uppercase"
              />
            </div>

            {/* Captured By Section */}
            <div className="p-3 bg-indigo-50/50 border border-indigo-100 rounded-lg space-y-2 text-xs">
              <div className="font-bold text-indigo-900 uppercase">Captured By Official Header & Details</div>
              <div>
                <label className="block text-slate-700 font-medium mb-0.5">Column Header</label>
                <input
                  type="text"
                  value={state.officials.capturedByTitle || 'CAPTURED BY'}
                  onChange={(e) => updateOfficials('capturedByTitle', e.target.value)}
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded-md bg-white font-bold text-indigo-900"
                />
              </div>
              <div>
                <label className="block text-slate-700 font-medium mb-0.5">Name</label>
                <input
                  type="text"
                  value={state.officials.capturedByName}
                  onChange={(e) => updateOfficials('capturedByName', e.target.value)}
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded-md bg-white"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-700 font-medium mb-0.5">Appointment/Force No</label>
                  <input
                    type="text"
                    value={state.officials.capturedByAppointmentNo}
                    onChange={(e) => updateOfficials('capturedByAppointmentNo', e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded-md bg-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-medium mb-0.5">Capture Date</label>
                  <input
                    type="text"
                    value={state.officials.capturedByDate}
                    onChange={(e) => updateOfficials('capturedByDate', e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded-md bg-white"
                  />
                </div>
              </div>
              <div>
                <label className="block text-slate-700 font-medium mb-0.5">Originally Issued In</label>
                <input
                  type="text"
                  value={state.officials.originallyIssuedIn}
                  onChange={(e) => updateOfficials('originallyIssuedIn', e.target.value)}
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded-md bg-white"
                />
              </div>
            </div>

            {/* Printed By Section */}
            <div className="p-3 bg-emerald-50/50 border border-emerald-100 rounded-lg space-y-2 text-xs">
              <div className="font-bold text-emerald-900 uppercase">Printed By Official Header & Details</div>
              <div>
                <label className="block text-slate-700 font-medium mb-0.5">Column Header</label>
                <input
                  type="text"
                  value={state.officials.printedByTitle || 'PRINTED BY'}
                  onChange={(e) => updateOfficials('printedByTitle', e.target.value)}
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded-md bg-white font-bold text-emerald-900"
                />
              </div>
              <div>
                <label className="block text-slate-700 font-medium mb-0.5">Name</label>
                <input
                  type="text"
                  value={state.officials.printedByName}
                  onChange={(e) => updateOfficials('printedByName', e.target.value)}
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded-md bg-white"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-700 font-medium mb-0.5">Appointment/Force No</label>
                  <input
                    type="text"
                    value={state.officials.printedByAppointmentNo}
                    onChange={(e) => updateOfficials('printedByAppointmentNo', e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded-md bg-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-medium mb-0.5">Printed Date</label>
                  <input
                    type="text"
                    value={state.officials.printedByDate}
                    onChange={(e) => updateOfficials('printedByDate', e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded-md bg-white"
                  />
                </div>
              </div>
              <div>
                <label className="block text-slate-700 font-medium mb-0.5">Number of Extensions</label>
                <input
                  type="text"
                  value={state.officials.numberOfExtensions}
                  onChange={(e) => updateOfficials('numberOfExtensions', e.target.value)}
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded-md bg-white font-bold"
                />
              </div>
            </div>

            {/* Official Stamp Configuration */}
            <div className="p-3 bg-purple-50/50 border border-purple-100 rounded-lg space-y-3 text-xs">
              <div className="flex items-center justify-between font-bold text-purple-900 uppercase">
                <span>Official Rubber Stamp</span>
                <button
                  type="button"
                  onClick={() =>
                    onChangeState({
                      ...state,
                      layout: {
                        ...state.layout,
                        stampBlock: {
                          ...(state.layout.stampBlock || { x: 0, y: 0 }),
                          visible: state.layout.stampBlock?.visible === false ? true : false,
                        },
                      },
                    })
                  }
                  className={`px-2.5 py-1 rounded text-xs font-semibold transition-colors flex items-center gap-1 ${
                    state.layout.stampBlock?.visible === false
                      ? 'bg-rose-600 hover:bg-rose-700 text-white shadow-xs'
                      : 'bg-emerald-700 hover:bg-emerald-800 text-white shadow-xs'
                  }`}
                >
                  {state.layout.stampBlock?.visible === false ? 'Hidden (Click to Restore)' : 'Visible (Click to Remove Stamp)'}
                </button>
              </div>

              {state.layout.stampBlock?.visible === false && (
                <div className="p-2 bg-rose-50 border border-rose-200 rounded text-rose-800 text-[11px] font-medium">
                  Stamp is currently removed from the document sheet. Click above to restore it anytime.
                </div>
              )}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-700 font-medium mb-0.5">Stamp Office</label>
                  <input
                    type="text"
                    value={state.stamp.officeName}
                    onChange={(e) => updateStamp('officeName', e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded-md bg-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-medium mb-0.5">Stamp Date Text</label>
                  <input
                    type="text"
                    value={state.stamp.dateText}
                    onChange={(e) => updateStamp('dateText', e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded-md bg-white font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-0.5">Stamp Color</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={state.stamp.stampColor}
                    onChange={(e) => updateStamp('stampColor', e.target.value)}
                    className="w-8 h-8 rounded border cursor-pointer"
                  />
                  <span className="font-mono text-slate-600">{state.stamp.stampColor}</span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-2 text-slate-700 font-medium cursor-pointer">
                  <input
                    type="checkbox"
                    checked={state.stamp.hasSlashMark}
                    onChange={(e) => updateStamp('hasSlashMark', e.target.checked)}
                    className="rounded text-indigo-600"
                  />
                  <span>Include Pen Slash Mark</span>
                </label>

                <label className="flex items-center gap-2 text-slate-700 font-medium cursor-pointer">
                  <input
                    type="checkbox"
                    checked={state.stamp.hasFingerprint}
                    onChange={(e) => updateStamp('hasFingerprint', e.target.checked)}
                    className="rounded text-indigo-600"
                  />
                  <span>Fingerprint Overlay</span>
                </label>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: BACKGROUND CUSTOMIZATION */}
        {activeTab === 'background' && (
          <div className="space-y-5">
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
              <Palette className="w-4 h-4 text-indigo-600" />
              Document Border & Paper Background
            </h3>

            {/* Border Styling */}
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-3 text-xs">
              <div className="flex items-center justify-between pb-1 border-b border-slate-200">
                <div className="font-bold text-slate-800">Outer Border Frame</div>
                <label className="flex items-center gap-1.5 cursor-pointer bg-white px-2 py-1 rounded border border-slate-300 hover:border-indigo-400 transition-colors shadow-2xs">
                  <input
                    type="checkbox"
                    checked={state.background.showBorderFrame !== false && state.background.borderWidth > 0}
                    onChange={(e) => {
                      const enabled = e.target.checked;
                      onChangeState({
                        ...state,
                        background: {
                          ...state.background,
                          showBorderFrame: enabled,
                          borderWidth: enabled && state.background.borderWidth === 0 ? 6 : state.background.borderWidth,
                        },
                      });
                    }}
                    className="w-3.5 h-3.5 rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                  />
                  <span className={`font-bold text-[11px] ${state.background.showBorderFrame !== false && state.background.borderWidth > 0 ? 'text-emerald-700' : 'text-slate-500'}`}>
                    {state.background.showBorderFrame !== false && state.background.borderWidth > 0
                      ? 'Enabled'
                      : 'Disabled'}
                  </span>
                </label>
              </div>

              {state.background.showBorderFrame !== false && state.background.borderWidth > 0 ? (
                <>
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-slate-700">Frame Color</span>
                    <div className="flex items-center gap-2">
                      {['#d82362', '#801838', '#000000', '#1e3a8a', '#15803d'].map((col) => (
                        <button
                          key={col}
                          onClick={() => updateBackground('borderColor', col)}
                          className={`w-6 h-6 rounded-full border border-slate-300 ${
                            state.background.borderColor === col ? 'ring-2 ring-indigo-500 scale-110' : ''
                          }`}
                          style={{ backgroundColor: col }}
                        />
                      ))}
                      <input
                        type="color"
                        value={state.background.borderColor}
                        onChange={(e) => updateBackground('borderColor', e.target.value)}
                        className="w-7 h-7 rounded cursor-pointer border"
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-slate-700 font-medium mb-1">
                      <span>Border Thickness</span>
                      <span>{state.background.borderWidth}px</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="12"
                      value={state.background.borderWidth}
                      onChange={(e) => {
                        const val = Number(e.target.value);
                        onChangeState({
                          ...state,
                          background: {
                            ...state.background,
                            borderWidth: val,
                            showBorderFrame: val > 0,
                          },
                        });
                      }}
                      className="w-full accent-indigo-600"
                    />
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <label className="flex items-center gap-2 text-slate-700 font-medium cursor-pointer">
                      <input
                        type="checkbox"
                        checked={state.background.showCornerDots}
                        onChange={(e) => updateBackground('showCornerDots', e.target.checked)}
                        className="rounded text-indigo-600"
                      />
                      <span>Show Frame Corner Dots</span>
                    </label>
                  </div>
                </>
              ) : (
                <div className="p-2 bg-amber-50 border border-amber-200 rounded text-amber-800 text-[11px] flex items-center justify-between">
                  <span>Outer border frame is currently disabled.</span>
                  <button
                    onClick={() => {
                      onChangeState({
                        ...state,
                        background: {
                          ...state.background,
                          showBorderFrame: true,
                          borderWidth: state.background.borderWidth || 6,
                        },
                      });
                    }}
                    className="px-2 py-0.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded text-[10px] transition-colors shadow-2xs"
                  >
                    Enable Frame
                  </button>
                </div>
              )}
            </div>

            {/* Paper Texture Styles */}
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-3 text-xs">
              <div className="font-bold text-slate-800">Paper Texture Style</div>

              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'authentic', label: 'Authentic RSA Security' },
                  { id: 'aged-vintage', label: 'Aged Vintage Paper' },
                  { id: 'creme-pattern', label: 'Linen Micro-Grid' },
                  { id: 'clean-white', label: 'Clean White' },
                ].map((style) => (
                  <button
                    key={style.id}
                    onClick={() => updateBackground('paperStyle', style.id as any)}
                    className={`p-2.5 rounded-lg border text-left font-medium transition-all ${
                      state.background.paperStyle === style.id
                        ? 'border-indigo-600 bg-indigo-50 text-indigo-900 font-bold shadow-xs'
                        : 'border-slate-300 hover:border-slate-400 bg-white text-slate-700'
                    }`}
                  >
                    {style.label}
                  </button>
                ))}

                {state.background.customBgImageUrl && (
                  <button
                    onClick={() => updateBackground('paperStyle', 'custom-image')}
                    className={`p-2.5 rounded-lg border text-left font-medium transition-all col-span-2 flex items-center justify-between ${
                      state.background.paperStyle === 'custom-image'
                        ? 'border-indigo-600 bg-indigo-50 text-indigo-900 font-bold shadow-xs ring-1 ring-indigo-500'
                        : 'border-slate-300 hover:border-slate-400 bg-white text-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <img
                        src={state.background.customBgImageUrl}
                        alt="Custom Background"
                        className="w-7 h-7 object-cover rounded border border-slate-300"
                      />
                      <div>
                        <div className="text-xs font-bold">Custom Uploaded Image</div>
                        <div className="text-[10px] text-slate-500">Active scanned document image</div>
                      </div>
                    </div>
                    {state.background.paperStyle === 'custom-image' && (
                      <span className="text-[10px] bg-indigo-600 text-white px-2 py-0.5 rounded font-bold">
                        Active
                      </span>
                    )}
                  </button>
                )}
              </div>

              <div>
                <div className="flex justify-between text-slate-700 font-medium mb-1">
                  <span>Paper Texture Opacity</span>
                  <span>{Math.round(state.background.paperTextureOpacity * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="0.5"
                  step="0.01"
                  value={state.background.paperTextureOpacity}
                  onChange={(e) => updateBackground('paperTextureOpacity', Number(e.target.value))}
                  className="w-full accent-indigo-600"
                />
              </div>

              {/* Upload Custom Scanned Paper Background */}
              <div className="pt-2">
                {state.background.customBgImageUrl ? (
                  <div className="p-3 bg-slate-100 border border-slate-300 rounded-lg space-y-2">
                    <div className="flex items-center gap-3">
                      <img
                        src={state.background.customBgImageUrl}
                        alt="Custom Background Preview"
                        className="w-12 h-16 object-cover rounded border border-slate-300 shadow-xs"
                      />
                      <div className="flex-1 text-xs">
                        <div className="font-bold text-slate-800">Custom Scan Image Loaded</div>
                        <div className="text-[10px] text-slate-500">
                          {state.background.paperStyle === 'custom-image'
                            ? 'Currently active on document canvas'
                            : 'Click "Custom Uploaded Image" above to activate'}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 pt-1 border-t border-slate-200">
                      <label className="flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-md cursor-pointer transition-colors shadow-xs">
                        <Upload className="w-3.5 h-3.5" />
                        <span>Replace Background</span>
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
                      <button
                        onClick={() => {
                          onChangeState({
                            ...state,
                            background: {
                              ...state.background,
                              customBgImageUrl: undefined,
                              paperStyle:
                                state.background.paperStyle === 'custom-image'
                                  ? 'authentic'
                                  : state.background.paperStyle,
                            },
                          });
                        }}
                        className="flex items-center gap-1 px-2.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-semibold rounded-md transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Remove</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <label className="flex items-center justify-center gap-2 p-3 border-2 border-dashed border-indigo-200 hover:border-indigo-500 rounded-lg cursor-pointer bg-indigo-50/50 hover:bg-indigo-50 transition-colors">
                    <Upload className="w-4 h-4 text-indigo-600" />
                    <span className="font-bold text-indigo-900 text-xs">Upload Custom Background Image</span>
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
              </div>
            </div>

            {/* Watermark customization */}
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-3 text-xs">
              <div className="font-bold text-slate-800">Security Watermark Text</div>

              <div>
                <label className="block text-slate-600 mb-1">Watermark Label</label>
                <input
                  type="text"
                  value={state.background.watermarkText}
                  onChange={(e) => updateBackground('watermarkText', e.target.value)}
                  placeholder="e.g. CAPE TOWN"
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded-md font-bold uppercase"
                />
              </div>

              <div>
                <div className="flex justify-between text-slate-700 font-medium mb-1">
                  <span>Watermark Opacity</span>
                  <span>{Math.round(state.background.watermarkOpacity * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="0.3"
                  step="0.01"
                  value={state.background.watermarkOpacity}
                  onChange={(e) => updateBackground('watermarkOpacity', Number(e.target.value))}
                  className="w-full accent-indigo-600"
                />
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: PHOTOS, EMBLEM & SIGNATURES */}
        {activeTab === 'media' && (
          <div className="space-y-5">
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
              <ImageIcon className="w-4 h-4 text-indigo-600" />
              ID Photo, Emblem, Signatures & Fingerprint
            </h3>

            {/* Emblem / Coat of Arms Customization */}
            <div className="p-3 bg-amber-50/60 border border-amber-200/80 rounded-lg space-y-3 text-xs">
              <div className="flex items-center justify-between font-bold text-slate-900">
                <span>National Emblem / Coat of Arms</span>
                {state.customCoatOfArmsUrl && (
                  <span className="text-[10px] text-amber-700 bg-amber-100 px-2 py-0.5 rounded font-semibold">
                    Custom Emblem Active
                  </span>
                )}
              </div>

              {/* Show / Hide Toggles */}
              <div className="grid grid-cols-2 gap-2 bg-white p-2 rounded-lg border border-amber-200/60">
                <label className="flex items-center gap-2 cursor-pointer font-medium text-slate-700">
                  <input
                    type="checkbox"
                    checked={state.layout.coatOfArms?.visible !== false}
                    onChange={(e) =>
                      onChangeState({
                        ...state,
                        layout: {
                          ...state.layout,
                          coatOfArms: {
                            ...(state.layout.coatOfArms || { x: 0, y: 0 }),
                            visible: e.target.checked,
                          },
                        },
                      })
                    }
                    className="rounded text-amber-600 focus:ring-amber-500"
                  />
                  <span>Show Emblem Graphic</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer font-medium text-slate-700">
                  <input
                    type="checkbox"
                    checked={state.layout.coatOfArmsText?.visible !== false}
                    onChange={(e) =>
                      onChangeState({
                        ...state,
                        layout: {
                          ...state.layout,
                          coatOfArmsText: {
                            ...(state.layout.coatOfArmsText || { x: 0, y: 0 }),
                            visible: e.target.checked,
                          },
                        },
                      })
                    }
                    className="rounded text-amber-600 focus:ring-amber-500"
                  />
                  <span>Show Emblem Subtext</span>
                </label>
              </div>

              {/* Upload or Replace Emblem Image */}
              <div className="space-y-2 pt-1">
                <div className="flex items-center gap-2">
                  <label className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-amber-600 text-white font-semibold rounded-lg hover:bg-amber-700 cursor-pointer transition-colors">
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload Custom Emblem</span>
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
                      onClick={() =>
                        onChangeState({
                          ...state,
                          customCoatOfArmsUrl: undefined,
                        })
                      }
                      className="px-2.5 py-2 text-amber-800 bg-amber-100 hover:bg-amber-200 font-semibold rounded-lg text-xs transition-colors"
                      title="Reset to official RSA Coat of Arms"
                    >
                      Reset Official
                    </button>
                  )}
                </div>

                <input
                  type="text"
                  value={state.customCoatOfArmsUrl || ''}
                  onChange={(e) =>
                    onChangeState({
                      ...state,
                      customCoatOfArmsUrl: e.target.value || undefined,
                    })
                  }
                  placeholder="Or paste Emblem Image URL (PNG / SVG / JPG)"
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded text-[11px] bg-white"
                />
              </div>
            </div>

            {/* Photo Upload */}
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-3 text-xs">
              <div className="font-bold text-slate-800">Refugee Passport Photo</div>
              <div className="flex items-center gap-4">
                <div className="w-16 h-20 border border-slate-300 bg-slate-200 rounded overflow-hidden relative flex-shrink-0">
                  {state.photoUrl ? (
                    <img src={state.photoUrl} alt="Preview" className="w-full h-full object-cover grayscale" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-[10px] text-slate-400">
                      No Photo
                    </div>
                  )}
                </div>
                <div className="space-y-2 flex-1">
                  <label className="flex items-center justify-center gap-1.5 px-3 py-2 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 cursor-pointer transition-colors">
                    <Upload className="w-4 h-4" />
                    <span>Upload New Photo</span>
                    <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
                  </label>
                  <input
                    type="text"
                    value={state.photoUrl}
                    onChange={(e) => onChangeState({ ...state, photoUrl: e.target.value })}
                    placeholder="Or enter Image URL"
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded text-[11px]"
                  />
                </div>
              </div>
            </div>

            {/* Signature Pad Triggers */}
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-3 text-xs">
              <div className="font-bold text-slate-800">Official Signatures & Fingerprint</div>

              <div className="space-y-2">
                <div className="flex items-center justify-between p-2 bg-white border border-slate-200 rounded-lg">
                  <span className="font-medium text-slate-700">Director-General Signature</span>
                  <button
                    onClick={() =>
                      onOpenSignatureModal('Director-General Signature Pad', (url) =>
                        onChangeState({ ...state, directorGeneralSignatureUrl: url })
                      )
                    }
                    className="flex items-center gap-1 px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-indigo-700 font-semibold rounded"
                  >
                    <PenTool className="w-3.5 h-3.5" />
                    Sign / Draw
                  </button>
                </div>

                <div className="flex items-center justify-between p-2 bg-white border border-slate-200 rounded-lg">
                  <span className="font-medium text-slate-700">RSDO Official Signature</span>
                  <button
                    onClick={() =>
                      onOpenSignatureModal('RSDO Signature Pad', (url) =>
                        onChangeState({ ...state, rsdoSignatureUrl: url })
                      )
                    }
                    className="flex items-center gap-1 px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-indigo-700 font-semibold rounded"
                  >
                    <PenTool className="w-3.5 h-3.5" />
                    Sign / Draw
                  </button>
                </div>

                <div className="flex items-center justify-between p-2 bg-white border border-slate-200 rounded-lg">
                  <span className="font-medium text-slate-700">Permit Holder Signature</span>
                  <button
                    onClick={() =>
                      onOpenSignatureModal('Permit Holder Signature Pad', (url) =>
                        onChangeState({ ...state, permitHolderSignatureUrl: url })
                      )
                    }
                    className="flex items-center gap-1 px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-indigo-700 font-semibold rounded"
                  >
                    <PenTool className="w-3.5 h-3.5" />
                    Sign / Draw
                  </button>
                </div>

                <div className="flex items-center justify-between p-2 bg-white border border-slate-200 rounded-lg">
                  <span className="font-medium text-slate-700">Fingerprint Ink Impression</span>
                  <button
                    onClick={() =>
                      onOpenSignatureModal('Fingerprint Image / Impression', (url) =>
                        onChangeState({ ...state, fingerprintUrl: url })
                      )
                    }
                    className="flex items-center gap-1 px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-indigo-700 font-semibold rounded"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    Upload / Draw
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: BARCODES & CODES */}
        {activeTab === 'barcodes' && (
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
              <QrCode className="w-4 h-4 text-indigo-600" />
              Barcodes & Reference Numbers
            </h3>

            <div className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  BI Form Code Box (Top Right)
                </label>
                <input
                  type="text"
                  value={state.metadata.formNumber}
                  onChange={(e) => updateMetadata('formNumber', e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg font-bold"
                />
              </div>

              {/* TOP BARCODE CONFIGURATION */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-2">
                <div className="flex items-center justify-between font-bold text-slate-800">
                  <span>Top Barcode</span>
                  {state.customTopBarcodeUrl && (
                    <span className="text-[10px] text-indigo-700 bg-indigo-100 px-2 py-0.5 rounded font-semibold">
                      Custom Barcode Active
                    </span>
                  )}
                </div>
                <div>
                  <label className="block text-slate-600 font-medium mb-1">
                    Barcode Text / Number Value
                  </label>
                  <input
                    type="text"
                    value={state.metadata.topBarcodeValue}
                    onChange={(e) => updateMetadata('topBarcodeValue', e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded font-mono font-bold"
                  />
                </div>
                <div className="space-y-1.5 pt-1">
                  <div className="flex items-center gap-2">
                    <label className="flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 cursor-pointer transition-colors">
                      <Upload className="w-3.5 h-3.5" />
                      <span>Replace Top Barcode Image</span>
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
                        onClick={() =>
                          onChangeState({
                            ...state,
                            customTopBarcodeUrl: undefined,
                          })
                        }
                        className="px-2.5 py-1.5 text-slate-700 bg-slate-200 hover:bg-slate-300 font-semibold rounded-lg text-xs"
                      >
                        Reset Generated
                      </button>
                    )}
                  </div>
                  <input
                    type="text"
                    value={state.customTopBarcodeUrl || ''}
                    onChange={(e) =>
                      onChangeState({
                        ...state,
                        customTopBarcodeUrl: e.target.value || undefined,
                      })
                    }
                    placeholder="Or enter Image URL for Top Barcode"
                    className="w-full px-2.5 py-1 border border-slate-300 rounded text-[11px]"
                  />
                </div>
              </div>

              {/* BOTTOM BARCODE CONFIGURATION */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-2">
                <div className="flex items-center justify-between font-bold text-slate-800">
                  <span>Bottom Barcode</span>
                  {state.customBottomBarcodeUrl && (
                    <span className="text-[10px] text-indigo-700 bg-indigo-100 px-2 py-0.5 rounded font-semibold">
                      Custom Barcode Active
                    </span>
                  )}
                </div>
                <div>
                  <label className="block text-slate-600 font-medium mb-1">
                    Barcode Text / Number Value
                  </label>
                  <input
                    type="text"
                    value={state.metadata.bottomBarcodeValue}
                    onChange={(e) => updateMetadata('bottomBarcodeValue', e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded font-mono font-bold"
                  />
                </div>
                <div className="space-y-1.5 pt-1">
                  <div className="flex items-center gap-2">
                    <label className="flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 cursor-pointer transition-colors">
                      <Upload className="w-3.5 h-3.5" />
                      <span>Replace Bottom Barcode Image</span>
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
                        onClick={() =>
                          onChangeState({
                            ...state,
                            customBottomBarcodeUrl: undefined,
                          })
                        }
                        className="px-2.5 py-1.5 text-slate-700 bg-slate-200 hover:bg-slate-300 font-semibold rounded-lg text-xs"
                      >
                        Reset Generated
                      </button>
                    )}
                  </div>
                  <input
                    type="text"
                    value={state.customBottomBarcodeUrl || ''}
                    onChange={(e) =>
                      onChangeState({
                        ...state,
                        customBottomBarcodeUrl: e.target.value || undefined,
                      })
                    }
                    placeholder="Or enter Image URL for Bottom Barcode"
                    className="w-full px-2.5 py-1 border border-slate-300 rounded text-[11px]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Template Version Code (Bottom Right)
                </label>
                <input
                  type="text"
                  value={state.metadata.templateCode}
                  onChange={(e) => updateMetadata('templateCode', e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono"
                />
              </div>
            </div>
          </div>
        )}

        {/* TAB 6: CUSTOM TEXT BLOCKS */}
        {activeTab === 'customText' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                <Type className="w-4 h-4 text-amber-500" />
                Custom Text Elements
              </h3>
              <button
                onClick={handleAddCustomText}
                className="flex items-center gap-1 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-lg shadow-sm transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Text
              </button>
            </div>

            <p className="text-xs text-slate-500 leading-relaxed">
              Add custom text overlays anywhere on the document canvas. Drag, scale, edit font style, and change color interactively.
            </p>

            {(!state.customTexts || state.customTexts.length === 0) ? (
              <div className="p-6 text-center border-2 border-dashed border-slate-200 rounded-xl bg-slate-50">
                <Type className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                <p className="text-xs font-semibold text-slate-600">No custom text blocks yet</p>
                <p className="text-[11px] text-slate-400 mt-1 mb-3">Click below to create your first custom text overlay</p>
                <button
                  onClick={handleAddCustomText}
                  className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-lg shadow-sm"
                >
                  + Add Custom Text Block
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {state.customTexts.map((ct, index) => (
                  <div key={ct.id} className="p-3.5 border border-slate-200 rounded-xl bg-slate-50 space-y-3">
                    <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                      <span className="text-xs font-bold text-slate-800">
                        Custom Text #{index + 1}
                      </span>
                      <div className="flex items-center gap-2">
                        <label className="flex items-center gap-1 text-[11px] text-slate-600 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={ct.visible !== false}
                            onChange={(e) => updateCustomText(ct.id, { visible: e.target.checked })}
                            className="rounded text-indigo-600"
                          />
                          Visible
                        </label>
                        <button
                          onClick={() => deleteCustomText(ct.id)}
                          className="text-red-500 hover:text-red-700 p-1 rounded hover:bg-red-50"
                          title="Delete Custom Text"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                        Text Content
                      </label>
                      <input
                        type="text"
                        value={ct.text}
                        onChange={(e) => updateCustomText(ct.id, { text: e.target.value })}
                        className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs font-semibold"
                        placeholder="Enter custom text..."
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <label className="block text-[10px] font-semibold text-slate-600 mb-1">
                          Font Family
                        </label>
                        <select
                          value={ct.fontFamily || 'arial'}
                          onChange={(e) => updateCustomText(ct.id, { fontFamily: e.target.value })}
                          className="w-full px-2 py-1 border border-slate-300 rounded-lg text-[11px] bg-white font-mono"
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
                      </div>

                      <div>
                        <label className="block text-[10px] font-semibold text-slate-600 mb-1">
                          Font Weight
                        </label>
                        <select
                          value={ct.fontWeight || 'bold'}
                          onChange={(e) => updateCustomText(ct.id, { fontWeight: e.target.value as any })}
                          className="w-full px-2 py-1 border border-slate-300 rounded-lg text-[11px] bg-white"
                        >
                          <option value="normal">Normal</option>
                          <option value="medium">Medium</option>
                          <option value="semibold">SemiBold</option>
                          <option value="bold">Bold</option>
                          <option value="extrabold">ExtraBold</option>
                          <option value="black">Black</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2 text-xs items-center">
                      <div>
                        <label className="block text-[10px] font-semibold text-slate-600 mb-1">
                          Font Size
                        </label>
                        <div className="flex items-center gap-1">
                          <input
                            type="number"
                            value={ct.fontSize || 13}
                            onChange={(e) => updateCustomText(ct.id, { fontSize: parseInt(e.target.value) || 12 })}
                            className="w-full px-2 py-1 border border-slate-300 rounded-lg text-[11px]"
                            min={8}
                            max={48}
                          />
                          <span className="text-[10px] text-slate-500">px</span>
                        </div>
                      </div>

                      <div>
                        <label className="block text-[10px] font-semibold text-slate-600 mb-1">
                          Text Color
                        </label>
                        <div className="flex items-center gap-1.5">
                          <input
                            type="color"
                            value={ct.color || '#000000'}
                            onChange={(e) => updateCustomText(ct.id, { color: e.target.value })}
                            className="w-6 h-6 rounded cursor-pointer border border-slate-300"
                          />
                          <span className="text-[10px] font-mono text-slate-600">{ct.color || '#000000'}</span>
                        </div>
                      </div>

                      <div>
                        <label className="block text-[10px] font-semibold text-slate-600 mb-1">
                          Alignment
                        </label>
                        <select
                          value={ct.textAlign || 'left'}
                          onChange={(e) => updateCustomText(ct.id, { textAlign: e.target.value as any })}
                          className="w-full px-1.5 py-1 border border-slate-300 rounded-lg text-[11px] bg-white"
                        >
                          <option value="left">Left</option>
                          <option value="center">Center</option>
                          <option value="right">Right</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs pt-1 border-t border-slate-200/80">
                      <div>
                        <label className="block text-[10px] font-semibold text-slate-500 mb-0.5">X Position</label>
                        <input
                          type="number"
                          value={ct.x}
                          onChange={(e) => updateCustomText(ct.id, { x: parseInt(e.target.value) || 0 })}
                          className="w-full px-2 py-0.5 border border-slate-300 rounded text-[11px]"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-semibold text-slate-500 mb-0.5">Y Position</label>
                        <input
                          type="number"
                          value={ct.y}
                          onChange={(e) => updateCustomText(ct.id, { y: parseInt(e.target.value) || 0 })}
                          className="w-full px-2 py-0.5 border border-slate-300 rounded text-[11px]"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Drawer Footer Reset Button */}
      <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-between items-center">
        <button
          onClick={onResetToDefault}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-white border border-slate-300 rounded-lg hover:bg-slate-100 transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Reset Sample
        </button>
        <button
          onClick={onClose}
          className="px-4 py-1.5 bg-indigo-600 text-white font-semibold text-xs rounded-lg hover:bg-indigo-700 transition-colors shadow-xs"
        >
          Done
        </button>
      </div>
    </div>
  );
}
