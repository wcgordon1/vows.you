/**
 * Length and read time utilities for vow generation.
 */

/** Speaking pace for wedding vows (words per minute) */
const SPEAKING_WPM = 140

/**
 * Count words in text
 */
export function countWords(text: string): number {
	if (!text || !text.trim()) return 0
	return text.trim().split(/\s+/).length
}

/**
 * Get read time in seconds at speaking pace (140 WPM)
 */
export function getReadTimeSeconds(wordCount: number): number {
	return Math.round((wordCount / SPEAKING_WPM) * 60)
}

/**
 * Format read time as mm:ss
 */
export function formatReadTime(seconds: number): string {
	const mins = Math.floor(seconds / 60)
	const secs = seconds % 60
	return `${mins}:${secs.toString().padStart(2, '0')}`
}

/**
 * Get length status for UI display
 */
export function getLengthStatus(wordCount: number): {
	status: 'too-short' | 'ideal' | 'too-long'
	message: string
} {
	if (wordCount < 200) {
		return {
			status: 'too-short',
			message: 'A bit short — consider adding more personal details.',
		}
	}
	if (wordCount <= 350) {
		return {
			status: 'ideal',
			message: 'Perfect length for a ceremony reading.',
		}
	}
	return {
		status: 'too-long',
		message: 'May be too long for one page — consider trimming.',
	}
}

/**
 * Check if text will fit on one PDF page
 * Approximate: ~400 words at 12pt font with standard margins
 */
export function willFitOnePage(wordCount: number): boolean {
	return wordCount <= 400
}

/**
 * Target word count range
 */
export const TARGET_WORD_COUNT = {
	min: 280,
	ideal: 300,
	max: 320,
	absoluteMax: 400, // For PDF single page
}
