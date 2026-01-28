/**
 * Vow generator with seeded RNG for reproducible output.
 */

import type { VowFormAnswers, GeneratedVow, VowTone, ClosingStyle } from './types'
import {
	openings,
	storyTransitions,
	admirationConnectors,
	meaningLines,
	fillerMeaning,
	promiseStarters,
	humorLines,
	closings,
} from './sentenceBank'
import { countWords, formatReadTime, getReadTimeSeconds } from './length'

/**
 * Simple seeded PRNG (Mulberry32)
 */
function createRng(seed: number): () => number {
	let state = seed
	return () => {
		state |= 0
		state = (state + 0x6d2b79f5) | 0
		let t = Math.imul(state ^ (state >>> 15), 1 | state)
		t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
		return ((t ^ (t >>> 14)) >>> 0) / 4294967296
	}
}

/**
 * Pick a random item from an array using the seeded RNG
 */
function pick<T>(arr: T[], rng: () => number): T {
	return arr[Math.floor(rng() * arr.length)]
}

/**
 * Capitalize the first letter of a string
 */
function capitalize(str: string): string {
	return str.charAt(0).toUpperCase() + str.slice(1)
}

/**
 * Clean user input - trim and ensure proper sentence ending
 */
function cleanUserInput(text: string): string {
	const trimmed = text.trim()
	if (!trimmed) return ''
	// Add period if missing punctuation
	if (!/[.!?]$/.test(trimmed)) {
		return trimmed + '.'
	}
	return trimmed
}

/**
 * Insert partner name naturally (max 1-2 times)
 */
function insertPartnerName(text: string, name: string, maxTimes: number = 2): string {
	if (!name) return text

	// Simple approach: replace first occurrence of "you" with name if it makes sense
	let count = 0
	return text.replace(/\byou\b/gi, (match) => {
		if (count >= maxTimes) return match
		// Only replace "you" at the start of a sentence or after certain words
		count++
		return name
	})
}

/**
 * Build the story section from user inputs
 */
function buildStorySection(
	answers: VowFormAnswers,
	tone: VowTone,
	rng: () => number
): string {
	const parts: string[] = []

	// How we met
	if (answers.howMet.trim()) {
		const transition = pick(storyTransitions[tone], rng)
		const howMet = cleanUserInput(answers.howMet)
		parts.push(`${transition} ${howMet}`)
	}

	// Favorite memory
	if (answers.favoriteMemory.trim()) {
		const memory = cleanUserInput(answers.favoriteMemory)
		parts.push(memory)
	}

	return parts.join(' ')
}

/**
 * Build the admiration section from qualities
 */
function buildAdmirationSection(
	answers: VowFormAnswers,
	tone: VowTone,
	rng: () => number
): string {
	const qualities = answers.qualities.filter((q) => q.trim())
	if (qualities.length === 0) return ''

	const connector = pick(admirationConnectors[tone], rng)
	const sentences: string[] = []

	if (qualities.length >= 1) {
		sentences.push(`${connector} your ${qualities[0].toLowerCase()}.`)
	}
	if (qualities.length >= 2) {
		sentences.push(`I admire your ${qualities[1].toLowerCase()}.`)
	}
	if (qualities.length >= 3) {
		sentences.push(`And your ${qualities[2].toLowerCase()} makes me fall in love with you more every day.`)
	}

	return sentences.join(' ')
}

/**
 * Build the "I knew I loved you when" section
 */
function buildKnewLovedSection(answers: VowFormAnswers): string {
	if (!answers.knewLovedWhen.trim()) return ''
	const content = cleanUserInput(answers.knewLovedWhen)
	return `I knew I loved you when ${content.charAt(0).toLowerCase()}${content.slice(1)}`
}

/**
 * Build the promises section
 */
