/**
 * Heuristics for context-aware vow phrase detection.
 * These functions help determine if a match should be flagged based on context.
 */

/**
 * Concrete nouns that indicate specificity in wedding vows.
 * If these appear near a vague phrase, it adds some specificity.
 */
export const concreteNounsList = [
	// Places
	'kitchen', 'apartment', 'hospital', 'airport', 'beach', 'park', 'restaurant',
	'hotel', 'church', 'house', 'home', 'room', 'car', 'train', 'plane', 'bus',
	'coffee', 'shop', 'store', 'office', 'garden', 'yard', 'driveway', 'porch',
	'balcony', 'roof', 'basement', 'attic', 'garage', 'street', 'road', 'highway',
	'bridge', 'river', 'lake', 'ocean', 'mountain', 'hill', 'forest', 'desert',
	'island', 'city', 'town', 'village', 'country', 'state', 'coast', 'shore',
	// Objects
	'ring', 'letter', 'photo', 'picture', 'book', 'song', 'movie', 'phone', 'text',
	'message', 'email', 'card', 'gift', 'flower', 'rose', 'candle', 'blanket',
	'pillow', 'bed', 'couch', 'sofa', 'chair', 'table', 'desk', 'lamp', 'door',
	'window', 'mirror', 'clock', 'watch', 'key', 'wallet', 'bag', 'suitcase',
	// Animals
	'dog', 'cat', 'pet', 'puppy', 'kitten', 'bird', 'fish', 'horse',
	// People/relationships
	'mom', 'dad', 'mother', 'father', 'sister', 'brother', 'grandma', 'grandpa',
	'grandmother', 'grandfather', 'aunt', 'uncle', 'cousin', 'friend', 'buddy',
	'roommate', 'neighbor', 'boss', 'coworker', 'colleague', 'teacher', 'doctor',
	// Events
	'wedding', 'birthday', 'anniversary', 'christmas', 'thanksgiving', 'easter',
	'graduation', 'funeral', 'party', 'concert', 'game', 'trip', 'vacation',
	'honeymoon', 'date', 'dinner', 'lunch', 'breakfast', 'brunch',
	// Food/drink
	'pizza', 'pasta', 'sushi', 'tacos', 'burger', 'sandwich', 'salad', 'soup',
	'cake', 'ice cream', 'chocolate', 'wine', 'beer', 'tea', 'juice',
]

/**
 * Month names for date detection.
 */
const monthNames = [
	'january', 'february', 'march', 'april', 'may', 'june',
	'july', 'august', 'september', 'october', 'november', 'december',
	'jan', 'feb', 'mar', 'apr', 'jun', 'jul', 'aug', 'sep', 'sept', 'oct', 'nov', 'dec',
]

/**
 * Day names for date detection.
 */
const dayNames = [
	'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday',
	'mon', 'tue', 'tues', 'wed', 'thu', 'thur', 'thurs', 'fri', 'sat', 'sun',
]

/**
 * Common intensifiers that may indicate vague writing when overused.
 */
const intensifierWords = [
	'really', 'very', 'so', 'truly', 'deeply', 'completely', 'totally',
	'absolutely', 'utterly', 'incredibly', 'amazingly', 'literally',
	'super', 'extremely', 'infinitely', 'endlessly', 'forever',
]

/**
 * Common words to exclude from proper noun detection.
 */
const commonWords = new Set([
	'i', 'you', 'we', 'he', 'she', 'it', 'they', 'me', 'him', 'her', 'us', 'them',
	'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of',
	'with', 'by', 'from', 'as', 'is', 'was', 'are', 'were', 'been', 'be', 'have',
	'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may',
	'might', 'must', 'shall', 'can', 'need', 'this', 'that', 'these', 'those',
	'my', 'your', 'his', 'her', 'its', 'our', 'their', 'what', 'which', 'who',
	'whom', 'whose', 'where', 'when', 'why', 'how', 'all', 'each', 'every', 'both',
	'few', 'more', 'most', 'other', 'some', 'such', 'no', 'not', 'only', 'same',
	'than', 'too', 'just', 'also', 'now', 'here', 'there', 'then', 'once', 'if',
	'unless', 'until', 'while', 'although', 'because', 'since', 'before', 'after',
	'today', 'tomorrow', 'yesterday', 'always', 'never', 'forever', 'love', 'life',
	'heart', 'soul', 'world', 'time', 'day', 'night', 'moment', 'year', 'years',
])

