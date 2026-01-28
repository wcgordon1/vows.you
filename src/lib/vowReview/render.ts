/**
 * Rendering utilities for wedding vow review.
 * Implements whitespace-preserving span highlighting using a cursor strategy.
 */

import type { VowMatchSpan, SeverityWeight } from './types'

export interface Segment {
	text: string
	type: 'raw' | 'weak'
	span?: VowMatchSpan
}

/**
 * Build segments from original text and weak match spans.
 * Uses a cursor strategy to preserve all whitespace, punctuation, and line breaks.
 *
 * Strategy:
 * 1. Sort spans by start position
 * 2. Start cursor at position 0
 * 3. For each span, append raw text between cursor and span start
 * 4. Append weak segment with span data
 * 5. Move cursor to span end
 * 6. Append trailing text after all spans
 *
 * Guarantee: segments.map(s => s.text).join('') === originalText
 */
export function buildSegments(originalText: string, spans: VowMatchSpan[]): Segment[] {
	if (!originalText) {
		return []
	}

	if (!spans || spans.length === 0) {
		return [{ text: originalText, type: 'raw' }]
	}

	// Sort spans by start position (should already be sorted, but be safe)
	const sortedSpans = [...spans].sort((a, b) => a.start - b.start)

	const segments: Segment[] = []
	let cursor = 0

	for (const span of sortedSpans) {
		// Skip invalid spans
		if (span.start < cursor || span.end > originalText.length) {
			continue
		}

		// Append raw text between cursor and span start
		if (span.start > cursor) {
			segments.push({
				text: originalText.slice(cursor, span.start),
				type: 'raw',
			})
		}

		// Append weak segment
		segments.push({
			text: originalText.slice(span.start, span.end),
			type: 'weak',
			span,
		})

		// Move cursor
		cursor = span.end
	}

	// Append trailing text
	if (cursor < originalText.length) {
		segments.push({
			text: originalText.slice(cursor),
			type: 'raw',
		})
	}

	return segments
}

/**
 * Get CSS class for a severity weight.
 */
function getWeightClass(weight: SeverityWeight): string {
	switch (weight) {
		case 3:
			return 'weak--high'
		case 2:
			return 'weak--med'
		case 1:
		default:
			return 'weak--low'
	}
}

/**
 * Convert segments to a DocumentFragment for efficient DOM insertion.
 * Uses Text nodes for raw segments and mark elements for weak segments.
 */
export function segmentsToFragment(segments: Segment[]): DocumentFragment {
	const fragment = document.createDocumentFragment()

	for (const segment of segments) {
		if (segment.type === 'raw') {
			fragment.appendChild(document.createTextNode(segment.text))
		} else if (segment.span) {
			const mark = document.createElement('mark')
			mark.className = `weak-phrase ${getWeightClass(segment.span.severityWeight)}`
			mark.textContent = segment.text

			// Add data attributes for interactions
			mark.dataset.phraseKey = segment.span.phraseKey
			mark.dataset.start = String(segment.span.start)
			mark.dataset.end = String(segment.span.end)
			mark.dataset.weight = String(segment.span.severityWeight)
			mark.dataset.category = segment.span.category

			// Store suggestions and prompts as JSON for tooltip/panel access
			mark.dataset.why = segment.span.why
			mark.dataset.suggestions = JSON.stringify(segment.span.suggestions)
			mark.dataset.proofPrompts = JSON.stringify(segment.span.proofPrompts)

			// Accessibility
			mark.setAttribute('role', 'button')
			mark.setAttribute('tabindex', '0')
			mark.setAttribute('aria-label', `Cliché phrase: ${segment.text}. Click for suggestions.`)

			fragment.appendChild(mark)
		}
	}

	return fragment
}

/**
 * Render text with highlighted weak phrases.
 * Returns a DocumentFragment ready for DOM insertion.
 */
export function renderHighlightedText(text: string, spans: VowMatchSpan[]): DocumentFragment {
	const segments = buildSegments(text, spans)
	return segmentsToFragment(segments)
}

/**
 * Verify that segments perfectly reconstruct the original text.
 */
export function verifySegments(originalText: string, segments: Segment[]): boolean {
	const reconstructed = segments.map((s) => s.text).join('')
	return reconstructed === originalText
}
