"use client";

import {
  createContext,
  useContext,
  useCallback,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useAuth } from "@clerk/nextjs";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import type { Id } from "../../../../convex/_generated/dataModel";
import {
  draftStore,
  createEmptyDraft,
  type Draft,
} from "../lib/draft-store";
import {
  checkGate,
  type GatedAction,
  type GateResult,
} from "../lib/entitlements";
import {
  setPendingAction,
  consumePendingAction,
} from "../lib/pending-action";
import { track } from "../lib/analytics";
import type { VowAnalysis } from "@/lib/vow-review";

// ─── Types ───────────────────────────────────────────────────────────────────

type SaveStatus = "idle" | "saving" | "saved";

interface WorkspaceState {
  drafts: Draft[];
  activeDraftId: string | null;
  isLoaded: boolean;
  saveStatus: SaveStatus;
  hasPaidEntitlement: boolean;
  // Modal controls
  showAuthModal: boolean;
  showPaywallModal: boolean;
  paywallTrigger: string;
  showUpgradeCard: boolean;
}

type WorkspaceAction =
  | { type: "DRAFTS_LOADED"; drafts: Draft[]; activeDraftId: string }
  | { type: "DRAFT_CREATED"; draft: Draft }
  | { type: "DRAFT_UPDATED"; draft: Draft }
  | { type: "DRAFT_DELETED"; id: string; newActiveId: string | null }
  | { type: "DRAFT_SWITCHED"; id: string }
  | { type: "DRAFT_RENAMED"; id: string; title: string }
  | { type: "SET_SAVE_STATUS"; status: SaveStatus }
  | { type: "SET_PAID_ENTITLEMENT"; value: boolean }
  | { type: "SHOW_AUTH_MODAL"; show: boolean }
  | { type: "SHOW_PAYWALL_MODAL"; show: boolean; trigger?: string }
  | { type: "SHOW_UPGRADE_CARD"; show: boolean };

function reducer(state: WorkspaceState, action: WorkspaceAction): WorkspaceState {
  switch (action.type) {
    case "DRAFTS_LOADED":
      return {
        ...state,
        drafts: action.drafts,
        activeDraftId: action.activeDraftId,
        isLoaded: true,
      };
    case "DRAFT_CREATED":
      return {
        ...state,
        drafts: [...state.drafts, action.draft],
        activeDraftId: action.draft.id,
      };
    case "DRAFT_UPDATED":
      return {
        ...state,
        drafts: state.drafts.map((d) =>
          d.id === action.draft.id ? action.draft : d,
        ),
      };
    case "DRAFT_DELETED": {
      return {
        ...state,
        drafts: state.drafts.filter((d) => d.id !== action.id),
        activeDraftId: action.newActiveId,
      };
    }
    case "DRAFT_SWITCHED":
      return { ...state, activeDraftId: action.id };
    case "DRAFT_RENAMED":
      return {
        ...state,
        drafts: state.drafts.map((d) =>
          d.id === action.id ? { ...d, title: action.title, updatedAt: Date.now() } : d,
        ),
      };
    case "SET_SAVE_STATUS":
      return { ...state, saveStatus: action.status };
    case "SET_PAID_ENTITLEMENT":
      return { ...state, hasPaidEntitlement: action.value };
    case "SHOW_AUTH_MODAL":
      return { ...state, showAuthModal: action.show };
    case "SHOW_PAYWALL_MODAL":
      return {
        ...state,
        showPaywallModal: action.show,
        paywallTrigger: action.trigger ?? state.paywallTrigger,
      };
    case "SHOW_UPGRADE_CARD":
      return { ...state, showUpgradeCard: action.show };
    default:
      return state;
  }
}

const initialState: WorkspaceState = {
  drafts: [],
  activeDraftId: null,
  isLoaded: false,
  saveStatus: "idle",
  hasPaidEntitlement: false,
  showAuthModal: false,
  showPaywallModal: false,
  paywallTrigger: "",
  showUpgradeCard: false,
};

// ─── Convex → Draft normalization ─────────────────────────────────────────────
// Maps Convex document shape to the local Draft interface so downstream
// components don't need to know about the data source.