function buildPromisesSection(
	answers: VowFormAnswers,
	tone: VowTone,
	rng: () => number,
	includeHumor: boolean
): string {
	const starter = pick(promiseStarters[tone], rng)
	const promises: string[] = []

	// Add selected promises
	for (const promise of answers.selectedPromises) {
		if (promise.trim()) {
			promises.push(`${starter} ${promise}.`)
		}
	}

	// Add custom promise if provided
	if (answers.customPromise.trim()) {
		const custom = cleanUserInput(answers.customPromise)
		promises.push(`${starter} ${custom.charAt(0).toLowerCase()}${custom.slice(1)}`)
	}

	// Add extra promises (one per line)
	if (answers.extraPromises.trim()) {
		const extras = answers.extraPromises
			.split('\n')
			.map((p) => p.trim())
			.filter((p) => p)
		for (const extra of extras.slice(0, 2)) {
			// Limit to 2 extra
			promises.push(`${starter} ${extra.charAt(0).toLowerCase()}${extra.slice(1)}${extra.endsWith('.') ? '' : '.'}`)
		}
	}

	// Insert humor line if enabled (after first promise)
	if (includeHumor && promises.length > 0) {
		const humorLine = pick(humorLines, rng)
		promises.splice(1, 0, humorLine)
	}

	return promises.join(' ')
}

/**
 * Build the future section
 */
function buildFutureSection(answers: VowFormAnswers): string {
	if (!answers.futureTogether.trim()) return ''
	const content = cleanUserInput(answers.futureTogether)
	return `I can't wait to ${content.charAt(0).toLowerCase()}${content.slice(1)}`
}

/**
 * Build the closing section
 */
function buildClosingSection(
	tone: VowTone,
	closingStyle: ClosingStyle,
	rng: () => number
): string {
	const closingOptions = closings[closingStyle][tone]
	return pick(closingOptions, rng)
}

/**
 * Generate a complete vow from form answers
 */
export function generateVow(
	answers: VowFormAnswers,
	seed?: number
): GeneratedVow {
	const finalSeed = seed ?? Date.now()
	const rng = createRng(finalSeed)
	const tone = answers.tone

	// Build each section
	const sections: string[] = []

	// A) Opening (2-3 sentences)
	const opening = pick(openings[tone], rng)
	sections.push(opening)

	// B) Story section (how met + favorite memory)
	const story = buildStorySection(answers, tone, rng)
	if (story) sections.push(story)

	// C) "I knew I loved you when..." section
	const knewLoved = buildKnewLovedSection(answers)
	if (knewLoved) sections.push(knewLoved)

	// D) Admiration section (3 qualities)
	const admiration = buildAdmirationSection(answers, tone, rng)
	if (admiration) sections.push(admiration)

	// E) Meaning line
	const meaning = pick(meaningLines[tone], rng)
	sections.push(meaning)

	// F) Promises section
	const promises = buildPromisesSection(answers, tone, rng, answers.includeHumor)
	if (promises) sections.push(promises)

	// G) Future section
	const future = buildFutureSection(answers)
	if (future) sections.push(future)

	// H) Closing
	const closing = buildClosingSection(tone, answers.closingStyle, rng)
	sections.push(closing)

	// Join sections with proper spacing
	let text = sections.filter((s) => s).join('\n\n')

	// Insert partner name (max 2 times) in natural places
	if (answers.partnerName.trim()) {
		text = insertPartnerName(text, answers.partnerName.trim(), 2)
	}

	// Calculate stats
	let wordCount = countWords(text)
	let lengthWarning: string | undefined

	// Pad if too short
	if (wordCount < 280) {
		const filler = pick(fillerMeaning, rng)
		// Insert filler after meaning section
		const meaningIndex = sections.indexOf(meaning)
		if (meaningIndex !== -1) {
			sections.splice(meaningIndex + 1, 0, filler)
			text = sections.filter((s) => s).join('\n\n')
			if (answers.partnerName.trim()) {
				text = insertPartnerName(text, answers.partnerName.trim(), 2)
			}
			wordCount = countWords(text)
		}
	}

	// Warn if too long (we can't automatically trim user content safely)
	if (wordCount > 350) {
		lengthWarning = 'Trim your story answers for a one-page print.'
	}

	const readTimeSeconds = getReadTimeSeconds(wordCount)
	const readTimeLabel = formatReadTime(readTimeSeconds)

	return {
		text,
		wordCount,
		readTimeSeconds,
		readTimeLabel,
		seed: finalSeed,
		lengthWarning,
	}
}

/**
 * Regenerate with a new seed (keeps same answers)
 */
export function regenerateVow(answers: VowFormAnswers): GeneratedVow {
	return generateVow(answers, Date.now())
}