/**
 * Count words in text (split on whitespace, ignore pure punctuation).
 */
export function countWords(text: string): number {
	const trimmed = text.trim()
	if (!trimmed) {
		return 0
	}

	// Split on whitespace and filter out pure punctuation tokens
	const tokens = trimmed.split(/\s+/)
	const words = tokens.filter((token) => /[a-zA-Z0-9]/.test(token))
	return words.length
}

/**
 * Get tokens (words) from text.
 */
export function getTokens(text: string): string[] {
	const trimmed = text.trim()
	if (!trimmed) {
		return []
	}
	return trimmed.split(/\s+/).filter((token) => /[a-zA-Z0-9]/.test(token))
}

/**
 * Check if there's specificity nearby (dates, places, names, concrete nouns).
 * Used for conditional rules to reduce false positives.
 *
 * @param text - The full text
 * @param matchStart - Start index of the match
 * @param matchEnd - End index of the match
 * @param windowChars - Number of characters to search around the match (default 100)
 */
export function detectSpecificityNearby(
	text: string,
	matchStart: number,
	matchEnd: number,
	windowChars = 100
): boolean {
	// Get the text window around the match
	const windowStart = Math.max(0, matchStart - windowChars)
	const windowEnd = Math.min(text.length, matchEnd + windowChars)
	const windowText = text.slice(windowStart, windowEnd).toLowerCase()

	// Check for numbers/years/dates (e.g., 2019, "three summers", "first apartment")
	const hasNumber = /\b\d{4}\b/.test(windowText) || // years like 2019
		/\b\d{1,2}(?:st|nd|rd|th)?\b/.test(windowText) || // ordinals or day numbers
		/\b(?:first|second|third|fourth|fifth|sixth|seventh|eighth|ninth|tenth)\b/.test(windowText) ||
		/\b(?:one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve)\s+(?:years?|months?|weeks?|days?|summers?|winters?|springs?|falls?|autumns?)\b/.test(windowText)

	if (hasNumber) return true

	// Check for month names
	const hasMonth = monthNames.some(month => 
		new RegExp(`\\b${month}\\b`, 'i').test(windowText)
	)
	if (hasMonth) return true

	// Check for day names
	const hasDay = dayNames.some(day =>
		new RegExp(`\\b${day}\\b`, 'i').test(windowText)
	)
	if (hasDay) return true

	// Check for place indicators (in Paris, at the beach, on Main Street)
	const hasPlaceIndicator = /\b(?:in|at|on)\s+[A-Z][a-z]+/.test(text.slice(windowStart, windowEnd))
	if (hasPlaceIndicator) return true

	// Check for concrete nouns
	const hasConcreteNoun = concreteNounsList.some(noun =>
		new RegExp(`\\b${noun}s?\\b`, 'i').test(windowText)
	)
	if (hasConcreteNoun) return true

	// Check for proper nouns (capitalized words not in common word list)
	const originalWindow = text.slice(windowStart, windowEnd)
	const tokens = getTokens(originalWindow)
	for (const token of tokens) {
		if (/^[A-Z][a-z]+$/.test(token)) {
			const lower = token.toLowerCase()
			if (!commonWords.has(lower) && lower.length > 2) {
				return true
			}
		}
	}

	return false
}

/**
 * Detect overuse of intensifiers in the text.
 * Returns density per 100 words and a penalty score.
 *
 * @param text - The full text to analyze
 */
export function detectIntensifierOveruse(text: string): {
	count: number
	densityPer100: number
	penaltyScore: number
} {
	const words = countWords(text)
	if (words === 0) {
		return { count: 0, densityPer100: 0, penaltyScore: 0 }
	}

	const lowerText = text.toLowerCase()
	let count = 0

	for (const intensifier of intensifierWords) {
		const regex = new RegExp(`\\b${intensifier}\\b`, 'gi')
		const matches = lowerText.match(regex)
		if (matches) {
			count += matches.length
		}
	}

	const densityPer100 = (count / words) * 100

	// Calculate penalty:
	// - 0-2 per 100 words: no penalty
	// - 3-5 per 100 words: small penalty (+1)
	// - 6+ per 100 words: larger penalty (+2)
	let penaltyScore = 0
	if (densityPer100 > 5) {
		penaltyScore = 2
	} else if (densityPer100 > 2) {
		penaltyScore = 1
	}

	return { count, densityPer100, penaltyScore }
}

/**
 * Escape special regex characters in a string.
 */
export function escapeRegex(str: string): string {
	return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}
