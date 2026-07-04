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
    if (!node) return;
    setDownloading(true);
    const clone = node.cloneNode(true) as HTMLElement;
    clone.style.position = "fixed";
    clone.style.left = "-9999px";
    clone.style.top = "0";
    clone.style.width = node.offsetWidth + "px";
    clone.style.backgroundImage = "none";
    clone.style.backgroundColor = "#f4ead5";
    clone.style.backgroundBlendMode = "normal";

    const styled = clone.querySelectorAll<HTMLElement>("*");
    styled.forEach((el) => {
      try {
        const cs = window.getComputedStyle(el);
        if (cs.columnCount && cs.columnCount !== "1") {
          el.style.columnCount = "1";
          el.style.columnRule = "none";
          el.style.columnGap = "0";
        }
        if (cs.backgroundImage && cs.backgroundImage !== "none") {
          el.style.backgroundImage = "none";
          el.style.backgroundColor = "#f4ead5";
        }
      } catch {
        /* ignore CSS access errors */
      }
      if (el.classList.contains("drop-cap")) {
        el.classList.remove("drop-cap");
      }
      if (el.classList.contains("polaroid-frame")) {
        el.style.transform = "none";
      }
      if (
        el.classList.contains("paper-3d") ||
        el.classList.contains("frame-3d")
      ) {
        el.style.transform = "none";
        el.style.transformStyle = "flat";
      }
    });

    const imgs = Array.from(clone.querySelectorAll("img"));
    await Promise.all(
      imgs.map(async (img) => {
        const src = img.src;
        if (src.startsWith("data:")) return;
        try {
          const res = await fetch(src, { mode: "cors" });
          const blob = await res.blob();
          const dataUrl = await new Promise<string>((resolve, reject) => {
            const r = new FileReader();
            r.onload = () => resolve(r.result as string);
            r.onerror = reject;
            r.readAsDataURL(blob);
          });
          img.src = dataUrl;
          img.crossOrigin = "anonymous";
        } catch {
          img.style.display = "none";
        }
      }),
    );

    document.body.appendChild(clone);
    try {
      await new Promise((r) => setTimeout(r, 150));
      const dataUrl = await toPng(clone, {
        cacheBust: true,
        pixelRatio: 2,
        backgroundColor: "#f4ead5",
      });
      const link = document.createElement("a");
      const suffix = viewMode === "card" ? "-card" : "";
      link.download = `future-chronicle-${newspaper.input.name || "newspaper"}${suffix}.png`;
      link.href = dataUrl;
      link.click();
    } catch (e) {
      try {
        const dataUrl = await toPng(clone, {
          cacheBust: true,
          pixelRatio: 2,
          backgroundColor: "#f4ead5",
          skipFonts: true,
        });
        const link = document.createElement("a");
        const suffix = viewMode === "card" ? "-card" : "";
        link.download = `future-chronicle-${newspaper.input.name || "newspaper"}${suffix}.png`;
        link.href = dataUrl;
        link.click();
      } catch (fallbackError) {
        alert(
          lang === "zh"
            ? "下载失败，请截图保存。"
            : "Download failed — please take a screenshot instead.",
        );
        console.error(fallbackError);
      }
    } finally {
      document.body.removeChild(clone);
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

          {/* Headline + byline */}
          <div className="mt-6 text-center">
            <h2
              className={`${headClass} text-3xl sm:text-5xl font-bold leading-tight text-3d-emboss`}
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

          {/* Photos: 3D frame + AI illustration */}
          <div className="mt-6 flex flex-col items-center gap-4 sm:flex-row sm:justify-center sm:gap-6">
            {newspaper.photoDataUrl && (
              <div className="polaroid-frame frame-3d w-36 sm:w-44 shrink-0">
                <img
                  src={newspaper.photoDataUrl}
                  alt={newspaper.input.name}
                  className="sepia-photo"
                />
                <p
                  className={`${bodyClass} mt-2 text-center text-xs italic opacity-70 text-3d-engrave`}
                >
                  {newspaper.input.name} · {newspaper.input.team}
                </p>
              </div>
            )}
            {newspaper.imageUrl && (
              <div className="frame-3d w-40 sm:w-56 shrink-0 overflow-hidden">
                <img
                  src={newspaper.imageUrl}
                  alt={newspaper.article.image_prompt}
                  className="illustration-filter w-full object-cover"
                  style={{ maxHeight: 200 }}
                  crossOrigin="anonymous"
                />
                <p
                  className={`${bodyClass} mt-1 text-center text-xs italic opacity-60 text-3d-engrave`}
                >
                  {lang === "zh" ? "AI 插图" : "AI Illustration"}
                </p>
              </div>
            )}
          </div>

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