function convexToDraft(doc: {
  _id: Id<"drafts">;
  title: string;
  body?: unknown;
  createdAt: number;
  updatedAt: number;
}): Draft {
  return {
    id: doc._id as string,
    title: doc.title,
    tiptapJSON: (doc.body as Record<string, unknown>) ?? null,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  };
}

// ─── Context ─────────────────────────────────────────────────────────────────

interface WorkspaceContextValue {
  // State
  state: WorkspaceState;
  activeDraft: Draft | null;
  isSignedIn: boolean;
  // Draft actions
  createDraft: () => void;
  switchDraft: (id: string) => void;
  updateActiveDraftContent: (tiptapJSON: Record<string, unknown>) => void;
  renameDraft: (id: string, title: string) => void;
  deleteDraft: (id: string) => void;
  // Gated action handler
  requestAction: (action: GatedAction) => GateResult;
  // Modal controls
  setShowAuthModal: (show: boolean) => void;
  setShowPaywallModal: (show: boolean, trigger?: string) => void;
  setShowUpgradeCard: (show: boolean) => void;
  // Entitlement (mock for now — Phase 4 wires to Convex)
  setPaidEntitlement: (value: boolean) => void;
  // Vow analysis (shared between editor and guide panel)
  vowAnalysis: VowAnalysis | null;
  setVowAnalysis: (analysis: VowAnalysis | null) => void;
  // Editor bridge — lets guide panel insert content into the editor
  insertHTML: (html: string, opts?: { replace?: boolean }) => void;
  setInsertHTML: (fn: (html: string, opts?: { replace?: boolean }) => void) => void;
}

const WorkspaceContext = createContext<WorkspaceContextValue | null>(null);

// ─── Provider ────────────────────────────────────────────────────────────────

