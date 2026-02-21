import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { Download, Loader2, ImageIcon, Type, Palette, SlidersHorizontal } from "lucide-react";
import LZString from "lz-string";
import { parseContent } from "../../lib/teleprompter/parser";
import { BACKGROUNDS, getBackground } from "../../lib/vowCards/backgrounds";
import { FONT_OPTIONS, FORMAT_OPTIONS, DEFAULT_CONFIG } from "../../lib/vowCards/types";
import type { DesignConfig, FontKey, CardFormat } from "../../lib/vowCards/types";
import { generatePdf } from "../../lib/vowCards/generatePdf";

// ── URL param decoding ──────────────────────────────────────────────────────

function decodeVowText(url: URL): string {
  const t = url.searchParams.get("t");
  if (t) {
    const decoded = LZString.decompressFromEncodedURIComponent(t);
    if (decoded) return decoded;
  }

  const raw = url.searchParams.get("text");
  if (raw) {
    return raw
      .replace(/\+/g, " ")
      .replace(/%5B/gi, "[")
      .replace(/%5D/gi, "]")
      .replace(/%2F/gi, "/")
      .replace(/\\n/g, "\n");
  }

  return "";
}

function readConfigFromUrl(url: URL): Partial<DesignConfig> {
  const partial: Partial<DesignConfig> = {};
  const bg = url.searchParams.get("bg") || url.searchParams.get("bgId");
  if (bg) partial.bgId = bg;
  const overlay = url.searchParams.get("overlay");
  if (overlay) partial.overlayColor = overlay.startsWith("#") ? overlay : `#${overlay}`;
  const opacity = url.searchParams.get("opacity");
  if (opacity) {
    const n = parseFloat(opacity);
    if (!isNaN(n) && n >= 0 && n <= 1) partial.overlayOpacity = n;
  }
  const font = url.searchParams.get("font");
  if (font && ["serif", "sans", "script"].includes(font)) partial.fontKey = font as FontKey;
  const fontColor = url.searchParams.get("fontColor");
  if (fontColor) partial.fontColor = fontColor.startsWith("#") ? fontColor : `#${fontColor}`;
  const format = url.searchParams.get("format");
  if (format && ["card", "booklet"].includes(format)) partial.format = format as CardFormat;
  return partial;
}

// ── Trusted origin check ────────────────────────────────────────────────────

const TRUSTED_ORIGINS = ["https://app.vows.you"];

function isTrustedOrigin(origin: string): boolean {
  return TRUSTED_ORIGINS.includes(origin);
}

// ── Logo (inline SVG, matches Logo.astro) ───────────────────────────────────

function VowsLogo({ className = "" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 124 118" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path fillRule="evenodd" clipRule="evenodd" d="M33.3295 3C18.2359 3 6 15.2359 6 30.3295C6 45.4232 18.2359 57.6591 33.3296 57.6591H60.6591V30.3295C60.6591 15.2358 48.4232 3 33.3295 3ZM33.5 19C27.1487 19 22 24.1487 22 30.5C22 36.8513 27.1487 42 33.5 42H45V30.5C45 24.1487 39.8513 19 33.5 19Z" fill="currentColor" />
      <path fillRule="evenodd" clipRule="evenodd" d="M89.6705 3C104.764 3 117 15.2359 117 30.3295C117 45.4232 104.764 57.6591 89.6704 57.6591H62.3409V30.3295C62.3409 15.2358 74.5768 3 89.6705 3ZM89.5 19C95.8513 19 101 24.1487 101 30.5C101 36.8513 95.8513 42 89.5 42H78V30.5C78 24.1487 83.1487 19 89.5 19Z" fill="currentColor" />
      <path fillRule="evenodd" clipRule="evenodd" d="M33.3295 113.659C18.2359 113.659 6 101.423 6 86.3295C6 71.2358 18.2359 59 33.3296 59H60.6591V86.3295C60.6591 101.423 48.4232 113.659 33.3295 113.659ZM33.5 97.6591C27.1487 97.6591 22 92.5103 22 86.1591C22 79.8078 27.1487 74.6591 33.5 74.6591H45V86.1591C45 92.5103 39.8513 97.6591 33.5 97.6591Z" fill="currentColor" />
      <path fillRule="evenodd" clipRule="evenodd" d="M89.6705 113.659C104.764 113.659 117 101.423 117 86.3295C117 71.2358 104.764 59 89.6704 59H62.3409V86.3295C62.3409 101.423 74.5768 113.659 89.6705 113.659ZM89.5 97.6591C95.8513 97.6591 101 92.5103 101 86.1591C101 79.8078 95.8513 74.6591 89.5 74.6591H78V86.1591C78 92.5103 83.1487 97.6591 89.5 97.6591Z" fill="currentColor" />
    </svg>
  );
}

