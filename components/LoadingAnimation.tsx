"use client";

import { useEffect, useState } from "react";
import type { Language } from "@/lib/types";
import { t } from "@/lib/i18n";

interface Props {
  language: Language;
  stage: "article" | "image";
}

const STAGES = {
  en: {
    article: [
      "Firing up the printing press...",
      "AI journalist is typing your story...",
      "Adding ink to the rollers...",
      "Typesetting your headline...",
      "Checking facts from the future...",
    ],
    image: [
      "Mixing sepia tones...",
      "Developing the photo...",
      "Framing the illustration...",
      "Adding vintage texture...",
      "Almost ready...",
    ],
  },
  zh: {
    article: [
      "启动印刷机...",
      "AI记者正在撰写你的故事...",
      "为滚筒添加墨水...",
      "排版你的标题...",
      "核实来自未来的事实...",
    ],
    image: [
      "调配复古色调...",
      "冲洗照片...",
      "装裱插图...",
      "添加复古纹理...",
      "即将完成...",
    ],
  },
};

export default function LoadingAnimation({ language, stage }: Props) {
  const [currentLine, setCurrentLine] = useState(0);
  const [displayText, setDisplayText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  const lines = STAGES[language][stage];

  useEffect(() => {
    const typeEffect = () => {
      const line = lines[currentLine];
      if (!isDeleting) {
        if (displayText.length < line.length) {
          setDisplayText(line.slice(0, displayText.length + 1));
          setTimeout(typeEffect, 50 + Math.random() * 50);
        } else {
          setTimeout(() => setIsDeleting(true), 1500);
        }
      } else {
        if (displayText.length > 0) {
          setDisplayText(line.slice(0, displayText.length - 1));
          setTimeout(typeEffect, 30);
        } else {
          setIsDeleting(false);
          setCurrentLine((prev) => (prev + 1) % lines.length);
        }
      }
    };

    const timer = setTimeout(typeEffect, 300);
    return () => clearTimeout(timer);
  }, [currentLine, displayText, isDeleting, lines]);

  const lang = language;
  const bodyClass = lang === "zh" ? "newspaper-body-zh" : "newspaper-body";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--paper)]/95 backdrop-blur-sm">
      <div className="flex flex-col items-center">
        <div className="relative mb-8">
          <svg
            width="120"
            height="120"
            viewBox="0 0 120 120"
            className="drop-shadow-lg"
          >
            <rect
              x="20"
              y="10"
              width="80"
              height="100"
              rx="2"
              fill="#e8dcc8"
              stroke="#3d3d3d"
              strokeWidth="2"
            />
            <rect
              x="25"
              y="15"
              width="70"
              height="90"
              fill="#f4ead5"
              stroke="#3d3d3d"
              strokeWidth="1"
            />
            {[25, 35, 45, 55, 65, 75, 85, 95].map((y, i) => (
              <line
                key={i}
                x1="30"
                y1={y}
                x2="90"
                y2={y}
                stroke="#3d3d3d"
                strokeWidth="0.5"
                opacity={0.3 + Math.sin(Date.now() / 500 + i) * 0.1}
                className="animate-pulse"
                style={{ animationDelay: `${i * 100}ms` }}
              />
            ))}
            <rect
              x="40"
              y="40"
              width="40"
              height="30"
              fill="none"
              stroke="#3d3d3d"
              strokeWidth="1"
            />
            <circle
              cx="60"
              cy="95"
              r="10"
              fill="#3d3d3d"
              className="animate-spin"
              style={{ animationDuration: "3s" }}
            />
            <circle cx="60" cy="95" r="6" fill="#e8dcc8" />
          </svg>

          <div className="absolute -top-8 left-1/2 -translate-x-1/2">
            <div className="flex items-center gap-2">
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className="w-2 h-2 rounded-full bg-[var(--ink)] animate-bounce"
                  style={{
                    animationDelay: `${i * 150}ms`,
                    opacity: 0.3 + (i % 2) * 0.4,
                  }}
                />
              ))}
            </div>
          </div>
        </div>

        <div
          className={`${bodyClass} text-lg sm:text-xl font-medium tracking-wider mb-4`}
          style={{ color: "var(--ink)" }}
        >
          {stage === "article"
            ? t(lang, "generatingArticle")
            : t(lang, "generatingImage")}
        </div>

        <div className="relative">
          <p
            className={`${bodyClass} text-sm sm:text-base text-center min-h-[2rem] px-4`}
            style={{ color: "var(--ink)", opacity: 0.8 }}
          >
            {displayText}
            <span className="inline-block w-2 h-4 ml-1 bg-[var(--ink)] animate-pulse" />
          </p>

          <div className="mt-4 flex justify-center gap-1">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="w-3 h-3 rounded-full bg-[var(--ink)] animate-pulse"
                style={{
                  animationDelay: `${i * 200}ms`,
                  opacity: stage === "article" ? 0.8 : 0.6,
                }}
              />
            ))}
          </div>
        </div>

        <div
          className={`${bodyClass} mt-8 text-xs uppercase tracking-widest opacity-50`}
        >
          {lang === "zh" ? "来自未来的电讯" : "Dispatches from tomorrow"}
        </div>
      </div>
    </div>
  );
}