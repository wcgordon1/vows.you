/**
 * Wedding Vow Template library.
 * Barrel exports for all public APIs.
 */

// Types
export type {
	TemplateVariant,
	VowTone,
	ClosingStyle,
	VowFormAnswers,
	GeneratedVow,
	SavedDraft,
	SharePayload,
	PromiseSuggestion,
} from './types'

export { defaultFormAnswers } from './types'

// Sentence Bank
export {
	openings,
	storyTransitions,
	admirationConnectors,
	meaningLines,
	fillerMeaning,
	promiseStarters,
	humorLines,
	closings,
	closingOptions,
	promiseSuggestions,
} from './sentenceBank'

// Generator
export { generateVow, regenerateVow } from './generator'

// Length utilities
export {
	countWords,
	getReadTimeSeconds,
	formatReadTime,
	getLengthStatus,
	willFitOnePage,
	TARGET_WORD_COUNT,
} from './length'

// Draft storage
export {
	getDrafts,
	saveDraft,
	deleteDraft,
	clearAllDrafts,
	saveCurrentAnswers,
	loadCurrentAnswers,
	clearCurrentAnswers,
	saveCurrentStep,
	loadCurrentStep,
	clearCurrentStep,
	formatDraftDate,
	getToneLabel,
	getVariantLabel,
} from './draftStore'

// Share link
export {
	encodeSharePayload,
	decodeSharePayload,
	generateShareUrl,
	hasSharePayload,
	getSharePayloadFromUrl,
	clearSharePayloadFromUrl,
	copyShareUrl,
	encodeVowText,
	decodeVowText,
	hasVowTextParam,
	getVowTextFromUrl,
	clearVowTextFromUrl,
	copyVowShareUrl,
	// Simple ?vows= param helpers
	hasSimpleVowsParam,
	getSimpleVowsFromUrl,
	clearSimpleVowsFromUrl,
	generateSimpleVowsUrl,
	copySimpleVowsUrl,
} from './shareLink'

// PDF export
export { downloadPdf } from './downloadPdf'

// DOCX export
export { downloadDocx } from './downloadDocx'