export function WorkspaceProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const { isSignedIn: clerkSignedIn, isLoaded: clerkLoaded } = useAuth();
  const isSignedIn = clerkSignedIn ?? false;

  // Vow analysis — shared between TiptapEditor and SuggestionsCard
  const [vowAnalysis, setVowAnalysis] = useState<VowAnalysis | null>(null);

  // Editor bridge — guide panel uses this to insert content
  const insertHTMLRef = useRef<(html: string, opts?: { replace?: boolean }) => void>(() => {});
  const setInsertHTML = useCallback(
    (fn: (html: string, opts?: { replace?: boolean }) => void) => {
      insertHTMLRef.current = fn;
    },
    [],
  );
  const insertHTML = useCallback(
    (html: string, opts?: { replace?: boolean }) => insertHTMLRef.current(html, opts),
    [],
  );

  // ── Convex hooks (always called — skipped when signed out) ────────────
  const convexDraftsRaw = useQuery(api.drafts.list, isSignedIn ? {} : "skip");
  const convexCreate = useMutation(api.drafts.create);
  const convexUpdate = useMutation(api.drafts.update);
  const convexRename = useMutation(api.drafts.rename);
  const convexRemove = useMutation(api.drafts.remove);
  const convexMigrate = useMutation(api.drafts.migrateFromLocal);

  // Entitlement query (Phase 4 stub — returns false until Polar webhook writes entitlements)
  const convexHasPaid = useQuery(api.entitlements.hasPaid, isSignedIn ? {} : "skip");
  const hasPaidEntitlement = convexHasPaid ?? state.hasPaidEntitlement;

  // Normalize Convex docs to Draft shape (memoized)
  const convexDrafts = useMemo(
    () => convexDraftsRaw?.map(convexToDraft) ?? null,
    [convexDraftsRaw],
  );

  // ── Derived state: drafts source depends on auth ──────────────────────
  // Signed in  → Convex is source of truth
  // Signed out → local reducer state is source of truth
  const drafts = isSignedIn ? (convexDrafts ?? []) : state.drafts;
  const isLoaded = isSignedIn ? convexDrafts !== null : state.isLoaded;

  // Override state exposed to consumers so they always see the right data
  const contextState: WorkspaceState = useMemo(
    () => ({ ...state, drafts, isLoaded, hasPaidEntitlement }),
    [state, drafts, isLoaded, hasPaidEntitlement],
  );

  const activeDraft = useMemo(
    () => drafts.find((d) => d.id === state.activeDraftId) ?? null,
    [drafts, state.activeDraftId],
  );

  // Refs for one-time effects
  const migrationDone = useRef(false);
  const autoCreateDone = useRef(false);

  // ── Load local drafts on mount (anonymous users only) ─────────────────
  // IMPORTANT: Wait for Clerk to finish loading before running this.
  // Otherwise isSignedIn starts as false during Clerk init, we create a
  // phantom local draft, and migration immediately ships it to Convex.

  useEffect(() => {
    if (!clerkLoaded) return;  // Wait for Clerk to determine auth state
    if (isSignedIn) return;    // Signed in → Convex handles drafts

    async function loadDrafts() {
      let localDrafts = await draftStore.getAll();
      let activeId = draftStore.getActiveDraftId();

      if (localDrafts.length === 0) {
        const first = createEmptyDraft();
        await draftStore.save(first);
        localDrafts = [first];
        activeId = first.id;
        draftStore.setActiveDraftId(first.id);
      }

      if (!activeId || !localDrafts.find((d) => d.id === activeId)) {
        activeId = localDrafts[0].id;
        draftStore.setActiveDraftId(activeId);
      }

      dispatch({
        type: "DRAFTS_LOADED",
        drafts: localDrafts,
        activeDraftId: activeId,
      });
    }

    loadDrafts();
  }, [clerkLoaded, isSignedIn]);

  // ── Migrate local drafts to Convex on sign-in ─────────────────────────
  // Handles both: fresh sign-in during session AND page reload while signed in
  // (orphaned local drafts from a previous anonymous session).

  useEffect(() => {
    if (!clerkLoaded || !isSignedIn) return;
    if (migrationDone.current) return;
    migrationDone.current = true;

    (async () => {
      const localDrafts = await draftStore.getAll();
      if (localDrafts.length > 0) {
        try {
          await convexMigrate({
            drafts: localDrafts.map((d) => ({
              localId: d.id,
              title: d.title,
              body: d.tiptapJSON ?? undefined,
              createdAt: d.createdAt,
              updatedAt: d.updatedAt,
            })),
          });
        } catch (err) {
          // Migration failed — drafts stay local. Non-fatal.
          console.error("Draft migration failed:", err);
        }

        // Clear local store (server is now source of truth)
        for (const d of localDrafts) {
          await draftStore.delete(d.id);
        }
      }

      // Handle pending action from auth gate flow
      const pending = consumePendingAction();
      if (pending) {
        track({ event: "signup_completed_from_gate", gate: pending.type });
        if (pending.type === "CREATE_DRAFT") {
          try {
            const newId = await convexCreate({ title: "Untitled" });
            draftStore.setActiveDraftId(newId as string);
            dispatch({ type: "DRAFT_SWITCHED", id: newId as string });
            track({ event: "draft_created" });
          } catch {
            // Non-fatal
          }
        }
      }
    })();
  }, [clerkLoaded, isSignedIn, convexMigrate, convexCreate]);

  // ── Keep activeDraftId in sync with available drafts ──────────────────
  // On mount / refresh, try restoring from sessionStorage first so the
  // user lands on the same draft they were editing.

  useEffect(() => {
    if (!isLoaded || drafts.length === 0) return;

    // Already have a valid active draft — nothing to do
    if (state.activeDraftId && drafts.find((d) => d.id === state.activeDraftId)) return;

    // Try restoring from sessionStorage (survives page refresh)
    const savedId = draftStore.getActiveDraftId();
    if (savedId && drafts.find((d) => d.id === savedId)) {
      dispatch({ type: "DRAFT_SWITCHED", id: savedId });
      return;
    }

    // Fallback: pick the first draft
    const id = drafts[0].id;
    draftStore.setActiveDraftId(id);
    dispatch({ type: "DRAFT_SWITCHED", id });
  }, [drafts, isLoaded, state.activeDraftId]);

  // ── Auto-create first draft for signed-in user with no drafts ─────────

  useEffect(() => {
    if (!isSignedIn || convexDrafts === null || autoCreateDone.current) return;
    if (convexDrafts.length > 0) return;

    autoCreateDone.current = true;
    (async () => {
      try {
        const id = await convexCreate({ title: "Untitled" });
        draftStore.setActiveDraftId(id as string);
        dispatch({ type: "DRAFT_SWITCHED", id: id as string });
      } catch {
        // Non-fatal — query will pick up any server-side changes
      }
    })();
  }, [isSignedIn, convexDrafts, convexCreate]);

  // ── Draft Actions (dual-store: Convex when signed in, local otherwise) ─

  const createDraftInternal = useCallback(async () => {
    if (isSignedIn) {
      const id = await convexCreate({ title: "Untitled" });
      draftStore.setActiveDraftId(id as string);
      dispatch({ type: "DRAFT_SWITCHED", id: id as string });
    } else {
      const draft = createEmptyDraft();
      await draftStore.save(draft);
      draftStore.setActiveDraftId(draft.id);
      dispatch({ type: "DRAFT_CREATED", draft });
    }
    track({ event: "draft_created" });
  }, [isSignedIn, convexCreate]);

  const createDraft = useCallback(() => {
    track({ event: "new_draft_clicked" });

    const result = checkGate("CREATE_DRAFT", {
      isSignedIn,
      hasPaidEntitlement,
      currentDraftCount: drafts.length,
    });

    if (!result.allowed) {
      if (result.reason === "NEEDS_ACCOUNT") {
        track({ event: "new_draft_blocked_free_limit" });
        setPendingAction({
          type: "CREATE_DRAFT",
          returnUrl: window.location.href,
        });
        dispatch({ type: "SHOW_AUTH_MODAL", show: true });
      } else {
        track({ event: "new_draft_blocked_free_limit" });
        dispatch({ type: "SHOW_UPGRADE_CARD", show: true });
      }
      return;
    }

    createDraftInternal();
  }, [isSignedIn, hasPaidEntitlement, drafts.length, createDraftInternal]);

  const switchDraft = useCallback(
    (id: string) => {
      if (id === state.activeDraftId) return;
      draftStore.setActiveDraftId(id);
      dispatch({ type: "DRAFT_SWITCHED", id });
      track({ event: "draft_switched" });
    },
    [state.activeDraftId],
  );

  const updateActiveDraftContent = useCallback(
    (tiptapJSON: Record<string, unknown>) => {
      if (!state.activeDraftId) return;

      dispatch({ type: "SET_SAVE_STATUS", status: "saving" });

      if (isSignedIn) {
        // Convex path: mutation → reactive query updates automatically
        convexUpdate({
          id: state.activeDraftId as unknown as Id<"drafts">,
          body: tiptapJSON,
        })
          .then(() => {
            dispatch({ type: "SET_SAVE_STATUS", status: "saved" });
            setTimeout(() => dispatch({ type: "SET_SAVE_STATUS", status: "idle" }), 2000);
          })
          .catch(() => {
            dispatch({ type: "SET_SAVE_STATUS", status: "idle" });
          });
      } else {
        // Local path: update reducer + persist to IndexedDB
        const existing = state.drafts.find((d) => d.id === state.activeDraftId);
        if (!existing) return;

        const updated: Draft = {
          ...existing,
          tiptapJSON,
          updatedAt: Date.now(),
        };

        dispatch({ type: "DRAFT_UPDATED", draft: updated });
        draftStore.save(updated).then(() => {
          dispatch({ type: "SET_SAVE_STATUS", status: "saved" });
          setTimeout(() => dispatch({ type: "SET_SAVE_STATUS", status: "idle" }), 2000);
        });
      }
    },
    [state.activeDraftId, state.drafts, isSignedIn, convexUpdate],
  );

  const renameDraft = useCallback(
    async (id: string, title: string) => {
      if (isSignedIn) {
        await convexRename({ id: id as unknown as Id<"drafts">, title });
      } else {
        const draft = state.drafts.find((d) => d.id === id);
        if (!draft) return;

        const updated = { ...draft, title, updatedAt: Date.now() };
        dispatch({ type: "DRAFT_RENAMED", id, title });
        await draftStore.save(updated);
      }
    },
    [state.drafts, isSignedIn, convexRename],
  );

  const deleteDraft = useCallback(
    async (id: string) => {
      if (isSignedIn) {
        await convexRemove({ id: id as unknown as Id<"drafts"> });

        // Pick new active draft from current list
        const remaining = drafts.filter((d) => d.id !== id);
        let newActiveId: string | null = null;

        if (remaining.length > 0) {
          newActiveId =
            state.activeDraftId === id ? remaining[0].id : state.activeDraftId;
        } else {
          // Deleted the last draft — create a fresh one
          const freshId = await convexCreate({ title: "Untitled" });
          newActiveId = freshId as string;
        }

        if (newActiveId) {
          draftStore.setActiveDraftId(newActiveId);
          dispatch({ type: "DRAFT_SWITCHED", id: newActiveId });
        }
      } else {
        await draftStore.delete(id);
        const remaining = state.drafts.filter((d) => d.id !== id);

        let newActiveId: string | null = null;
        if (remaining.length > 0) {
          newActiveId =
            state.activeDraftId === id ? remaining[0].id : state.activeDraftId;
        } else {
          const fresh = createEmptyDraft();
          await draftStore.save(fresh);
          remaining.push(fresh);
          newActiveId = fresh.id;
        }

        if (newActiveId) draftStore.setActiveDraftId(newActiveId);
        dispatch({ type: "DRAFT_DELETED", id, newActiveId });
      }

      track({ event: "draft_deleted" });
    },
    [state.drafts, state.activeDraftId, drafts, isSignedIn, convexRemove, convexCreate],
  );

  // ── Gated Action Check ─────────────────────────────────────────────────

  const requestAction = useCallback(
    (action: GatedAction): GateResult => {
      const result = checkGate(action, {
        isSignedIn,
        hasPaidEntitlement,
        currentDraftCount: drafts.length,
      });

      if (!result.allowed) {
        if (result.reason === "NEEDS_ACCOUNT") {
          setPendingAction({
            type: action,
            returnUrl: window.location.href,
          });
          track({ event: "signup_started_from_gate", gate: action });
          dispatch({ type: "SHOW_AUTH_MODAL", show: true });
        } else if (result.reason === "NEEDS_UPGRADE") {
          track({ event: "paywall_viewed", trigger: action });
          dispatch({ type: "SHOW_PAYWALL_MODAL", show: true, trigger: action });
        }
      }

      return result;
    },
    [isSignedIn, hasPaidEntitlement, drafts.length],
  );

  // ── Modal Controls ──────────────────────────────────────────────────────

  const setShowAuthModal = useCallback(
    (show: boolean) => dispatch({ type: "SHOW_AUTH_MODAL", show }),
    [],
  );

  const setShowPaywallModal = useCallback(
    (show: boolean, trigger?: string) =>
      dispatch({ type: "SHOW_PAYWALL_MODAL", show, trigger }),
    [],
  );

  const setShowUpgradeCard = useCallback(
    (show: boolean) => dispatch({ type: "SHOW_UPGRADE_CARD", show }),
    [],
  );

  const setPaidEntitlement = useCallback(
    (value: boolean) => dispatch({ type: "SET_PAID_ENTITLEMENT", value }),
    [],
  );

  // ── Context Value ──────────────────────────────────────────────────────

  const value: WorkspaceContextValue = {
    state: contextState,
    activeDraft,
    isSignedIn,
    createDraft,
    switchDraft,
    updateActiveDraftContent,
    renameDraft,
    deleteDraft,
    requestAction,
    setShowAuthModal,
    setShowPaywallModal,
    setShowUpgradeCard,
    setPaidEntitlement,
    vowAnalysis,
    setVowAnalysis,
    insertHTML,
    setInsertHTML,
  };

  return (
    <WorkspaceContext.Provider value={value}>
      {children}
    </WorkspaceContext.Provider>
  );
}

// ─── Hook ────────────────────────────────────────────────────────────────────

export function useWorkspace(): WorkspaceContextValue {
  const ctx = useContext(WorkspaceContext);
  if (!ctx) {
    throw new Error("useWorkspace must be used within a WorkspaceProvider");
  }
  return ctx;
}
