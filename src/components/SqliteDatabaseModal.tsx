import React, { useState, useEffect } from 'react';
import {
  Database as DbIcon,
  X,
  Download,
  Upload,
  Trash2,
  Play,
  Save,
  Clock,
  FileCheck,
  HardDrive,
  RefreshCw,
  Code2,
  CheckCircle,
} from 'lucide-react';
import {
  getSqliteDocuments,
  saveDocumentToSqlite,
  loadDocumentFromSqlite,
  deleteDocumentFromSqlite,
  exportSqliteDatabaseFile,
  importSqliteDatabaseFile,
  runCustomSqlQuery,
  SqliteDocumentRecord,
} from '../utils/sqliteDb';
import { DocumentState } from '../types';

interface SqliteDatabaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentState: DocumentState;
  onLoadDocument: (state: DocumentState) => void;
  onShowToast: (msg: string) => void;
}

export function SqliteDatabaseModal({
  isOpen,
  onClose,
  currentState,
  onLoadDocument,
  onShowToast,
}: SqliteDatabaseModalProps) {
  const [activeTab, setActiveTab] = useState<'records' | 'sqlConsole'>('records');
  const [records, setRecords] = useState<SqliteDocumentRecord[]>([]);
  const [newRecordName, setNewRecordName] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // SQL Console state
  const [sqlQuery, setSqlQuery] = useState('SELECT id, name, holder_name, permit_number, updated_at FROM documents ORDER BY updated_at DESC;');
  const [queryResult, setQueryResult] = useState<{ columns: string[]; rows: any[][] } | null>(null);
  const [queryError, setQueryError] = useState<string | null>(null);

  const fetchRecords = async () => {
    try {
      setIsLoading(true);
      const list = await getSqliteDocuments();
      setRecords(list);
    } catch (err) {
      console.error('Error fetching SQLite records:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchRecords();
    }
  }, [isOpen]);

  const handleSaveCurrent = async () => {
    const docId = `doc_${Date.now()}`;
    const name = newRecordName.trim() || `${currentState.particulars.nameAndSurname || 'Document'} (${new Date().toLocaleDateString()})`;
    try {
      await saveDocumentToSqlite(currentState, name, docId);
      setNewRecordName('');
      await fetchRecords();
      onShowToast(`Saved snapshot "${name}" into SQLite database!`);
    } catch (err) {
      onShowToast('Failed to save to SQLite database.');
    }
  };

  const handleLoad = async (id: string, name: string) => {
    try {
      const doc = await loadDocumentFromSqlite(id);
      if (doc) {
        onLoadDocument(doc);
        onShowToast(`Loaded "${name}" from SQLite.`);
        onClose();
      }
    } catch (err) {
      onShowToast('Failed to load document.');
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (window.confirm(`Delete record "${name}" from SQLite?`)) {
      await deleteDocumentFromSqlite(id);
      await fetchRecords();
      onShowToast(`Deleted "${name}" from SQLite.`);
    }
  };

  const handleExportDb = async () => {
    try {
      await exportSqliteDatabaseFile();
      onShowToast('Exported rsa_refugee_database.sqlite successfully!');
    } catch (err) {
      onShowToast('Failed to export SQLite database file.');
    }
  };

  const handleImportDb = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const count = await importSqliteDatabaseFile(file);
        await fetchRecords();
        onShowToast(`Imported SQLite database with ${count} record(s)!`);
      } catch (err) {
        onShowToast('Failed to import SQLite file.');
      }
    }
  };

  const handleExecuteSql = async () => {
    setQueryError(null);
    try {
      const res = await runCustomSqlQuery(sqlQuery);
      setQueryResult(res);
      await fetchRecords();
    } catch (err: any) {
      setQueryError(err?.message || 'SQL execution failed.');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-3xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/90">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-xl">
              <DbIcon className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <span>Standalone SQLite Database</span>
                <span className="text-[10px] bg-emerald-950 text-emerald-400 border border-emerald-800/60 px-2 py-0.5 rounded-full font-mono font-medium">
                  100% Local / Zero Cloud
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Independent SQL storage engine with zero reliance on external cloud services.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs & Quick Actions */}
        <div className="px-6 py-2.5 bg-slate-950/60 border-b border-slate-800 flex items-center justify-between flex-wrap gap-2 text-xs">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('records')}
              className={`px-3 py-1.5 font-semibold rounded-lg transition-colors flex items-center gap-1.5 ${
                activeTab === 'records'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              <HardDrive className="w-3.5 h-3.5" />
              <span>Saved Records ({records.length})</span>
            </button>
            <button
              onClick={() => setActiveTab('sqlConsole')}
              className={`px-3 py-1.5 font-semibold rounded-lg transition-colors flex items-center gap-1.5 ${
                activeTab === 'sqlConsole'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              <Code2 className="w-3.5 h-3.5" />
              <span>SQL Query Console</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportDb}
              className="flex items-center gap-1 px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg transition-colors"
              title="Download SQLite Database binary file (.sqlite)"
            >
              <Download className="w-3.5 h-3.5 text-emerald-400" />
              <span>Export .sqlite DB</span>
            </button>
            <label
              className="flex items-center gap-1 px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg cursor-pointer transition-colors"
              title="Import SQLite Database binary file (.sqlite)"
            >
              <Upload className="w-3.5 h-3.5 text-indigo-400" />
              <span>Import .sqlite DB</span>
              <input type="file" accept=".sqlite,.db" onChange={handleImportDb} className="hidden" />
            </label>
          </div>
        </div>

        {/* Content Area */}
        <div className="p-6 overflow-y-auto flex-1 text-xs space-y-4">
          {activeTab === 'records' && (
            <>
              {/* Save Current Snapshot */}
              <div className="p-4 bg-slate-800/40 border border-slate-700/60 rounded-xl space-y-2">
                <div className="font-semibold text-slate-200 text-xs flex items-center gap-1.5">
                  <Save className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Save Current Document Version to SQLite</span>
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder={`e.g. ${currentState.particulars.nameAndSurname || 'Document'} - Final Copy`}
                    value={newRecordName}
                    onChange={(e) => setNewRecordName(e.target.value)}
                    className="flex-1 px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                  <button
                    onClick={handleSaveCurrent}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-lg flex items-center gap-1.5 transition-colors"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>Save to SQLite</span>
                  </button>
                </div>
              </div>

              {/* Records List */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-slate-400 font-medium">
                  <span>SQLite Database Records:</span>
                  <button
                    onClick={fetchRecords}
                    className="flex items-center gap-1 text-slate-400 hover:text-white transition-colors"
                  >
                    <RefreshCw className={`w-3 h-3 ${isLoading ? 'animate-spin' : ''}`} />
                    <span>Refresh</span>
                  </button>
                </div>

                {records.length === 0 ? (
                  <div className="p-8 border border-dashed border-slate-800 rounded-xl text-center text-slate-500">
                    No custom versions saved yet. The current active document is automatically preserved in SQLite. Click above to save a named snapshot!
                  </div>
                ) : (
                  <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                    {records.map((rec) => (
                      <div
                        key={rec.id}
                        className="p-3 bg-slate-800/60 border border-slate-700/50 hover:border-indigo-500/50 rounded-xl flex items-center justify-between gap-3 transition-all"
                      >
                        <div className="min-w-0 flex-1">
                          <div className="font-bold text-slate-100 truncate flex items-center gap-2">
                            <span>{rec.name}</span>
                            {rec.id === 'current_active' && (
                              <span className="text-[9px] bg-indigo-950 text-indigo-300 border border-indigo-700 px-1.5 py-0.2 rounded font-mono">
                                Auto-saved Active
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-slate-400 flex items-center gap-3 mt-1">
                            <span>Holder: {rec.holder_name}</span>
                            <span>Ref: {rec.permit_number}</span>
                            <span className="flex items-center gap-1 text-slate-500 font-mono text-[10px]">
                              <Clock className="w-3 h-3" />
                              {new Date(rec.updated_at).toLocaleString()}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleLoad(rec.id, rec.name)}
                            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-lg flex items-center gap-1 transition-colors"
                          >
                            <FileCheck className="w-3.5 h-3.5" />
                            <span>Load</span>
                          </button>
                          {rec.id !== 'current_active' && (
                            <button
                              onClick={() => handleDelete(rec.id, rec.name)}
                              className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-950/40 rounded-lg transition-colors"
                              title="Delete record"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}

          {activeTab === 'sqlConsole' && (
            <div className="space-y-3">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-slate-300 font-semibold flex items-center gap-1.5">
                    <Code2 className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Run Direct SQL Query against SQLite database:</span>
                  </label>
                  <div className="flex gap-1.5">
                    <button
                      onClick={() => setSqlQuery('SELECT id, name, holder_name, permit_number, updated_at FROM documents;')}
                      className="px-2 py-0.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-[10px] font-mono"
                    >
                      SELECT docs
                    </button>
                    <button
                      onClick={() => setSqlQuery('SELECT * FROM sqlite_master WHERE type="table";')}
                      className="px-2 py-0.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-[10px] font-mono"
                    >
                      Tables info
                    </button>
                  </div>
                </div>

                <div className="relative">
                  <textarea
                    rows={3}
                    value={sqlQuery}
                    onChange={(e) => setSqlQuery(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg font-mono text-xs text-indigo-300 focus:outline-none focus:border-indigo-500"
                  />
                  <button
                    onClick={handleExecuteSql}
                    className="absolute right-2.5 bottom-2.5 px-3 py-1 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-md flex items-center gap-1 text-[11px] shadow-sm transition-colors"
                  >
                    <Play className="w-3 h-3" />
                    <span>Execute</span>
                  </button>
                </div>
              </div>

              {queryError && (
                <div className="p-3 bg-rose-950/60 border border-rose-800 rounded-lg text-rose-300 font-mono text-[11px]">
                  {queryError}
                </div>
              )}

              {queryResult && (
                <div className="space-y-1">
                  <div className="text-slate-400 font-semibold text-[11px]">
                    Results: {queryResult.rows.length} row(s) returned
                  </div>
                  <div className="max-h-60 overflow-auto border border-slate-800 rounded-lg">
                    <table className="w-full text-left font-mono text-[11px]">
                      <thead className="bg-slate-950 border-b border-slate-800 text-slate-300">
                        <tr>
                          {queryResult.columns.map((col, idx) => (
                            <th key={idx} className="px-3 py-1.5 font-bold">{col}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800 text-slate-200">
                        {queryResult.rows.map((row, rIdx) => (
                          <tr key={rIdx} className="hover:bg-slate-800/40">
                            {row.map((val, cIdx) => (
                              <td key={cIdx} className="px-3 py-1.5 truncate max-w-xs">{String(val ?? 'NULL')}</td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-950/80 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
          <span>Engine: SQLite 3.46 (WebAssembly + Binary File Persistence)</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold rounded-lg transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
