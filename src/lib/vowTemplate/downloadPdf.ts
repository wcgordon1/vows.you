/**
 * PDF export for wedding vows using jsPDF.
 * Generates a clean, ceremony-ready single-page document.
 */

import { jsPDF } from 'jspdf'

interface PdfOptions {
	title?: string
	partnerName?: string
	showDate?: boolean
}

const PAGE_WIDTH = 210 // A4 width in mm
const PAGE_HEIGHT = 297 // A4 height in mm
const MARGIN_LEFT = 25
const MARGIN_RIGHT = 25
const MARGIN_TOP = 40
const MARGIN_BOTTOM = 30
const CONTENT_WIDTH = PAGE_WIDTH - MARGIN_LEFT - MARGIN_RIGHT
const MAX_CONTENT_HEIGHT = PAGE_HEIGHT - MARGIN_TOP - MARGIN_BOTTOM

const MIN_FONT_SIZE = 11
const MAX_FONT_SIZE = 14
const TITLE_FONT_SIZE = 20
const LINE_HEIGHT_FACTOR = 1.5

/**
 * Calculate how many lines the text will take at a given font size
 */
function calculateTextHeight(
	doc: jsPDF,
	text: string,
	fontSize: number,
	maxWidth: number
): number {
	doc.setFontSize(fontSize)
	const lines = doc.splitTextToSize(text, maxWidth)
	const lineHeight = fontSize * LINE_HEIGHT_FACTOR * 0.352778 // Convert pt to mm
	return lines.length * lineHeight
}

/**
 * Find the optimal font size that fits the content on one page
 */
function findOptimalFontSize(
	doc: jsPDF,
	text: string,
	maxWidth: number,
	maxHeight: number,
	titleHeight: number
): number {
	const availableHeight = maxHeight - titleHeight - 10 // 10mm buffer for title spacing

	for (let size = MAX_FONT_SIZE; size >= MIN_FONT_SIZE; size--) {
		const textHeight = calculateTextHeight(doc, text, size, maxWidth)
		if (textHeight <= availableHeight) {
			return size
		}
	}

	return MIN_FONT_SIZE
}

/**
 * Download vow as a ceremony-ready PDF
 */
export function downloadPdf(
	vowText: string,
	options: PdfOptions = {}
): { success: true } | { success: false; error: string } {
	const { title = 'Wedding Vows', partnerName, showDate = false } = options

	try {
		const doc = new jsPDF({
			orientation: 'portrait',
			unit: 'mm',
			format: 'a4',
		})

		// Set up fonts
		doc.setFont('helvetica', 'normal')

		// Calculate title height
		doc.setFontSize(TITLE_FONT_SIZE)
		const titleHeight = TITLE_FONT_SIZE * 0.352778 * 1.2 // Convert pt to mm with some spacing

		// Find optimal font size for body
		const optimalFontSize = findOptimalFontSize(
			doc,
			vowText,
			CONTENT_WIDTH,
			MAX_CONTENT_HEIGHT,
			titleHeight + (partnerName ? 8 : 0) + (showDate ? 6 : 0)
		)

		// Check if text will still overflow at minimum size
		const finalTextHeight = calculateTextHeight(doc, vowText, optimalFontSize, CONTENT_WIDTH)
		const availableHeight = MAX_CONTENT_HEIGHT - titleHeight - (partnerName ? 8 : 0) - (showDate ? 6 : 0) - 10

		if (finalTextHeight > availableHeight && optimalFontSize === MIN_FONT_SIZE) {
			return {
				success: false,
				error: 'Too long for one page — shorten your story answers.',
			}
		}

		// Draw title
		let currentY = MARGIN_TOP
		doc.setFontSize(TITLE_FONT_SIZE)
		doc.setFont('helvetica', 'bold')
		doc.text(title, PAGE_WIDTH / 2, currentY, { align: 'center' })
		currentY += titleHeight + 5

		// Draw partner name if provided
		if (partnerName) {
			doc.setFontSize(12)
			doc.setFont('helvetica', 'italic')
			doc.text(`For ${partnerName}`, PAGE_WIDTH / 2, currentY, { align: 'center' })
			currentY += 8
		}

		// Draw date if requested
		if (showDate) {
			doc.setFontSize(10)
			doc.setFont('helvetica', 'normal')
			const dateStr = new Date().toLocaleDateString('en-US', {
				year: 'numeric',
				month: 'long',
				day: 'numeric',
			})
			doc.text(dateStr, PAGE_WIDTH / 2, currentY, { align: 'center' })
			currentY += 6
		}

		// Add some spacing before body
		currentY += 8

		// Draw body text
		doc.setFontSize(optimalFontSize)
		doc.setFont('helvetica', 'normal')

		// Split into paragraphs and render
		const paragraphs = vowText.split('\n\n').filter((p) => p.trim())
		const lineHeight = optimalFontSize * LINE_HEIGHT_FACTOR * 0.352778

		for (const paragraph of paragraphs) {
			const lines = doc.splitTextToSize(paragraph.trim(), CONTENT_WIDTH)
			doc.text(lines, MARGIN_LEFT, currentY)
			currentY += lines.length * lineHeight + 4 // 4mm paragraph spacing
		}

		// Add footer with vows.you link
		doc.setFontSize(9)
		doc.setFont('helvetica', 'normal')
		doc.setTextColor(128, 128, 128) // Gray color
		doc.text('Created with vows.you', PAGE_WIDTH / 2, PAGE_HEIGHT - 15, { align: 'center' })

		// Add clickable link
		doc.link(PAGE_WIDTH / 2 - 25, PAGE_HEIGHT - 18, 50, 6, { url: 'https://vows.you' })

		// Generate filename
		const filename = partnerName
			? `wedding-vows-for-${partnerName.toLowerCase().replace(/\s+/g, '-')}.pdf`
			: 'wedding-vows.pdf'

		// Download
		doc.save(filename)

		return { success: true }
	} catch (error) {
		return {
			success: false,
			error: 'Failed to generate PDF. Please try again.',
		}
	}
}
