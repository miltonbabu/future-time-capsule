"use client";

import { forwardRef } from "react";
import type { SharedNewspaper } from "@/lib/types";
import { formatDate, t, yearEra } from "@/lib/i18n";

interface Props {
  newspaper: SharedNewspaper;
}

const ShareCard = forwardRef<HTMLDivElement, Props>(({ newspaper }, ref) => {
  const lang = newspaper.input.language;
  const year = new Date(newspaper.input.futureDate).getFullYear() || 2035;
  const era = yearEra(year);

  const headClass = lang === "zh" ? "newspaper-head-zh" : "newspaper-head";
  const bodyClass = lang === "zh" ? "newspaper-body-zh" : "newspaper-body";

  return (
    <div className={`era-${era} w-full`}>
      <div
        ref={ref}
        className="paper-bg paper-3d mx-auto max-w-sm rounded-lg overflow-hidden shadow-2xl"
        style={{ background: "var(--paper)" }}
      >
        <div className="relative aspect-video overflow-hidden bg-black/10">
          {newspaper.imageUrl ? (
            <img
              src={newspaper.imageUrl}
              alt={newspaper.article.image_prompt}
              className="illustration-filter w-full h-full object-cover"
              crossOrigin="anonymous"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <div className="text-center opacity-30">
                <div className="text-4xl mb-2">📰</div>
                <p className={`${bodyClass} text-xs`}>{t(lang, "noImage")}</p>
              </div>
            </div>
          )}

          <div className="absolute top-3 left-3 right-3 flex justify-between items-start">
            <div className="bg-black/60 backdrop-blur-sm px-2 py-1 rounded text-white text-xs">
              {t(lang, "appTitle")}
            </div>
            <div className="bg-black/60 backdrop-blur-sm px-2 py-1 rounded text-white text-xs">
              {formatDate(newspaper.input.futureDate, lang)}
            </div>
          </div>

          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-3">
            <p className={`${bodyClass} text-white/80 text-xs`}>
              {newspaper.input.location || "Zhengzhou, China"}
            </p>
          </div>
        </div>

        <div className="p-4">
          <h2
            className={`${headClass} text-lg font-bold leading-tight line-clamp-2 mb-2`}
            style={{ color: "var(--ink)" }}
          >
            {newspaper.article.headline}
          </h2>

          <div className="flex items-center gap-2 mb-3">
            {newspaper.photoDataUrl && (
              <img
                src={newspaper.photoDataUrl}
                alt={newspaper.input.name}
                className="w-8 h-8 rounded-full sepia-photo object-cover border-2 border-white shadow-sm"
              />
            )}
            <div className="flex-1 min-w-0">
              <p className={`${bodyClass} text-sm font-medium truncate`} style={{ color: "var(--ink)" }}>
                {newspaper.input.name}
              </p>
              <p className={`${bodyClass} text-xs opacity-60`}>{newspaper.input.team}</p>
            </div>
          </div>

          <p
            className={`${bodyClass} text-sm opacity-70 line-clamp-3 mb-3`}
            style={{ color: "var(--ink)" }}
          >
            {newspaper.article.paragraph1}
          </p>

          <div className="flex items-center justify-between pt-3 border-t border-black/10">
            <div className="flex items-center gap-1">
              <span className={`${bodyClass} text-xs opacity-50`}>🏆</span>
              <span className={`${bodyClass} text-xs opacity-50 truncate max-w-[120px]`}>
                {newspaper.input.achievement}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-black/5 transition-colors">
                <span className="text-sm">👍</span>
              </button>
              <button className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-black/5 transition-colors">
                <span className="text-sm">💬</span>
              </button>
              <button className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-black/5 transition-colors">
                <span className="text-sm">🔗</span>
              </button>
            </div>
          </div>
        </div>

        <div className="px-4 pb-4">
          <div className="bg-black/5 rounded px-3 py-2 flex items-center gap-2">
            <span className="text-xs opacity-50">📝</span>
            <span
              className={`${bodyClass} text-xs italic opacity-60`}
              style={{ color: "var(--accent)" }}
            >
              "{newspaper.article.future_quote.slice(0, 30)}..."
            </span>
          </div>
        </div>
      </div>
    </div>
  );
});

ShareCard.displayName = "ShareCard";

export default ShareCard;