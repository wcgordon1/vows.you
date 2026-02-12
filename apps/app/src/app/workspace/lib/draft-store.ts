// ─── Draft Store ─────────────────────────────────────────────────────────────
// IndexedDB-backed draft persistence with localStorage fallback.
// Never stores vow text on any server — local device only (until Convex sync).

export interface Draft {
  id: string;
  title: string;
  tiptapJSON: Record<string, unknown> | null;
  createdAt: number;
  updatedAt: number;
}

const DB_NAME = "vows-drafts";
const DB_VERSION = 1;
const STORE_NAME = "drafts";
const LS_KEY = "vows-drafts";
const ACTIVE_DRAFT_KEY = "vows-active-draft-id";

// ─── IndexedDB Helpers ───────────────────────────────────────────────────────

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: "id" });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

function idbTransaction<T>(
  mode: IDBTransactionMode,
  fn: (store: IDBObjectStore) => IDBRequest<T>,
): Promise<T> {
  return openDB().then(
    (db) =>
      new Promise<T>((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, mode);
        const store = tx.objectStore(STORE_NAME);
        const request = fn(store);
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      }),
  );
}

// ─── IndexedDB Implementation ────────────────────────────────────────────────

const idbStore = {
  async getAll(): Promise<Draft[]> {
    return idbTransaction("readonly", (store) => store.getAll());
  },

  async get(id: string): Promise<Draft | undefined> {
    const result = await idbTransaction("readonly", (store) => store.get(id));
    return result ?? undefined;
  },

  async save(draft: Draft): Promise<void> {
    await idbTransaction("readwrite", (store) => store.put(draft));
  },

  async delete(id: string): Promise<void> {
    await idbTransaction("readwrite", (store) => store.delete(id));
  },
};

// ─── localStorage Fallback ───────────────────────────────────────────────────

const lsStore = {
  _read(): Draft[] {
    try {
      const raw = localStorage.getItem(LS_KEY);
      return raw ? (JSON.parse(raw) as Draft[]) : [];
    } catch {
      return [];
    }
  },

  _write(drafts: Draft[]) {
    try {
      localStorage.setItem(LS_KEY, JSON.stringify(drafts));
    } catch {
      // localStorage full or unavailable — silently fail
    }
  },

  async getAll(): Promise<Draft[]> {
    return this._read();
  },

  async get(id: string): Promise<Draft | undefined> {
    return this._read().find((d) => d.id === id);
  },

  async save(draft: Draft): Promise<void> {
    const drafts = this._read();
    const idx = drafts.findIndex((d) => d.id === draft.id);
    if (idx >= 0) {
      drafts[idx] = draft;
    } else {
      drafts.push(draft);
    }
    this._write(drafts);
  },

  async delete(id: string): Promise<void> {
    const drafts = this._read().filter((d) => d.id !== id);
    this._write(drafts);
  },
};

// ─── Feature Detection + Unified API ─────────────────────────────────────────

function hasIndexedDB(): boolean {
  try {
    return typeof indexedDB !== "undefined" && indexedDB !== null;
  } catch {
    return false;
  }
}

function getStore() {
  return hasIndexedDB() ? idbStore : lsStore;
}

// ─── Public API ──────────────────────────────────────────────────────────────

export const draftStore = {
  getAll: () => getStore().getAll(),
  get: (id: string) => getStore().get(id),
  save: (draft: Draft) => getStore().save(draft),
  delete: (id: string) => getStore().delete(id),

  getActiveDraftId(): string | null {
    try {
      return sessionStorage.getItem(ACTIVE_DRAFT_KEY);
    } catch {
      return null;
    }
  },

  setActiveDraftId(id: string) {
    try {
      sessionStorage.setItem(ACTIVE_DRAFT_KEY, id);
    } catch {
      // ignore
    }
  },
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

export function createDraftId(): string {
  return `draft_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

export function createEmptyDraft(id?: string): Draft {
  const now = Date.now();
  return {
    id: id ?? createDraftId(),
    title: "Untitled",
    tiptapJSON: null,
    createdAt: now,
    updatedAt: now,
  };
}
