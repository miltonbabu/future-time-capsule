"use client";

import { useState } from "react";
import Link from "next/link";
import type { SharedNewspaper } from "@/lib/types";
import { removeCapsule, loadCapsules } from "@/lib/storage";
import { formatDate, t, yearEra } from "@/lib/i18n";
import Newspaper from "./Newspaper";

interface CapsuleGalleryProps {
  language: string;
}

const typewriterFont = '"Courier Prime", "Special Elite", "Courier New", monospace';

export default function CapsuleGallery({ language }: CapsuleGalleryProps) {
  const [capsules, setCapsules] = useState<SharedNewspaper[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const lang = language as "en" | "zh";

  if (loading) {
    const saved = loadCapsules();
    setCapsules(saved);
    setLoading(false);
  }

  const handleDelete = (id: string) => {
    const updated = removeCapsule(id);
    setCapsules(updated);
    if (selectedId === id) {
      setSelectedId(null);
    }
  };

  const selectedCapsule = capsules.find((c) => c.id === selectedId);

  if (capsules.length === 0) {
    return (
      <div className="mx-auto max-w-2xl p-8 text-center">
        <div
          className="text-4xl mb-4"
          style={{ fontFamily: typewriterFont, color: "var(--accent)" }}
        >
          [ NEWSPAPER STACK EMPTY ]
        </div>
        <h2
          className="text-xl mb-2"
          style={{ fontFamily: typewriterFont, color: "var(--ink)", letterSpacing: "0.1em" }}
        >
          {t(lang, "myNewspapers").toUpperCase()}
        </h2>
        <p
          className="mb-6 text-sm opacity-70"
          style={{ fontFamily: typewriterFont, color: "var(--ink)" }}
        >
          {t(lang, "noSaved")}
        </p>
        <Link href="/form" className="btn-vintage">
          {t(lang, "generate")}
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl p-4">
      <div className="flex items-center justify-between mb-6">
        <h2
          className="text-2xl"
          style={{ fontFamily: typewriterFont, color: "var(--ink)", letterSpacing: "0.1em" }}
        >
          {t(lang, "myNewspapers").toUpperCase()}
        </h2>
        <Link href="/form" className="btn-outline">
          {t(lang, "generate")}
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {capsules.map((capsule) => {
          const year = new Date(capsule.input.futureDate).getFullYear();
          const era = yearEra(year);
          const isSelected = selectedId === capsule.id;

          return (
            <div
              key={capsule.id}
              className={`era-${era} paper-3d rounded-sm overflow-hidden cursor-pointer transition-all`}
              style={{
                background: "var(--paper)",
                fontFamily: typewriterFont,
              }}
              onClick={() => setSelectedId(isSelected ? null : capsule.id)}
            >
              <div className="p-4">
                {capsule.photoDataUrl && (
                  <div className="polaroid-frame w-full mb-3">
                    <img
                      src={capsule.photoDataUrl}
                      alt={capsule.input.name}
                      className="sepia-photo"
                    />
                  </div>
                )}

                <h3
                  className="text-lg font-bold mb-1 line-clamp-2"
                  style={{ color: "var(--ink)", letterSpacing: "0.05em" }}
                >
                  {capsule.article.headline.toUpperCase()}
                </h3>

                <p
                  className="text-xs opacity-70 mb-2"
                  style={{ color: "var(--ink)" }}
                >
                  {capsule.input.name} | {capsule.input.team}
                </p>

                <p
                  className="text-xs opacity-60 mb-3"
                  style={{ color: "var(--ink)" }}
                >
                  {formatDate(capsule.input.futureDate, lang)}
                </p>

                <div className="flex items-center justify-between">
                  <span
                    className="text-xs uppercase tracking-wider opacity-50"
                    style={{ color: "var(--ink)" }}
                  >
                    [{categoryName(capsule.input.category, lang).toUpperCase()}]
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(capsule.id);
                    }}
                    className="text-xs uppercase tracking-wider opacity-50 hover:opacity-100 transition-opacity"
                    style={{ color: "var(--accent)" }}
                  >
                    DELETE
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {selectedCapsule && (
        <div className="mt-8 fade-in">
          <Newspaper
            newspaper={selectedCapsule}
            onReset={() => setSelectedId(null)}
          />
        </div>
      )}
    </div>
  );
}

function categoryName(id: string, lang: "en" | "zh"): string {
  const categories: Record<string, { en: string; zh: string }> = {
    tech: { en: "Tech", zh: "科技" },
    ai: { en: "AI", zh: "AI" },
    money: { en: "Money", zh: "金钱" },
    time: { en: "Time", zh: "时间" },
    all: { en: "General", zh: "综合" },
  };
  return categories[id]?.[lang] || id;
}