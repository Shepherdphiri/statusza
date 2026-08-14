import initSqlJs, { Database } from 'sql.js';
import sqlWasmUrl from 'sql.js/dist/sql-wasm.wasm?url';
import { DocumentState } from '../types';
import { HARDCODED_DEFAULT_TEMPLATE } from '../data/defaultData';

const IDB_NAME = 'rsa_refugee_offline_db';
const IDB_VERSION = 1;
const IDB_STORE = 'sqlite_storage';
const IDB_KEY = 'rsa_sqlite_db_binary';

export interface SqliteDocumentRecord {
  id: string;
  name: string;
  permit_number: string;
  holder_name: string;
  created_at: string;
  updated_at: string;
  data_json: string;
}

let dbInstance: Database | null = null;
let initPromise: Promise<Database> | null = null;

// Open or create IndexedDB storage for binary SQLite database
function openIndexedDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === 'undefined') {
      return reject(new Error('IndexedDB is not supported'));
    }
    const request = indexedDB.open(IDB_NAME, IDB_VERSION);
    request.onupgradeneeded = (e) => {
      const db = (e.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(IDB_STORE)) {
        db.createObjectStore(IDB_STORE);
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

// Retrieve saved SQLite binary from IndexedDB
async function getStoredSqliteBinary(): Promise<Uint8Array | null> {
  try {
    const idb = await openIndexedDb();
    return new Promise((resolve) => {
      const tx = idb.transaction(IDB_STORE, 'readonly');
      const store = tx.objectStore(IDB_STORE);
      const req = store.get(IDB_KEY);
      req.onsuccess = () => {
        if (req.result instanceof Uint8Array) {
          resolve(req.result);
        } else if (req.result instanceof ArrayBuffer) {
          resolve(new Uint8Array(req.result));
        } else {
          resolve(null);
        }
      };
      req.onerror = () => resolve(null);
    });
  } catch (err) {
    console.warn('Could not read from IndexedDB, falling back to memory/fresh database.', err);
    return null;
  }
}

// Save SQLite binary to IndexedDB
async function saveStoredSqliteBinary(binary: Uint8Array): Promise<void> {
  try {
    const idb = await openIndexedDb();
    return new Promise((resolve, reject) => {
      const tx = idb.transaction(IDB_STORE, 'readwrite');
      const store = tx.objectStore(IDB_STORE);
      const req = store.put(binary, IDB_KEY);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.error('Error writing SQLite binary to IndexedDB:', err);
  }
}

// Initialize SQLite WASM Database instance
export async function getSqliteDb(): Promise<Database> {
  if (dbInstance) return dbInstance;
  if (initPromise) return initPromise;

  initPromise = (async () => {
    try {
      // Clean up legacy localStorage base64 data to avoid quota issues
      try {
        localStorage.removeItem('rsa_refugee_sqlite_binary');
      } catch (_) {}

      const SQL = await initSqlJs({
        locateFile: () => sqlWasmUrl,
      });

      // Load existing SQLite binary from IndexedDB
      const savedBinary = await getStoredSqliteBinary();
      const db = savedBinary ? new SQL.Database(savedBinary) : new SQL.Database();

      // Create standalone schema
      db.run(`
        CREATE TABLE IF NOT EXISTS documents (
          id TEXT PRIMARY KEY,
          name TEXT NOT NULL,
          permit_number TEXT,
          holder_name TEXT,
          created_at TEXT DEFAULT (datetime('now', 'localtime')),
          updated_at TEXT DEFAULT (datetime('now', 'localtime')),
          data_json TEXT NOT NULL
        );

        CREATE TABLE IF NOT EXISTS templates (
          id TEXT PRIMARY KEY,
          name TEXT NOT NULL,
          description TEXT,
          created_at TEXT DEFAULT (datetime('now', 'localtime')),
          data_json TEXT NOT NULL
        );

        CREATE TABLE IF NOT EXISTS system_metadata (
          key TEXT PRIMARY KEY,
          value TEXT NOT NULL
        );

        INSERT OR IGNORE INTO documents (id, name, permit_number, holder_name, data_json)
        VALUES (
          'template_default_bi1693',
          'Official BI-1693 Hardcoded Default Template',
          '200141870',
          'BICIOUSLUCKSON WILFRED',
          '${JSON.stringify(HARDCODED_DEFAULT_TEMPLATE).replace(/'/g, "''")}'
        );
      `);

      dbInstance = db;
      persistDb(db);
      return db;
    } catch (err) {
      console.error('Error initializing SQLite WASM with local asset, attempting cdn fallback:', err);
      const SQL = await initSqlJs({
        locateFile: () => 'https://sql.js.org/dist/sql-wasm.wasm',
      });
      const db = new SQL.Database();
      db.run(`
        CREATE TABLE IF NOT EXISTS documents (
          id TEXT PRIMARY KEY,
          name TEXT NOT NULL,
          permit_number TEXT,
          holder_name TEXT,
          created_at TEXT DEFAULT (datetime('now', 'localtime')),
          updated_at TEXT DEFAULT (datetime('now', 'localtime')),
          data_json TEXT NOT NULL
        );

        INSERT OR IGNORE INTO documents (id, name, permit_number, holder_name, data_json)
        VALUES (
          'template_default_bi1693',
          'Official BI-1693 Hardcoded Default Template',
          '200141870',
          'BICIOUSLUCKSON WILFRED',
          '${JSON.stringify(HARDCODED_DEFAULT_TEMPLATE).replace(/'/g, "''")}'
        );
      `);
      dbInstance = db;
      return db;
    }
  })();

  return initPromise;
}

// Persist the binary SQLite state into IndexedDB
export function persistDb(db: Database) {
  try {
    const binary = db.export();
    saveStoredSqliteBinary(binary).catch((err) => {
      console.error('Async IndexedDB persist error:', err);
    });
  } catch (err) {
    console.error('Error exporting SQLite database binary:', err);
  }
}

// Save active document state into SQLite
export async function saveDocumentToSqlite(
  docState: DocumentState,
  customName?: string,
  docId: string = 'current_active'
): Promise<SqliteDocumentRecord> {
  const db = await getSqliteDb();
  const name =
    customName ||
    `${docState.particulars.nameAndSurname || 'Refugee'}_${docState.metadata.bottomBarcodeValue || 'BI-1693'}`;
  const permitNumber = docState.metadata.bottomBarcodeValue || 'BI-1693';
  const holderName = docState.particulars.nameAndSurname || 'Unknown';
  const jsonStr = JSON.stringify(docState);
  const now = new Date().toISOString();

  // UPSERT
  const stmt = db.prepare(`
    INSERT INTO documents (id, name, permit_number, holder_name, created_at, updated_at, data_json)
    VALUES (?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(id) DO UPDATE SET
      name=excluded.name,
      permit_number=excluded.permit_number,
      holder_name=excluded.holder_name,
      updated_at=excluded.updated_at,
      data_json=excluded.data_json;
  `);

  stmt.run([docId, name, permitNumber, holderName, now, now, jsonStr]);
  stmt.free();
  persistDb(db);

  return {
    id: docId,
    name,
    permit_number: permitNumber,
    holder_name: holderName,
    created_at: now,
    updated_at: now,
    data_json: jsonStr,
  };
}

// Fetch all saved document records from SQLite
export async function getSqliteDocuments(): Promise<SqliteDocumentRecord[]> {
  const db = await getSqliteDb();
  const res = db.exec(`SELECT id, name, permit_number, holder_name, created_at, updated_at, data_json FROM documents ORDER BY updated_at DESC;`);
  if (!res || res.length === 0) return [];

  const columns = res[0].columns;
  const values = res[0].values;

  return values.map((row) => {
    const obj: any = {};
    columns.forEach((col, idx) => {
      obj[col] = row[idx];
    });
    return obj as SqliteDocumentRecord;
  });
}

// Load a specific document by ID from SQLite
export async function loadDocumentFromSqlite(id: string): Promise<DocumentState | null> {
  const db = await getSqliteDb();
  const stmt = db.prepare(`SELECT data_json FROM documents WHERE id = ? LIMIT 1;`);
  stmt.bind([id]);
  if (stmt.step()) {
    const row = stmt.getAsObject();
    stmt.free();
    if (row.data_json && typeof row.data_json === 'string') {
      return JSON.parse(row.data_json) as DocumentState;
    }
  }
  stmt.free();
  return null;
}

// Delete a document record from SQLite
export async function deleteDocumentFromSqlite(id: string): Promise<boolean> {
  const db = await getSqliteDb();
  db.run(`DELETE FROM documents WHERE id = ?;`, [id]);
  persistDb(db);
  return true;
}

// Run arbitrary SQL query for the SQLite inspector console
export async function runCustomSqlQuery(sql: string): Promise<{ columns: string[]; rows: any[][] }> {
  const db = await getSqliteDb();
  const results = db.exec(sql);
  persistDb(db);
  if (!results || results.length === 0) {
    return { columns: [], rows: [] };
  }
  return {
    columns: results[0].columns,
    rows: results[0].values,
  };
}

// Export the raw SQLite binary database file (.sqlite / .db)
export async function exportSqliteDatabaseFile(filename: string = 'rsa_refugee_database.sqlite') {
  const db = await getSqliteDb();
  const binary = db.export();
  const blob = new Blob([binary], { type: 'application/x-sqlite3' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

// Import a raw SQLite binary database file (.sqlite / .db)
export async function importSqliteDatabaseFile(file: File): Promise<number> {
  const arrayBuffer = await file.arrayBuffer();
  const SQL = await initSqlJs({
    locateFile: () => sqlWasmUrl,
  });
  const db = new SQL.Database(new Uint8Array(arrayBuffer));
  dbInstance = db;
  persistDb(db);
  const docs = await getSqliteDocuments();
  return docs.length;
}
