"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { QRCodeSVG } from "qrcode.react";
import { t } from "@/lib/i18n";
import type { Language } from "@/lib/types";

const LANG_KEY = "ftc_lang";

function getStoredLang(): Language {
  if (typeof window === "undefined") return "en";
  const s = localStorage.getItem(LANG_KEY);
  return s === "zh" ? "zh" : "en";
}

function setStoredLang(l: Language) {
  localStorage.setItem(LANG_KEY, l);
}

export default function Landing() {
  const [lang, setLang] = useState<Language>("en");
  const [mounted, setMounted] = useState(false);
  const [formUrl, setFormUrl] = useState("");

  useEffect(() => {
    setMounted(true);
    setLang(getStoredLang());
    setFormUrl(`${window.location.origin}/form`);
  }, []);

  const switchLang = (l: Language) => {
    setLang(l);
    setStoredLang(l);
  };

  const sub = lang === "zh" ? "未来纪事报" : "The Future Chronicle";
  const footer =
    lang === "zh"
      ? "Built at TRAE Friends Zhengzhou"
      : "Built at TRAE Friends Zhengzhou";

  return (
    <main className="landing-body mx-auto w-full max-w-4xl px-4 py-8 sm:py-12 perspective-scene">
      {/* Top bar + language toggle */}
      <div className="flex items-center justify-between border-b border-current/30 pb-2 text-xs uppercase tracking-widest opacity-70 text-3d-engrave">
        <span>Est. Tomorrow</span>
        <span>{sub}</span>
        <div className="flex items-center gap-2">
          <span className="hidden sm:inline">No. ∞</span>
          {/* Language toggle — pill segmented control */}
          <div
            className="lang-toggle"
            role="group"
            aria-label={t(lang, "language")}
          >
            <button
              onClick={() => switchLang("en")}
              aria-pressed={lang === "en"}
              aria-label="English"
              className={lang === "en" ? "active" : ""}
            >
              EN
            </button>
            <button
              onClick={() => switchLang("zh")}
              aria-pressed={lang === "zh"}
              aria-label="中文"
              className={lang === "zh" ? "active" : ""}
            >
              中文
            </button>
          </div>
        </div>
      </div>

      {/* Masthead — 3D embossed Gothic */}
      <header className="masthead landing-head py-6 text-center sm:py-8 ornament-3d">
        <h1
          className="text-5xl font-black tracking-tight sm:text-7xl text-3d-emboss"
          style={{ color: "var(--ink)" }}
        >
          {t(lang, "appTitle")}
        </h1>
        <hr className="rule-3d my-3 mx-auto max-w-md" />
        <p className="mt-2 text-sm italic opacity-70 sm:text-base text-3d-engrave">
          {t(lang, "appSubtitle")}
        </p>
      </header>

      {/* Lead story — 3D card */}
      <section className="mt-8 grid grid-cols-1 gap-8 sm:grid-cols-[2fr_1fr]">
        <div className="p-6 relative" style={{ background: "var(--paper)" }}>
          <h2 className="landing-head text-3xl font-bold leading-tight sm:text-5xl text-3d-emboss">
            {t(lang, "leadHeadline")}
          </h2>
          <p className="mt-4 text-base leading-relaxed sm:text-lg text-3d-engrave">
            {t(lang, "leadSubhead")}
          </p>
          <p className="mt-4 text-base leading-relaxed">
            {t(lang, "landingBody")}
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-4">
            <a
              href="/form"
              className="btn-vintage btn-3d relative z-20 inline-flex items-center justify-center"
            >
              {t(lang, "cta")}
            </a>
            <span className="text-xs uppercase tracking-widest opacity-60 text-3d-engrave">
              {lang === "zh"
                ? "免费 · 双语 · AI 驱动"
                : "Free · Bilingual · AI-Powered"}
            </span>
          </div>
        </div>

        {/* QR + scan hint — 3D frame */}
        <div className="flex flex-col items-center justify-center gap-3 border-l-0 border-t border-current/20 pt-6 sm:border-l sm:border-t-0 sm:pt-0">
          {mounted && formUrl && (
            <div className="bg-white p-2 frame-3d">
              <QRCodeSVG value={formUrl} size={140} level="M" />
            </div>
          )}
          <p className="text-center text-xs uppercase tracking-widest opacity-70 text-3d-engrave">
            {t(lang, "scanToCreate")}
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-12 border-t border-current/30 pt-4 text-center text-xs uppercase tracking-widest opacity-60 text-3d-engrave">
        {footer}
      </footer>
    </main>
  );
}