// ── Component ───────────────────────────────────────────────────────────────

interface Props {
  embedParam?: boolean;
}

export default function VowCardTool({ embedParam = false }: Props) {
  const [embedMode, setEmbedMode] = useState(embedParam);
  const [brandMode, setBrandMode] = useState(!embedParam);
  const [config, setConfig] = useState<DesignConfig>(DEFAULT_CONFIG);
  const [vowText, setVowText] = useState("");
  const [filename, setFilename] = useState("wedding-vow-card.pdf");
  const [generating, setGenerating] = useState(false);
  const [downloadNote, setDownloadNote] = useState<string | null>(null);
  const [bgLoadErrors, setBgLoadErrors] = useState<Set<string>>(new Set());

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [previewHtml, setPreviewHtml] = useState("");

  // Read URL params on mount
  useEffect(() => {
    const url = new URL(window.location.href);
    const text = decodeVowText(url);
    if (text) setVowText(text);

    const urlConfig = readConfigFromUrl(url);
    if (Object.keys(urlConfig).length > 0) {
      setConfig((prev) => ({ ...prev, ...urlConfig }));
    }

    const fn = url.searchParams.get("filename");
    if (fn) setFilename(fn);

    // If embed=1 in URL, set embed mode (but keep branding on until handshake)
    if (url.searchParams.get("embed") === "1") {
      setEmbedMode(true);
    }
  }, []);

  // postMessage handshake listener
  useEffect(() => {
    function handler(e: MessageEvent) {
      if (!isTrustedOrigin(e.origin)) return;
      if (e.data?.type === "VOWS_EMBED" && e.data.embed === true) {
        setEmbedMode(true);
        setBrandMode(false);
        try {
          (e.source as Window)?.postMessage(
            { type: "VOWS_EMBED_ACK" },
            { targetOrigin: e.origin },
          );
        } catch {
          // cross-origin reply failed — safe to ignore
        }
      }
    }
    window.addEventListener("message", handler);
    return () => window.removeEventListener("message", handler);
  }, []);

  // Sync brandMode into config
  useEffect(() => {
    setConfig((prev) => (prev.brandMode !== brandMode ? { ...prev, brandMode } : prev));
  }, [brandMode]);

  // Debounced preview update
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      if (!vowText.trim()) {
        setPreviewHtml("");
        return;
      }
      try {
        setPreviewHtml(parseContent(vowText));
      } catch {
        setPreviewHtml(`<p>${vowText.replace(/</g, "&lt;")}</p>`);
      }
    }, 200);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [vowText]);

  const bg = useMemo(() => getBackground(config.bgId), [config.bgId]);
  const fontOpt = useMemo(
    () => FONT_OPTIONS.find((f) => f.key === config.fontKey) || FONT_OPTIONS[0],
    [config.fontKey],
  );

  const isMobile = typeof window !== "undefined" && window.innerWidth < 768;
  const canDownload = vowText.trim().length > 0;

  const handleDownload = useCallback(async () => {
    if (!canDownload || generating) return;
    setGenerating(true);
    setDownloadNote(null);

    const html = previewHtml || `<p>${vowText.replace(/</g, "&lt;")}</p>`;
    const result = await generatePdf(html, config, filename);

    setGenerating(false);
    if (!result.success) {
      setDownloadNote(result.error);
    } else {
      if (/iPhone|iPad|iPod|Android/i.test(navigator.userAgent)) {
        setDownloadNote(
          "If your phone opens the PDF instead of downloading, tap Share → Save to Files.",
        );
      }
    }
  }, [canDownload, generating, previewHtml, vowText, config, filename]);

  const updateConfig = useCallback((patch: Partial<DesignConfig>) => {
    setConfig((prev) => ({ ...prev, ...patch }));
  }, []);

  // ── Render ──────────────────────────────────────────────────────────────

  const previewCardStyle: React.CSSProperties = {
    backgroundImage: bgLoadErrors.has(bg.id) ? bg.gradient : `url(${bg.src})`,
    backgroundSize: "cover",
    backgroundPosition: "center",
  };

  const overlayStyle: React.CSSProperties = {
    backgroundColor: config.overlayColor,
    opacity: config.overlayOpacity,
    borderRadius: "12px",
  };

  const textStyle: React.CSSProperties = {
    fontFamily: fontOpt.cssFamily,
    color: config.fontColor,
    lineHeight: 1.7,
    fontSize: "0.875rem",
  };

  return (
    <div className={embedMode ? "px-3 py-4" : ""}>
      <div className={`grid gap-8 ${embedMode ? "" : "md:grid-cols-[1fr_0.85fr]"} ${!embedMode ? "md:grid-cols-[1fr_0.85fr]" : ""}`}>
        {/* Left column: controls */}
        <div className="space-y-6 min-w-0">
          {/* Logo — marketing mode only */}
          {!embedMode && (
            <a href="/" className="inline-flex items-center gap-2 text-accent-900 hover:text-accent-700 transition-colors">
              <VowsLogo className="h-5 w-5" />
              <span className="font-serif text-lg">vows.you</span>
            </a>
          )}

          {/* Vow text editor */}
          <div>
            <label className="block text-sm font-medium text-base-700 mb-2">Your vows</label>
            <textarea
              value={vowText}
              onChange={(e) => setVowText(e.target.value)}
              placeholder="Paste or type your wedding vows here... (BBCode formatting supported: [b]bold[/b], [i]italic[/i], [h1]heading[/h1])"
              rows={embedMode ? 6 : 8}
              className="w-full rounded-xl border border-base-200 bg-white px-4 py-3 text-sm text-base-800 placeholder:text-base-400 focus:border-accent-400 focus:ring-2 focus:ring-accent-100 focus:outline-none resize-y"
            />
          </div>

          {/* Background picker */}
          <fieldset>
            <legend className="flex items-center gap-2 text-sm font-medium text-base-700 mb-3">
              <ImageIcon size={16} className="text-base-400" />
              Background
            </legend>
            <div className="grid grid-cols-5 gap-2">
              {BACKGROUNDS.map((preset) => (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => updateConfig({ bgId: preset.id })}
                  className={`relative aspect-4/3 rounded-lg overflow-hidden border-2 transition-all ${
                    config.bgId === preset.id
                      ? "border-accent-500 ring-2 ring-accent-200"
                      : "border-base-200 hover:border-base-300"
                  }`}
                  title={preset.label}
                >
                  {bgLoadErrors.has(preset.id) ? (
                    <div
                      className="absolute inset-0"
                      style={{ background: preset.gradient }}
                    />
                  ) : (
                    <img
                      src={preset.src}
                      alt={preset.label}
                      className="absolute inset-0 w-full h-full object-cover"
                      loading="lazy"
                      onError={() =>
                        setBgLoadErrors((prev) => new Set(prev).add(preset.id))
                      }
                    />
                  )}
                  <span className="sr-only">{preset.label}</span>
                </button>
              ))}
            </div>
          </fieldset>

          {/* Overlay controls */}
          <fieldset>
            <legend className="flex items-center gap-2 text-sm font-medium text-base-700 mb-3">
              <SlidersHorizontal size={16} className="text-base-400" />
              Card overlay
            </legend>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-base-500 mb-1">Color</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={config.overlayColor}
                    onChange={(e) => updateConfig({ overlayColor: e.target.value })}
                    className="h-8 w-8 rounded border border-base-200 cursor-pointer"
                  />
                  <span className="text-xs text-base-500 font-mono">{config.overlayColor}</span>
                </div>
              </div>
              <div>
                <label className="block text-xs text-base-500 mb-1">
                  Opacity ({Math.round(config.overlayOpacity * 100)}%)
                </label>
                <input
                  type="range"
                  min="0.35"
                  max="0.95"
                  step="0.01"
                  value={config.overlayOpacity}
                  onChange={(e) => updateConfig({ overlayOpacity: parseFloat(e.target.value) })}
                  className="w-full accent-accent-500"
                />
              </div>
            </div>
          </fieldset>

          {/* Typography */}
          <fieldset>
            <legend className="flex items-center gap-2 text-sm font-medium text-base-700 mb-3">
              <Type size={16} className="text-base-400" />
              Typography
            </legend>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-base-500 mb-1">Font</label>
                <div className="flex gap-1.5">
                  {FONT_OPTIONS.map((fo) => (
                    <button
                      key={fo.key}
                      type="button"
                      onClick={() => updateConfig({ fontKey: fo.key })}
                      className={`flex-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                        config.fontKey === fo.key
                          ? "bg-accent-500 text-white"
                          : "bg-base-100 text-base-600 hover:bg-base-200"
                      }`}
                      style={{ fontFamily: fo.cssFamily }}
                    >
                      {fo.label}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-xs text-base-500 mb-1">Text color</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={config.fontColor}
                    onChange={(e) => updateConfig({ fontColor: e.target.value })}
                    className="h-8 w-8 rounded border border-base-200 cursor-pointer"
                  />
                  <span className="text-xs text-base-500 font-mono">{config.fontColor}</span>
                </div>
              </div>
            </div>
          </fieldset>

          {/* Format selector */}
          <fieldset>
            <legend className="flex items-center gap-2 text-sm font-medium text-base-700 mb-3">
              <Palette size={16} className="text-base-400" />
              Format
            </legend>
            <div className="flex gap-2">
              {FORMAT_OPTIONS.map((fo) => (
                <button
                  key={fo.key}
                  type="button"
                  onClick={() => updateConfig({ format: fo.key })}
                  className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    config.format === fo.key
                      ? "bg-accent-500 text-white"
                      : "bg-base-100 text-base-600 hover:bg-base-200"
                  }`}
                >
                  {fo.label}
                </button>
              ))}
            </div>
          </fieldset>

          {/* Download CTA */}
          <div className="sticky bottom-4 z-10">
            <button
              type="button"
              onClick={handleDownload}
              disabled={!canDownload || generating}
              className={`w-full flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl text-sm font-semibold transition-all shadow-lg ${
                canDownload && !generating
                  ? "bg-accent-500 text-white hover:bg-accent-600 active:scale-[0.98]"
                  : "bg-base-200 text-base-400 cursor-not-allowed"
              }`}
            >
              {generating ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Generating PDF…
                </>
              ) : (
                <>
                  <Download size={18} />
                  Download PDF
                </>
              )}
            </button>

            {!canDownload && (
              <p className="text-xs text-base-400 text-center mt-2">
                Enter your vows above to enable download
              </p>
            )}

            {downloadNote && (
              <p className="text-xs text-base-500 text-center mt-2 bg-sand-50 rounded-lg px-3 py-2">
                {downloadNote}
              </p>
            )}
          </div>

          {/* Branding in marketing mode */}
          {!embedMode && brandMode && (
            <p className="text-xs text-base-400 text-center pt-2">
              Made with{" "}
              <a href="https://vows.you" className="underline hover:text-accent-500">
                vows.you
              </a>
            </p>
          )}
        </div>

        {/* Right column: preview (desktop only, non-embed) */}
        <div className={`hidden ${embedMode ? "" : "md:block"}`}>
          <div className="sticky top-28">
            <p className="text-xs font-medium text-base-500 mb-3 uppercase tracking-wide">
              Preview
            </p>
            {/* Card preview */}
            <div
              className="relative rounded-2xl overflow-hidden shadow-xl"
              style={{
                ...previewCardStyle,
                aspectRatio: config.format === "card" ? "4/6" : "5.5/8.5",
              }}
            >
              {/* Overlay */}
              <div className="absolute inset-3" style={overlayStyle} />
              {/* Text content */}
              <div
                className="absolute inset-3 p-5 overflow-hidden"
                style={textStyle}
              >
                {previewHtml ? (
                  <div
                    className="vc-preview-content"
                    dangerouslySetInnerHTML={{ __html: previewHtml }}
                  />
                ) : (
                  <p className="text-base-400 italic text-sm">
                    Your vows will appear here…
                  </p>
                )}
              </div>
              {/* Brand footer in preview */}
              {brandMode && (
                <div className="absolute bottom-4 left-0 right-0 text-center">
                  <span className="text-[9px] tracking-wide" style={{ color: "#aaa" }}>
                    Made with vows.you
                  </span>
                </div>
              )}
            </div>
            <p className="text-xs text-base-400 mt-3 text-center">
              Preview shows page 1. Download exports all pages.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
