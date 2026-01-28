/**
 * Share link encoding/decoding with LZ-string compression.
 */

import type { SharePayload, VowFormAnswers } from './types'
import LZString from 'lz-string'

const MAX_URL_LENGTH = 1800
const PARAM_NAME = 'd'
const VOW_TEXT_PARAM = 'v'

/**
 * Encode form answers and seed into a compressed share payload
 */
export function encodeSharePayload(answers: VowFormAnswers, seed: number): string {
	const payload: SharePayload = {
		a: answers,
		s: seed,
	}
	const json = JSON.stringify(payload)
	return LZString.compressToEncodedURIComponent(json)
}

/**
 * Decode a compressed share payload
 */
export function decodeSharePayload(encoded: string): SharePayload | null {
	try {
		const json = LZString.decompressFromEncodedURIComponent(encoded)
		if (!json) return null
		return JSON.parse(json) as SharePayload
	} catch {
		return null
	}
}

/**
 * Generate a share URL with compressed data
 * Returns null if the URL would be too long
 */
export function generateShareUrl(
	baseUrl: string,
	answers: VowFormAnswers,
	seed: number
): { url: string } | { error: string } {
	const encoded = encodeSharePayload(answers, seed)
	const url = `${baseUrl}?${PARAM_NAME}=${encoded}`

	if (url.length > MAX_URL_LENGTH) {
		return {
			error: 'This vow is too long to share via link. Use Copy or download PDF.',
		}
	}

	return { url }
}

/**
 * Check if the current URL has a share payload
 */
export function hasSharePayload(): boolean {
	if (typeof window === 'undefined') return false
	const params = new URLSearchParams(window.location.search)
	return params.has(PARAM_NAME)
}

/**
 * Get share payload from current URL
 */
export function getSharePayloadFromUrl(): SharePayload | null {
	if (typeof window === 'undefined') return null
	const params = new URLSearchParams(window.location.search)
	const encoded = params.get(PARAM_NAME)
	if (!encoded) return null
	return decodeSharePayload(encoded)
}

/**
 * Remove share payload from URL (clean up after loading)
 */
export function clearSharePayloadFromUrl(): void {
	if (typeof window === 'undefined') return
	const url = new URL(window.location.href)
	url.searchParams.delete(PARAM_NAME)
	window.history.replaceState({}, '', url.toString())
}

/**
 * Copy share URL to clipboard
 */
export async function copyShareUrl(
	answers: VowFormAnswers,
	seed: number
): Promise<{ success: true } | { success: false; error: string }> {
	const baseUrl = window.location.origin + window.location.pathname
	const result = generateShareUrl(baseUrl, answers, seed)

	if ('error' in result) {
		return { success: false, error: result.error }
	}

	try {
		await navigator.clipboard.writeText(result.url)
		return { success: true }
	} catch {
		return { success: false, error: 'Failed to copy to clipboard.' }
	}
}

/**
 * Encode vow text for URL sharing (compressed)
 */
export function encodeVowText(vowText: string): string {
	return LZString.compressToEncodedURIComponent(vowText)
}

/**
 * Decode vow text from URL
 */
export function decodeVowText(encoded: string): string | null {
	try {
		return LZString.decompressFromEncodedURIComponent(encoded)
	} catch {
		return null
	}
}

/**
 * Check if the current URL has a vow text param
 */
export function hasVowTextParam(): boolean {
	if (typeof window === 'undefined') return false
	const params = new URLSearchParams(window.location.search)
	return params.has(VOW_TEXT_PARAM)
}

/**
 * Get vow text from current URL
 */
export function getVowTextFromUrl(): string | null {
	if (typeof window === 'undefined') return null
	const params = new URLSearchParams(window.location.search)
	const encoded = params.get(VOW_TEXT_PARAM)
	if (!encoded) return null
	return decodeVowText(encoded)
}

/**
 * Clear vow text param from URL
 */
export function clearVowTextFromUrl(): void {
	if (typeof window === 'undefined') return
	const url = new URL(window.location.href)
	url.searchParams.delete(VOW_TEXT_PARAM)
	window.history.replaceState({}, '', url.toString())
}

/**
 * Copy share URL with vow text to clipboard
 */
export async function copyVowShareUrl(
	vowText: string
): Promise<{ success: true } | { success: false; error: string }> {
	const baseUrl = window.location.origin + window.location.pathname
	const encoded = encodeVowText(vowText)
	const url = `${baseUrl}?${VOW_TEXT_PARAM}=${encoded}`

	if (url.length > MAX_URL_LENGTH) {
		return {
			success: false,
			error: 'This vow is too long to share via link. Use Copy or download PDF.',
		}
	}

	try {
		await navigator.clipboard.writeText(url)
		return { success: true }
	} catch {
		return { success: false, error: 'Failed to copy to clipboard.' }
	}
}

// ============================================
// Simple ?vows= parameter (URL-encoded, human-readable)
// ============================================

const SIMPLE_VOWS_PARAM = 'vows'

/**
 * Check if the current URL has a simple ?vows= param
 */
export function hasSimpleVowsParam(): boolean {
	if (typeof window === 'undefined') return false
	const params = new URLSearchParams(window.location.search)
	return params.has(SIMPLE_VOWS_PARAM) && params.get(SIMPLE_VOWS_PARAM) !== ''
}

/**
 * Get vow text from simple ?vows= param (URL decoded, preserves line breaks)
 */
export function getSimpleVowsFromUrl(): string | null {
	if (typeof window === 'undefined') return null
	const params = new URLSearchParams(window.location.search)
	const vowText = params.get(SIMPLE_VOWS_PARAM)
	if (!vowText) return null
	// URLSearchParams automatically decodes, so line breaks (%0A) become \n
	return vowText
}

/**
 * Clear simple ?vows= param from URL
 */
export function clearSimpleVowsFromUrl(): void {
	if (typeof window === 'undefined') return
	const url = new URL(window.location.href)
	url.searchParams.delete(SIMPLE_VOWS_PARAM)
	window.history.replaceState({}, '', url.toString())
}

/**
 * Generate a simple share URL with ?vows= param
 * Uses standard URL encoding (line breaks become %0A)
 */
export function generateSimpleVowsUrl(vowText: string): { url: string } | { error: string } {
	const baseUrl = window.location.origin + window.location.pathname
	// encodeURIComponent preserves line breaks as %0A
	const encoded = encodeURIComponent(vowText)
	const url = `${baseUrl}?${SIMPLE_VOWS_PARAM}=${encoded}`

	if (url.length > MAX_URL_LENGTH) {
		return {
			error: 'This vow is too long to share via link. Use Copy or download PDF.',
		}
	}

	return { url }
}

/**
 * Copy simple share URL with ?vows= to clipboard
 */
export async function copySimpleVowsUrl(
	vowText: string
): Promise<{ success: true } | { success: false; error: string }> {
	const result = generateSimpleVowsUrl(vowText)

	if ('error' in result) {
		return { success: false, error: result.error }
	}

	try {
		await navigator.clipboard.writeText(result.url)
		return { success: true }
	} catch {
		return { success: false, error: 'Failed to copy to clipboard.' }
	}
}
