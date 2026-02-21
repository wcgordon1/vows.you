import { jsPDF } from "jspdf";
import type { DesignConfig, CardFormat } from "./types";
import { FONT_OPTIONS, FORMAT_OPTIONS } from "./types";
import { getBackground } from "./backgrounds";

const IN_TO_MM = 25.4;

function getPageDimensions(format: CardFormat) {
  const fmt = FORMAT_OPTIONS.find((f) => f.key === format) || FORMAT_OPTIONS[0];
  return { width: fmt.width * IN_TO_MM, height: fmt.height * IN_TO_MM };
}

const MARGIN_MM = 8;
const OVERLAY_INSET_MM = 6;
const OVERLAY_RADIUS_MM = 4;
const BRAND_HEIGHT_MM = 6;
const LINE_HEIGHT_FACTOR = 1.65;
const FONT_SIZE_PT = 11;
const HEADING_SIZE_PT = 14;

/**
 * Load an image URL as a base64 data URL via canvas.
 * Returns null if the image fails to load.
 */
async function loadImageAsBase64(
  src: string,
  width: number,
  height: number,
): Promise<string | null> {
  try {
    const img = new Image();
    img.crossOrigin = "anonymous";
    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve();
      img.onerror = () => reject(new Error("Image load failed"));
      img.src = src;
    });
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d")!;
    // Cover-fit the image
    const imgRatio = img.naturalWidth / img.naturalHeight;
    const canvasRatio = width / height;
    let sx = 0, sy = 0, sw = img.naturalWidth, sh = img.naturalHeight;
    if (imgRatio > canvasRatio) {
      sw = img.naturalHeight * canvasRatio;
      sx = (img.naturalWidth - sw) / 2;
    } else {
      sh = img.naturalWidth / canvasRatio;
      sy = (img.naturalHeight - sh) / 2;
    }
    ctx.drawImage(img, sx, sy, sw, sh, 0, 0, width, height);
    return canvas.toDataURL("image/jpeg", 0.85);
  } catch {
    return null;
  }
}

/**
 * Parse hex color (#rrggbb or #rgb) to RGB values 0-255.
 */
