/**
 * localStorage-based draft storage for vow templates.
 */

import type { SavedDraft, VowFormAnswers, TemplateVariant, VowTone } from './types'

const STORAGE_KEY = 'vowTemplate_drafts'
const ANSWERS_KEY = 'vowTemplate_currentAnswers'
const STEP_KEY = 'vowTemplate_currentStep'
const MAX_DRAFTS = 20

/**
 * Get all saved drafts from localStorage
 */
export function getDrafts(): SavedDraft[] {
	if (typeof window === 'undefined') return []
	try {
		const stored = localStorage.getItem(STORAGE_KEY)
		if (!stored) return []
		const drafts = JSON.parse(stored) as SavedDraft[]
		// Sort by savedAt descending (newest first)
		return drafts.sort(
			(a, b) => new Date(b.savedAt).getTime() - new Date(a.savedAt).getTime()
		)
	} catch {
		return []
	}
}

/**
 * Save a new draft to localStorage
 */
export function saveDraft(
	answers: VowFormAnswers,
	vowText: string,
	wordCount: number,
	seed: number
): SavedDraft {
	const draft: SavedDraft = {
		id: `draft_${Date.now()}`,
		savedAt: new Date().toISOString(),
		answers,
		vowText,
		wordCount,
		seed,
		tone: answers.tone,
		variant: answers.variant,
	}

	const drafts = getDrafts()
	drafts.unshift(draft)

	// Keep only the latest MAX_DRAFTS
	const trimmed = drafts.slice(0, MAX_DRAFTS)

	try {
		localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed))
	} catch {
		// Storage full or unavailable - silently fail
	}

	return draft
}

/**
 * Delete a specific draft by ID
 */
export function deleteDraft(id: string): void {
	const drafts = getDrafts().filter((d) => d.id !== id)
	try {
		localStorage.setItem(STORAGE_KEY, JSON.stringify(drafts))
	} catch {
		// Silently fail
	}
}

/**
 * Clear all saved drafts
 */
export function clearAllDrafts(): void {
	try {
		localStorage.removeItem(STORAGE_KEY)
	} catch {
		// Silently fail
	}
}

/**
 * Save current form answers (for persistence across page reloads)
 */
export function saveCurrentAnswers(answers: VowFormAnswers): void {
	try {
		localStorage.setItem(ANSWERS_KEY, JSON.stringify(answers))
	} catch {
		// Silently fail
	}
}

/**
 * Load current form answers from localStorage
 */
export function loadCurrentAnswers(): VowFormAnswers | null {
	if (typeof window === 'undefined') return null
	try {
		const stored = localStorage.getItem(ANSWERS_KEY)
		if (!stored) return null
		return JSON.parse(stored) as VowFormAnswers
	} catch {
		return null
	}
}

/**
 * Clear current form answers
 */
export function clearCurrentAnswers(): void {
	try {
		localStorage.removeItem(ANSWERS_KEY)
	} catch {
		// Silently fail
	}
}

/**
 * Save current step
 */
export function saveCurrentStep(step: number): void {
	try {
		localStorage.setItem(STEP_KEY, String(step))
	} catch {
		// Silently fail
	}
}

/**
 * Load current step
 */
export function loadCurrentStep(): number {
	if (typeof window === 'undefined') return 0
	try {
		const stored = localStorage.getItem(STEP_KEY)
		if (!stored) return 0
		return parseInt(stored, 10) || 0
	} catch {
		return 0
	}
}

/**
 * Clear current step
 */
export function clearCurrentStep(): void {
	try {
		localStorage.removeItem(STEP_KEY)
	} catch {
		// Silently fail
	}
}

/**
 * Format a date for display (e.g., "Jan 15, 2:30 PM")
 */
export function formatDraftDate(isoString: string): string {
	const date = new Date(isoString)
	return date.toLocaleDateString('en-US', {
		month: 'short',
		day: 'numeric',
		hour: 'numeric',
		minute: '2-digit',
	})
}

/**
 * Get display label for tone
 */
export function getToneLabel(tone: VowTone): string {
	const labels: Record<VowTone, string> = {
		heartfelt: 'Heartfelt',
		'modern-minimal': 'Modern',
		'funny-light': 'Funny',
	}
	return labels[tone] || tone
}

/**
 * Get display label for variant
 */
export function getVariantLabel(variant: TemplateVariant): string {
	const labels: Record<TemplateVariant, string> = {
		'for-her': 'For Her',
		'for-him': 'For Him',
	}
	return labels[variant] || variant
}
