"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { QRCodeSVG } from "qrcode.react";
import { toPng } from "html-to-image";
import type { SharedNewspaper } from "@/lib/types";
import { formatDate, t, yearEra } from "@/lib/i18n";
import ShareCard from "./ShareCard";

type ViewMode = "newspaper" | "card";

interface Props {
  newspaper: SharedNewspaper;
  shareToken?: string;
  onReset?: () => void;
}

export default function Newspaper({ newspaper, shareToken, onReset }: Props) {
  const articleRef = useRef<HTMLElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const [origin, setOrigin] = useState("");
  const [copied, setCopied] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>("newspaper");

  const lang = newspaper.input.language;
  const year = new Date(newspaper.input.futureDate).getFullYear() || 2035;
  const era = yearEra(year);
  const shareUrl = shareToken ? `${origin}/share/${shareToken}` : "";

  // Hydration-safe: compute origin only on client.
  useEffect(() => {
    setOrigin(window.location.origin);
  }, []);

  const copyLink = async () => {
    if (!shareUrl) return;
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard unavailable */
    }
  };

  const handleDownload = async () => {
    const node =
      viewMode === "newspaper" ? articleRef.current : cardRef.current;
    if (!node) {
      alert(
        lang === "zh"
          ? "下载失败：未找到内容"
          : "Download failed: Content not found",
      );
      return;
    }
    setDownloading(true);

    try {
      // 1. Wait for Google Fonts to be ready so text renders correctly.
      if (document.fonts && document.fonts.ready) {
        await document.fonts.ready;
      }

      // 2. Build a completely flat off-screen wrapper (no perspective, no 3D).
      const wrapper = document.createElement("div");
      wrapper.dataset.downloadWrapper = "true";
      wrapper.style.position = "fixed";
      wrapper.style.left = "-9999px";
      wrapper.style.top = "0";
      wrapper.style.width = node.offsetWidth + "px";
      wrapper.style.zIndex = "-1";
      wrapper.style.background = "#e8dcc8";
      wrapper.style.perspective = "none";
      wrapper.style.transform = "none";
      wrapper.style.margin = "0";
      wrapper.style.padding = "0";
      document.body.appendChild(wrapper);

      // 3. Clone the newspaper/card node.
      const clone = node.cloneNode(true) as HTMLElement;
      wrapper.appendChild(clone);

      // 4. Aggressively strip every 3D / perspective / transform style.
      const allEls = clone.querySelectorAll<HTMLElement>("*");
      allEls.forEach((el) => {
        // Remove 3D classes.
        el.classList.remove(
          "paper-3d",
          "frame-3d",
          "text-3d-emboss",
          "text-3d-engrave",
          "rule-3d",
          "quote-3d",
          "btn-3d",
          "ornament-3d",
          "perspective-scene",
        );

        // Reset transforms and 3D CSS.
        el.style.transform = "none";
        el.style.transformStyle = "flat";
        el.style.perspective = "none";
        el.style.transformOrigin = "center center";

        // Replace complex layered shadows with a simple subtle one.
        const cs = window.getComputedStyle(el);
        if (cs.boxShadow && cs.boxShadow !== "none") {
          el.style.boxShadow = "0 1px 4px rgba(0,0,0,0.12)";
        }

        // Flatten multi-column layout for a clean single-column capture.
        if (el.classList.contains("cols-2")) {
          el.style.columnCount = "1";
          el.style.columnRule = "none";
          el.style.columnGap = "0";
        }

        // Remove polaroid rotation.
        if (el.classList.contains("polaroid-frame")) {
          el.style.transform = "none";
        }

        // Remove drop-cap pseudo-effect.
        if (el.classList.contains("drop-cap")) {
          el.classList.remove("drop-cap");
        }

        // Neutralise background images that could break SVG serialisation.
        if (cs.backgroundImage && cs.backgroundImage !== "none") {
          el.style.backgroundImage = "none";
          el.style.backgroundColor = "transparent";
        }
      });

      // Also strip top-level clone styles.
      clone.style.transform = "none";
      clone.style.transformStyle = "flat";
      clone.style.perspective = "none";
      clone.style.boxShadow = "none";
      clone.style.margin = "0";
      clone.style.maxWidth = "none";
      clone.style.width = node.offsetWidth + "px";
      clone.style.background = "#e8dcc8";

      // 5. Convert every image to a data URL so CORS can never taint the canvas.
      const imgs = Array.from(clone.querySelectorAll<HTMLImageElement>("img"));
      await Promise.all(
        imgs.map(async (img) => {
          const rawSrc = img.getAttribute("src") || "";

          // Already inline — nothing to do.
          if (!rawSrc || rawSrc.startsWith("data:")) return;

          // Try fetch → FileReader first (works for same-origin + CORS-enabled).
          try {
            const res = await fetch(rawSrc, {
              mode: "cors",
              cache: "force-cache",
            });
            if (res.ok) {
              const blob = await res.blob();
              const dataUrl = await new Promise<string>((resolve, reject) => {
                const r = new FileReader();
                r.onload = () => resolve(r.result as string);
                r.onerror = reject;
                r.readAsDataURL(blob);
              });
              img.src = dataUrl;
              return;
            }
          } catch {
            /* fetch failed — try canvas fallback below */
          }

          // Canvas fallback: draw the already-loaded original image.
          try {
            const original = Array.from(node.querySelectorAll("img")).find(
              (o) => (o.getAttribute("src") || "") === rawSrc,
            ) as HTMLImageElement | undefined;

            if (
              original &&
              original.complete &&
              original.naturalWidth > 0
            ) {
              const canvas = document.createElement("canvas");
              canvas.width = original.naturalWidth;
              canvas.height = original.naturalHeight;
              const ctx = canvas.getContext("2d");
              if (ctx) {
                ctx.drawImage(original, 0, 0);
                img.src = canvas.toDataURL("image/png");
                return;
              }
            }
          } catch {
            /* canvas fallback failed */
          }

          // Nothing worked — hide the image so it can't break the capture.
          img.style.display = "none";
        }),
      );

      // 6. Wait for every remaining image to decode / load inside the clone.
      await Promise.all(
        imgs
          .filter((img) => img.style.display !== "none")
          .map((img) => {
            if (img.decode) {
              return img.decode().catch(() => {});
            }
            return new Promise<void>((resolve) => {
              if (img.complete) resolve();
              else {
                img.onload = () => resolve();
                img.onerror = () => resolve();
              }
            });
          }),
      );

      // 7. Give the browser a moment to finish layout / rasterisation.
      await new Promise((r) => setTimeout(r, 800));

      // 8. Capture the flattened clone.
      const dataUrl = await toPng(clone, {
        cacheBust: true,
        pixelRatio: 2,
        backgroundColor: "#e8dcc8",
        skipFonts: false,
      });

      // 9. Trigger download.
      const link = document.createElement("a");
      link.style.display = "none";
      const suffix = viewMode === "card" ? "-card" : "";
      link.download = `future-chronicle-${newspaper.input.name || "newspaper"}${suffix}.png`;
      link.href = dataUrl;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (e) {
      console.error("First download attempt failed:", e);

      // Fallback: capture the original node with skipFonts.
      try {
        const dataUrl = await toPng(node, {
          cacheBust: true,
          pixelRatio: 2,
          backgroundColor: "#e8dcc8",
          skipFonts: true,
        });

        const link = document.createElement("a");
        link.style.display = "none";
        const suffix = viewMode === "card" ? "-card" : "";
        link.download = `future-chronicle-${newspaper.input.name || "newspaper"}${suffix}.png`;
        link.href = dataUrl;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } catch (fallbackError) {
        console.error("Fallback download failed:", fallbackError);
        alert(
          lang === "zh"
            ? "下载失败，请截图保存。"
            : "Download failed — please take a screenshot instead.",
        );
      }
    } finally {
      // 10. Clean up the off-screen wrapper.
      const w = document.querySelector('div[data-download-wrapper="true"]');
      if (w && w.parentNode) {
        w.parentNode.removeChild(w);
      }
      setDownloading(false);
    }
  };

  const headClass = lang === "zh" ? "newspaper-head-zh" : "newspaper-head";
  const bodyClass = lang === "zh" ? "newspaper-body-zh" : "newspaper-body";

  return (
    <div className={`era-${era} fade-in w-full perspective-scene`}>
      {viewMode === "newspaper" ? (
        <article
          ref={articleRef}
          className="paper-bg paper-3d mx-auto max-w-3xl p-6 sm:p-10"
          style={{ background: "var(--paper)" }}
        >
          {/* Masthead */}
          <header className="masthead py-4 text-center ornament-3d">
            <div
              className={`${bodyClass} flex justify-between text-xs uppercase tracking-widest opacity-70 text-3d-engrave`}
            >
              <span>{formatDate(newspaper.input.futureDate, lang)}</span>
              <span>{t(lang, "price")}</span>
            </div>
            <h1
              className={`${headClass} mt-2 text-4xl sm:text-6xl font-black tracking-tight text-3d-emboss`}
              style={{ color: "var(--ink)" }}
            >
              {t(lang, "appTitle")}
            </h1>
            <p
              className={`${bodyClass} mt-1 text-xs sm:text-sm italic opacity-70 text-3d-engrave`}
            >
              {t(lang, "appSubtitle")}
            </p>
            <hr className="rule-3d my-2" />
            <div
              className={`${bodyClass} flex justify-between text-xs uppercase tracking-widest opacity-70 text-3d-engrave`}
            >
              <span>
                {t(lang, "vol")} {year} {t(lang, "edition")}
              </span>
              <span>{t(lang, "theFuture")}</span>
            </div>
            <div
              className={`${bodyClass} flex justify-between text-xs uppercase tracking-widest opacity-60 mt-1 text-3d-engrave`}
            >
              <span>{newspaper.input.location || "Zhengzhou, China"}</span>
              <span>{t(lang, "price")}</span>
            </div>
          </header>

          <div className="mt-4 text-center">
            <p
              className={`${bodyClass} text-xs sm:text-sm italic opacity-80 tracking-wide text-3d-engrave`}
            >
              "{t(lang, "tagline")}"
            </p>
          </div>

          {/* Headline + byline + photo */}
          <div className="mt-6">
            <div className="text-center">
              <h2
                className={`${headClass} text-2xl sm:text-3xl md:text-5xl font-bold leading-tight text-3d-emboss`}
                style={{ color: "var(--ink)" }}
              >
                {newspaper.article.headline}
              </h2>
              <p
                className={`${bodyClass} mt-3 text-xs sm:text-sm uppercase tracking-widest opacity-70 text-3d-engrave`}
              >
                {t(lang, "byline")} — {t(lang, "published")}{" "}
                {formatDate(newspaper.input.futureDate, lang)}
              </p>
            </div>
            {newspaper.photoDataUrl && (
              <div className="mt-4 flex justify-center">
                <div className="polaroid-frame frame-3d w-20 sm:w-24 md:w-32">
                  <img
                    src={newspaper.photoDataUrl}
                    alt={newspaper.input.name}
                    className="sepia-photo"
                  />
                  <p
                    className={`${bodyClass} mt-2 text-center text-[10px] italic opacity-70 text-3d-engrave`}
                  >
                    {newspaper.input.name}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Full-width AI illustration banner */}
          {newspaper.imageUrl && (
            <div className="mt-6">
              <div className="frame-3d overflow-hidden">
                <img
                  src={newspaper.imageUrl}
                  alt={newspaper.article.image_prompt}
                  className="illustration-filter w-full object-cover"
                  style={{ maxHeight: 220 }}
                  crossOrigin="anonymous"
                />
              </div>
              <p
                className={`${bodyClass} mt-1 text-center text-xs italic opacity-60 text-3d-engrave`}
              >
                {lang === "zh" ? "AI 插图" : "AI Illustration"}
              </p>
            </div>
          )}

          {/* Article body — 2 columns with drop cap */}
          <div
            className={`${bodyClass} cols-2 mt-6 text-sm sm:text-base leading-relaxed justify-news`}
            style={{ color: "var(--ink)" }}
          >
            <p className="drop-cap mb-3">{newspaper.article.paragraph1}</p>
            <p className="mb-3">{newspaper.article.paragraph2}</p>
            <p className="mb-3">{newspaper.article.paragraph3}</p>
          </div>

          {/* Pull quote — 3D raised panel */}
          <blockquote
            className={`${headClass} quote-3d my-6 text-center text-xl sm:text-2xl italic p-4`}
            style={{ color: "var(--accent)" }}
          >
            &ldquo;{newspaper.article.future_quote}&rdquo;
            <footer
              className={`${bodyClass} mt-2 text-xs not-italic uppercase tracking-widest opacity-70 text-3d-engrave`}
            >
              — {newspaper.input.name}
            </footer>
          </blockquote>

          {/* Reward — 3D panel */}
          <div className={`${bodyClass} quote-3d my-4 text-sm p-4`}>
            <span
              className="font-bold uppercase tracking-widest mr-2 text-3d-emboss"
              style={{ color: "var(--accent)" }}
            >
              {t(lang, "reward")}:
            </span>
            {newspaper.article.reward}
          </div>

          {/* Memory — 3D panel */}
          {newspaper.input.memory && (
            <div className={`${bodyClass} quote-3d my-4 text-sm p-4`}>
              <span
                className="font-bold uppercase tracking-widest mr-2 text-3d-emboss"
                style={{ color: "var(--accent)" }}
              >
                {t(lang, "memory")}:
              </span>
              {newspaper.input.memory}
            </div>
          )}
        </article>
      ) : (
        <ShareCard ref={cardRef} newspaper={newspaper} />
      )}

      {/* View mode toggle */}
      <div className="mx-auto mt-4 flex max-w-3xl flex-wrap items-center justify-center gap-2">
        <button
          onClick={() => setViewMode("newspaper")}
          className={`btn-3d text-xs sm:text-sm px-3 sm:px-4 transition-all ${
            viewMode === "newspaper"
              ? "btn-vintage"
              : "btn-outline opacity-60 hover:opacity-100"
          }`}
        >
          {t(lang, "viewNewspaper")}
        </button>
        <button
          onClick={() => setViewMode("card")}
          className={`btn-3d text-xs sm:text-sm px-3 sm:px-4 transition-all ${
            viewMode === "card"
              ? "btn-vintage"
              : "btn-outline opacity-60 hover:opacity-100"
          }`}
        >
          {t(lang, "viewCard")}
        </button>
      </div>

      {/* Action bar — 3D buttons */}
      <div className="mx-auto mt-4 flex max-w-3xl flex-wrap items-center justify-center gap-2 sm:gap-3">
        {shareToken && (
          <button
            onClick={copyLink}
            className="btn-vintage btn-3d text-xs sm:text-sm px-3 sm:px-4"
          >
            {copied ? t(lang, "copied") : t(lang, "copyLink")}
          </button>
        )}
        <button
          onClick={handleDownload}
          className="btn-vintage btn-3d text-xs sm:text-sm px-3 sm:px-4"
          disabled={downloading}
        >
          {downloading ? "..." : t(lang, "download")}
        </button>
        {onReset && (
          <button
            onClick={onReset}
            className="btn-outline btn-3d text-xs sm:text-sm px-3 sm:px-4"
          >
            {t(lang, "createAnother")}
          </button>
        )}
        <Link
          href="/"
          className="btn-outline btn-3d text-xs sm:text-sm px-3 sm:px-4"
        >
          {t(lang, "home")}
        </Link>
      </div>

      {/* QR code */}
      {shareUrl && (
        <div className="mx-auto mt-6 flex max-w-3xl flex-col items-center gap-2 px-4">
          <div className="bg-white p-2 frame-3d">
            <QRCodeSVG value={shareUrl} size={120} level="M" />
          </div>
          <p className={`${bodyClass} text-xs opacity-70`}>
            {t(lang, "scanToView")}
          </p>
          <p
            className={`${bodyClass} text-xs break-all opacity-50 max-w-xs text-center`}
          >
            {shareUrl}
          </p>
        </div>
      )}
    </div>
  );
}