function hexToRgb(hex: string): [number, number, number] {
  let h = hex.replace("#", "");
  if (h.length === 3) h = h[0] + h[0] + h[1] + h[1] + h[2] + h[2];
  const n = parseInt(h, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

/**
 * Strip HTML tags and convert to plain-text lines suitable for jsPDF,
 * preserving paragraph structure.
 */
function htmlToPlainLines(html: string): { text: string; isHeading: boolean }[] {
  const div = document.createElement("div");
  div.innerHTML = html;

  const lines: { text: string; isHeading: boolean }[] = [];

  function walk(node: Node) {
    for (const child of Array.from(node.childNodes)) {
      if (child.nodeType === Node.TEXT_NODE) {
        const t = child.textContent?.trim();
        if (t) lines.push({ text: t, isHeading: false });
        continue;
      }
      if (child.nodeType !== Node.ELEMENT_NODE) continue;
      const el = child as Element;
      const tag = el.tagName.toLowerCase();

      if (tag === "h1" || tag === "h2" || tag === "h3") {
        const t = el.textContent?.trim();
        if (t) {
          lines.push({ text: "", isHeading: false }); // spacing before heading
          lines.push({ text: t, isHeading: true });
          lines.push({ text: "", isHeading: false }); // spacing after heading
        }
        continue;
      }

      if (tag === "br") {
        lines.push({ text: "", isHeading: false });
        continue;
      }

      if (tag === "li") {
        const t = el.textContent?.trim();
        if (t) lines.push({ text: `  •  ${t}`, isHeading: false });
        continue;
      }

      if (tag === "ul" || tag === "ol") {
        lines.push({ text: "", isHeading: false });
        walk(child);
        lines.push({ text: "", isHeading: false });
        continue;
      }

      if (tag === "p" || tag === "div" || tag === "blockquote") {
        walk(child);
        lines.push({ text: "", isHeading: false });
        continue;
      }

      // Inline elements: just recurse
      walk(child);
    }
  }

  walk(div);

  // Collapse consecutive blank lines
  const collapsed: { text: string; isHeading: boolean }[] = [];
  for (const line of lines) {
    if (line.text === "" && collapsed.length > 0 && collapsed[collapsed.length - 1].text === "") {
      continue;
    }
    collapsed.push(line);
  }
  // Trim leading/trailing blanks
  while (collapsed.length > 0 && collapsed[0].text === "") collapsed.shift();
  while (collapsed.length > 0 && collapsed[collapsed.length - 1].text === "") collapsed.pop();

  return collapsed;
}

interface WrappedLine {
  text: string;
  isHeading: boolean;
}

/**
 * Generate a multi-page PDF with background, overlay, and text.
 */
export async function generatePdf(
  sanitizedHtml: string,
  config: DesignConfig,
  filename: string = "wedding-vow-card.pdf",
): Promise<{ success: true } | { success: false; error: string }> {
  try {
    const { width, height } = getPageDimensions(config.format);
    const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: [width, height] });

    const fontOpt = FONT_OPTIONS.find((f) => f.key === config.fontKey) || FONT_OPTIONS[0];
    doc.setFont(fontOpt.pdfFamily, fontOpt.pdfStyle);

    // Load background image
    const bg = getBackground(config.bgId);
    const bgDpi = 150;
    const bgPxW = Math.round((width / IN_TO_MM) * bgDpi);
    const bgPxH = Math.round((height / IN_TO_MM) * bgDpi);
    const bgBase64 = await loadImageAsBase64(bg.src, bgPxW, bgPxH);

    // Overlay dimensions
    const overlayX = OVERLAY_INSET_MM;
    const overlayY = OVERLAY_INSET_MM;
    const overlayW = width - OVERLAY_INSET_MM * 2;
    const overlayH = height - OVERLAY_INSET_MM * 2;

    // Content area inside overlay
    const contentX = overlayX + MARGIN_MM;
    const contentW = overlayW - MARGIN_MM * 2;
    const contentTopY = overlayY + MARGIN_MM;
    const brandSpace = config.brandMode ? BRAND_HEIGHT_MM + 4 : 0;
    const contentMaxH = overlayH - MARGIN_MM * 2 - brandSpace;

    // Parse content into plain-text lines
    const rawLines = htmlToPlainLines(sanitizedHtml);

    // Wrap text to fit content width
    const wrapped: WrappedLine[] = [];
    for (const line of rawLines) {
      if (line.text === "") {
        wrapped.push({ text: "", isHeading: false });
        continue;
      }
      const size = line.isHeading ? HEADING_SIZE_PT : FONT_SIZE_PT;
      doc.setFontSize(size);
      if (line.isHeading) {
        doc.setFont(fontOpt.pdfFamily, "bold");
      } else {
        doc.setFont(fontOpt.pdfFamily, fontOpt.pdfStyle);
      }
      const split: string[] = doc.splitTextToSize(line.text, contentW);
      for (const s of split) {
        wrapped.push({ text: s, isHeading: line.isHeading });
      }
    }

    // Calculate line heights
    const bodyLineH = FONT_SIZE_PT * LINE_HEIGHT_FACTOR * 0.352778; // pt to mm
    const headingLineH = HEADING_SIZE_PT * LINE_HEIGHT_FACTOR * 0.352778;

    // Paginate
    const pages: WrappedLine[][] = [];
    let currentPage: WrappedLine[] = [];
    let currentH = 0;

    for (const wl of wrapped) {
      const lh = wl.isHeading ? headingLineH : bodyLineH;
      const lineH = wl.text === "" ? bodyLineH * 0.5 : lh;
      if (currentH + lineH > contentMaxH && currentPage.length > 0) {
        pages.push(currentPage);
        currentPage = [];
        currentH = 0;
      }
      currentPage.push(wl);
      currentH += lineH;
    }
    if (currentPage.length > 0) pages.push(currentPage);
    if (pages.length === 0) pages.push([]);

    // Render each page
    const [oR, oG, oB] = hexToRgb(config.overlayColor);
    const [fR, fG, fB] = hexToRgb(config.fontColor);

    for (let i = 0; i < pages.length; i++) {
      if (i > 0) doc.addPage([width, height]);

      // Background
      if (bgBase64) {
        doc.addImage(bgBase64, "JPEG", 0, 0, width, height);
      } else {
        // Solid fallback
        doc.setFillColor(232, 213, 183);
        doc.rect(0, 0, width, height, "F");
      }

      // Overlay with rounded corners
      doc.setFillColor(oR, oG, oB);
      doc.setGState(new (doc as any).GState({ opacity: config.overlayOpacity }));
      doc.roundedRect(overlayX, overlayY, overlayW, overlayH, OVERLAY_RADIUS_MM, OVERLAY_RADIUS_MM, "F");
      doc.setGState(new (doc as any).GState({ opacity: 1 }));

      // Text
      doc.setTextColor(fR, fG, fB);
      let cursorY = contentTopY;

      for (const wl of pages[i]) {
        if (wl.text === "") {
          cursorY += bodyLineH * 0.5;
          continue;
        }
        const size = wl.isHeading ? HEADING_SIZE_PT : FONT_SIZE_PT;
        const lh = wl.isHeading ? headingLineH : bodyLineH;
        doc.setFontSize(size);
        if (wl.isHeading) {
          doc.setFont(fontOpt.pdfFamily, "bold");
        } else {
          doc.setFont(fontOpt.pdfFamily, fontOpt.pdfStyle);
        }
        doc.text(wl.text, contentX, cursorY + size * 0.352778);
        cursorY += lh;
      }

      // Branding footer on last page
      if (config.brandMode && i === pages.length - 1) {
        const brandY = overlayY + overlayH - MARGIN_MM;
        doc.setFontSize(7);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(160, 160, 160);
        doc.text("Made with vows.you", width / 2, brandY - 2, { align: "center" });
        doc.setFontSize(6);
        doc.text("vows.you/wedding-vow-cards", width / 2, brandY + 1.5, { align: "center" });
        doc.link(
          width / 2 - 20,
          brandY - 4,
          40,
          8,
          { url: "https://vows.you/wedding-vow-cards" },
        );
      }
    }

    // Sanitize and save
    const safeName = sanitizeFilename(filename);
    doc.save(safeName);
    return { success: true };
  } catch (err) {
    console.error("PDF generation failed:", err);
    return { success: false, error: "Failed to generate PDF. Please try again." };
  }
}

function sanitizeFilename(name: string): string {
  let clean = name.replace(/[^a-zA-Z0-9._\- ]/g, "").trim();
  if (!clean) clean = "wedding-vow-card";
  if (!clean.endsWith(".pdf")) clean += ".pdf";
  if (clean.length > 100) clean = clean.slice(0, 96) + ".pdf";
  return clean;
}
