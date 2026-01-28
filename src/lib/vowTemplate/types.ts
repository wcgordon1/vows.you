/**
 * Types for the Wedding Vows Template generator.
 */

/** Template variant - voice selection */
export type TemplateVariant = 'for-her' | 'for-him'

/** Tone options for the vow */
export type VowTone = 'heartfelt' | 'modern-minimal' | 'funny-light'

/** Closing style options */
export type ClosingStyle =
	| 'classic'
	| 'forward-looking'
	| 'simple-sweet'
	| 'poetic'
	| 'grounded'

/** Form answers from the stepper */
export interface VowFormAnswers {
	/** Partner's name (optional) */
	partnerName: string
	/** Template variant */
	variant: TemplateVariant
	/** Tone selection */
	tone: VowTone
	/** Include humor toggle */
	includeHumor: boolean
	/** How you met (1-2 sentences) */
	howMet: string
	/** Favorite shared moment (2-4 sentences) */
	favoriteMemory: string
	/** "I knew I loved you when…" (1-2 sentences) */
	knewLovedWhen: string
	/** Three qualities you admire */
	qualities: [string, string, string]
	/** Selected promises (exactly 3) */
	selectedPromises: [string, string, string]
	/** Custom promise (optional) */
	customPromise: string
	/** Extra promises (optional, one per line) */
	extraPromises: string
	/** Future you're excited for */
	futureTogether: string
	/** Closing style selection */
	closingStyle: ClosingStyle
}

/** Generated vow output */
export interface GeneratedVow {
	/** The full vow text */
	text: string
	/** Word count */
	wordCount: number
	/** Read time in seconds (at 140 WPM) */
	readTimeSeconds: number
	/** Read time formatted as mm:ss */
	readTimeLabel: string
	/** Seed used for generation (for regeneration) */
	seed: number
	/** Warning if vow is too long */
	lengthWarning?: string
}

/** Saved draft in localStorage */
export interface SavedDraft {
	/** Unique ID (timestamp-based) */
	id: string
	/** ISO timestamp when saved */
	savedAt: string
	/** Form answers */
	answers: VowFormAnswers
	/** Generated vow text */
	vowText: string
	/** Word count */
	wordCount: number
	/** Seed used */
	seed: number
	/** Tone label for display */
	tone: VowTone
	/** Variant label for display */
	variant: TemplateVariant
}

/** Share link payload (compressed) */
export interface SharePayload {
	/** Form answers */
	a: VowFormAnswers
	/** Seed for regeneration */
	s: number
}

/** Promise suggestion item */
export interface PromiseSuggestion {
	/** Unique key */
	key: string
	/** Display text */
	text: string
}

/** Default form answers */
export const defaultFormAnswers: VowFormAnswers = {
	partnerName: '',
	variant: 'for-her',
	tone: 'heartfelt',
	includeHumor: false,
	howMet: '',
	favoriteMemory: '',
	knewLovedWhen: '',
	qualities: ['', '', ''],
	selectedPromises: ['', '', ''],
	customPromise: '',
	extraPromises: '',
	futureTogether: '',
	closingStyle: 'classic',
}
