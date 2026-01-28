/**
 * Vow phrase matcher with overlap resolution.
 *
 * ALGORITHM:
 * 1. Collect all candidate matches from all lexicon patterns
 * 2. For each match, evaluate conditional rules (if any)
 * 3. Filter out matches that don't pass conditional rules
 * 4. Resolve overlaps using longest-match-first:
 *    - For candidates at same start position: keep longest (tie → higher weight)
 *    - Sort by start ASC, then length DESC, then weight DESC
 *    - Greedy accept: if candidate.start >= cursor, accept and set cursor = candidate.end
 * 5. Return final non-overlapping spans
 */

import type { VowMatchSpan, AnalysisMode } from './types'
import { vowLexicon } from './lexicon'
import { detectSpecificityNearby } from './heuristics'

/**
 * Internal candidate match before overlap resolution.
 */
interface MatchCandidate {
	start: number
	end: number
	text: string
	phraseKey: string
	category: VowMatchSpan['category']
	severityWeight: VowMatchSpan['severityWeight']
	why: string
	suggestions: string[]
	proofPrompts: string[]
	length: number
}

/**
 * Find all weak/cliché phrase matches in the given text.
 *
 * @param text - The input text to analyze
 * @param mode - Analysis mode (vows is stricter, speech is more forgiving)
 * @returns Array of non-overlapping weak match spans
 */
export function findWeakSpans(text: string, _mode: AnalysisMode): VowMatchSpan[] {
	if (!text.trim()) {
		return []
	}

	// Step 1: Collect all candidate matches
	const candidates: MatchCandidate[] = []

	for (const item of vowLexicon) {
		for (const pattern of item.patterns) {
			// Reset lastIndex for global patterns
			pattern.lastIndex = 0

			let match: RegExpExecArray | null
			while ((match = pattern.exec(text)) !== null) {
				const start = match.index
				const end = match.index + match[0].length
				const matchText = match[0]

				candidates.push({
					start,
					end,
					text: matchText,
					phraseKey: item.key,
					category: item.category,
					severityWeight: item.weight,
					why: item.why,
					suggestions: item.suggestions,
					proofPrompts: item.proofPrompts,
					length: matchText.length,
				})

				// Prevent infinite loop for zero-length matches
				if (match[0].length === 0) {
					pattern.lastIndex++
				}
			}
		}
	}

	// Step 2: Evaluate conditional rules and filter
	const filteredCandidates = candidates.filter((candidate) => {
		const lexiconItem = vowLexicon.find((item) => item.key === candidate.phraseKey)
		if (!lexiconItem || !lexiconItem.conditionalRule) {
			// No conditional rule, keep the match
			return true
		}

		const rule = lexiconItem.conditionalRule
		const windowChars = rule.windowChars ?? 100

		switch (rule.type) {
			case 'requires-no-specificity':
				// Only flag if there's NO specificity nearby
				return !detectSpecificityNearby(text, candidate.start, candidate.end, windowChars)

			default:
				return true
		}
	})

	// Step 3: Resolve overlaps - longest match first
	const resolved = resolveOverlaps(filteredCandidates)

	// Step 4: Convert to VowMatchSpan
	return resolved.map((candidate) => ({
		start: candidate.start,
		end: candidate.end,
		text: candidate.text,
		phraseKey: candidate.phraseKey,
		category: candidate.category,
		severityWeight: candidate.severityWeight,
		why: candidate.why,
		suggestions: candidate.suggestions,
		proofPrompts: candidate.proofPrompts,
	}))
}

/**
 * Resolve overlapping matches using longest-match-first strategy.
 *
 * Algorithm:
 * 1. Group candidates by start position
 * 2. For each group, keep only the longest (ties → higher weight)
 * 3. Sort remaining by start ASC, then length DESC, then weight DESC
 * 4. Greedy accept: accept if start >= cursor, update cursor to end
 */
function resolveOverlaps(candidates: MatchCandidate[]): MatchCandidate[] {
	if (candidates.length === 0) {
		return []
	}

	// Group by start position and keep longest (or highest weight if tied)
	const byStart = new Map<number, MatchCandidate>()

	for (const candidate of candidates) {
		const existing = byStart.get(candidate.start)
		if (!existing) {
			byStart.set(candidate.start, candidate)
		} else if (
			candidate.length > existing.length ||
			(candidate.length === existing.length && candidate.severityWeight > existing.severityWeight)
		) {
			byStart.set(candidate.start, candidate)
		}
	}

	// Get remaining candidates and sort
	const remaining = Array.from(byStart.values())
	remaining.sort((a, b) => {
		// Sort by start position ascending
		if (a.start !== b.start) {
			return a.start - b.start
		}
		// Then by length descending
		if (a.length !== b.length) {
			return b.length - a.length
		}
		// Then by weight descending
		return b.severityWeight - a.severityWeight
	})

	// Greedy accept non-overlapping matches
	const result: MatchCandidate[] = []
	let cursor = 0

	for (const candidate of remaining) {
		if (candidate.start >= cursor) {
			result.push(candidate)
			cursor = candidate.end
		}
	}

	return result
}

/**
 * Get match statistics for a list of spans.
 */
export function getMatchStats(spans: VowMatchSpan[]): {
	totalMatches: number
	uniquePhrases: number
	byCategory: Map<string, number>
	byPhrase: Map<string, { count: number; span: VowMatchSpan }>
	totalSeverityScore: number
} {
	const byCategory = new Map<string, number>()
	const byPhrase = new Map<string, { count: number; span: VowMatchSpan }>()
	let totalSeverityScore = 0

	for (const span of spans) {
		// Count by category
		const categoryCount = byCategory.get(span.category) ?? 0
		byCategory.set(span.category, categoryCount + 1)

		// Count by phrase key
		const existing = byPhrase.get(span.phraseKey)
		if (existing) {
			existing.count++
		} else {
			byPhrase.set(span.phraseKey, { count: 1, span })
		}

		// Sum severity scores
		totalSeverityScore += span.severityWeight
	}

	return {
		totalMatches: spans.length,
		uniquePhrases: byPhrase.size,
		byCategory,
		byPhrase,
		totalSeverityScore,
	}
}
