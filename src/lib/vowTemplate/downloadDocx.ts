/**
 * DOCX export for wedding vows using the docx package.
 */

import {
	Document,
	Paragraph,
	TextRun,
	HeadingLevel,
	AlignmentType,
	Packer,
	ExternalHyperlink,
} from 'docx'

interface DocxOptions {
	title?: string
	partnerName?: string
	showDate?: boolean
}

/**
 * Create a DOCX document from vow text
 */
function createDocument(vowText: string, options: DocxOptions = {}): Document {
	const { title = 'Wedding Vows', partnerName, showDate = false } = options

	const children: Paragraph[] = []

	// Title
	children.push(
		new Paragraph({
			children: [
				new TextRun({
					text: title,
					bold: true,
					size: 40, // 20pt
				}),
			],
			heading: HeadingLevel.TITLE,
			alignment: AlignmentType.CENTER,
			spacing: { after: 200 },
		})
	)

	// Partner name subtitle
	if (partnerName) {
		children.push(
			new Paragraph({
				children: [
					new TextRun({
						text: `For ${partnerName}`,
						italics: true,
						size: 24, // 12pt
					}),
				],
				alignment: AlignmentType.CENTER,
				spacing: { after: 100 },
			})
		)
	}

	// Date
	if (showDate) {
		const dateStr = new Date().toLocaleDateString('en-US', {
			year: 'numeric',
			month: 'long',
			day: 'numeric',
		})
		children.push(
			new Paragraph({
				children: [
					new TextRun({
						text: dateStr,
						size: 20, // 10pt
					}),
				],
				alignment: AlignmentType.CENTER,
				spacing: { after: 400 },
			})
		)
	} else {
		// Add spacing if no date
		children.push(
			new Paragraph({
				children: [],
				spacing: { after: 300 },
			})
		)
	}

	// Body paragraphs
	const paragraphs = vowText.split('\n\n').filter((p) => p.trim())

	for (const paragraph of paragraphs) {
		children.push(
			new Paragraph({
				children: [
					new TextRun({
						text: paragraph.trim(),
						size: 24, // 12pt
					}),
				],
				spacing: { after: 200, line: 360 }, // 1.5 line spacing
			})
		)
	}

	// Add footer with vows.you link
	children.push(
		new Paragraph({
			children: [],
			spacing: { before: 400 },
		})
	)
	children.push(
		new Paragraph({
			children: [
				new TextRun({
					text: 'Created with ',
					size: 18, // 9pt
					color: '808080',
				}),
				new ExternalHyperlink({
					children: [
						new TextRun({
							text: 'vows.you',
							size: 18,
							color: '808080',
							underline: {},
						}),
					],
					link: 'https://vows.you',
				}),
			],
			alignment: AlignmentType.CENTER,
		})
	)

	return new Document({
		sections: [
			{
				properties: {
					page: {
						margin: {
							top: 1440, // 1 inch in twips
							right: 1440,
							bottom: 1440,
							left: 1440,
						},
					},
				},
				children,
			},
		],
	})
}

/**
 * Download vow as a DOCX file
 */
export async function downloadDocx(
	vowText: string,
	options: DocxOptions = {}
): Promise<{ success: true } | { success: false; error: string }> {
	const { partnerName } = options

	try {
		const doc = createDocument(vowText, options)

		// Generate blob
		const blob = await Packer.toBlob(doc)

		// Create download link
		const url = URL.createObjectURL(blob)
		const link = document.createElement('a')

		// Generate filename
		const filename = partnerName
			? `wedding-vows-for-${partnerName.toLowerCase().replace(/\s+/g, '-')}.docx`
			: 'wedding-vows.docx'

		link.href = url
		link.download = filename
		document.body.appendChild(link)
		link.click()
		document.body.removeChild(link)

		// Clean up
		URL.revokeObjectURL(url)

		return { success: true }
	} catch (error) {
		return {
			success: false,
			error: 'Failed to generate DOCX. Please try again.',
		}
	}
}
