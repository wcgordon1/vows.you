"use client";

import { useRouter } from "next/navigation";
import { useWorkspace } from "../hooks/use-workspace";
import { PracticeMode } from "../components/practice-mode";
import { type TiptapJSON } from "../lib/vow-utils";

export default function PracticePage() {
  const router = useRouter();
  const { activeDraft, state } = useWorkspace();

  // Wait for drafts to load
  if (!state.isLoaded) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <p className="text-sm text-base-400">Loading…</p>
      </div>
    );
  }

  // If no content, redirect back to workspace
  if (!activeDraft?.tiptapJSON) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-4">
        <p className="text-lg font-serif text-base-500">
          Write your vows first, then come back to practice.
        </p>
        <button
          onClick={() => router.push("/workspace")}
          className="rounded-full bg-accent-500 px-6 py-2 text-sm font-medium text-white transition-colors hover:bg-accent-600"
        >
          Go to Editor
        </button>
      </div>
    );
  }

  return (
    <PracticeMode
      tiptapJSON={activeDraft.tiptapJSON as unknown as TiptapJSON}
      onClose={() => router.push("/workspace")}
    />
  );
}
