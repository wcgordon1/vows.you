"use client";

import {
  createContext,
  useContext,
  useCallback,
  useEffect,
  useReducer,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useAuth } from "@clerk/nextjs";
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
  // Entitlement (mock for now)
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
  const { isSignedIn: clerkSignedIn } = useAuth();
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

  // Track previous auth state to detect sign-in completion
  const prevSignedIn = useRef(isSignedIn);

  const activeDraft =
    state.drafts.find((d) => d.id === state.activeDraftId) ?? null;

  // ── Load drafts from store on mount ─────────────────────────────────────

  useEffect(() => {
    async function loadDrafts() {
      let drafts = await draftStore.getAll();
      let activeId = draftStore.getActiveDraftId();

      // If no drafts exist, create the first one
      if (drafts.length === 0) {
        const first = createEmptyDraft();
        await draftStore.save(first);
        drafts = [first];
        activeId = first.id;
        draftStore.setActiveDraftId(first.id);
      }

      // Ensure activeId points to a valid draft
      if (!activeId || !drafts.find((d) => d.id === activeId)) {
        activeId = drafts[0].id;
        draftStore.setActiveDraftId(activeId);
      }

      dispatch({
        type: "DRAFTS_LOADED",
        drafts,
        activeDraftId: activeId,
      });
    }

    loadDrafts();
  }, []);

  // ── Detect sign-in completion and consume pending action ────────────────

  useEffect(() => {
    if (!prevSignedIn.current && isSignedIn) {
      // User just signed in — consume pending action
      const pending = consumePendingAction();
      if (pending) {
        track({ event: "signup_completed_from_gate", gate: pending.type });
        // Re-execute the gated action now that user is signed in
        // Use a microtask so state has settled
        queueMicrotask(() => {
          if (pending.type === "CREATE_DRAFT") {
            createDraftInternal();
          }
          // Other actions (EXPORT_PDF, etc.) will be re-triggered by UI
        });
      }
    }
    prevSignedIn.current = isSignedIn;
  }, [isSignedIn]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Draft Actions ───────────────────────────────────────────────────────

  const createDraftInternal = useCallback(async () => {
    const draft = createEmptyDraft();
    await draftStore.save(draft);
    draftStore.setActiveDraftId(draft.id);
    dispatch({ type: "DRAFT_CREATED", draft });
    track({ event: "draft_created" });
  }, []);

  const createDraft = useCallback(() => {
    track({ event: "new_draft_clicked" });

    const result = checkGate("CREATE_DRAFT", {
      isSignedIn,
      hasPaidEntitlement: state.hasPaidEntitlement,
      currentDraftCount: state.drafts.length,
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
  }, [isSignedIn, state.hasPaidEntitlement, state.drafts.length, createDraftInternal]);

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

      const existing = state.drafts.find((d) => d.id === state.activeDraftId);
      if (!existing) return;

      const updated: Draft = {
        ...existing,
        tiptapJSON,
        updatedAt: Date.now(),
      };

      dispatch({ type: "DRAFT_UPDATED", draft: updated });

      // Persist to store (fire and forget — autosave handles debounce)
      dispatch({ type: "SET_SAVE_STATUS", status: "saving" });
      draftStore.save(updated).then(() => {
        dispatch({ type: "SET_SAVE_STATUS", status: "saved" });
        setTimeout(() => {
          dispatch({ type: "SET_SAVE_STATUS", status: "idle" });
        }, 2000);
      });
    },
    [state.activeDraftId, state.drafts],
  );

  const renameDraft = useCallback(
    async (id: string, title: string) => {
      const draft = state.drafts.find((d) => d.id === id);
      if (!draft) return;

      const updated = { ...draft, title, updatedAt: Date.now() };
      dispatch({ type: "DRAFT_RENAMED", id, title });
      await draftStore.save(updated);
    },
    [state.drafts],
  );

  const deleteDraft = useCallback(
    async (id: string) => {
      await draftStore.delete(id);
      const remaining = state.drafts.filter((d) => d.id !== id);

      let newActiveId: string | null = null;
      if (remaining.length > 0) {
        // Switch to another draft
        newActiveId =
          state.activeDraftId === id ? remaining[0].id : state.activeDraftId;
      } else {
        // Deleted the last draft — create a fresh one
        const fresh = createEmptyDraft();
        await draftStore.save(fresh);
        remaining.push(fresh);
        newActiveId = fresh.id;
      }

      if (newActiveId) draftStore.setActiveDraftId(newActiveId);
      dispatch({ type: "DRAFT_DELETED", id, newActiveId });
      track({ event: "draft_deleted" });
    },
    [state.drafts, state.activeDraftId],
  );

  // ── Gated Action Check ─────────────────────────────────────────────────

  const requestAction = useCallback(
    (action: GatedAction): GateResult => {
      const result = checkGate(action, {
        isSignedIn,
        hasPaidEntitlement: state.hasPaidEntitlement,
        currentDraftCount: state.drafts.length,
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
    [isSignedIn, state.hasPaidEntitlement, state.drafts.length],
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
    state,
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
