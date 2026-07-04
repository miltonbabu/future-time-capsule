"use client";

import { useEffect, useRef, useState } from "react";
import type { CapsuleInput, Language } from "@/lib/types";
import { CATEGORIES, t } from "@/lib/i18n";
import { compressImage } from "@/lib/storage";
import { ACHIEVEMENT_POOLS } from "@/lib/achievements";
import LoadingAnimation from "./LoadingAnimation";

interface Props {
  language: Language;
  onLanguageChange: (l: Language) => void;
  onGenerate: (input: CapsuleInput, photoDataUrl: string) => void;
  loading: boolean;
  loadingStage: "article" | "image";
}

export default function CapsuleForm({
  language,
  onLanguageChange,
  onGenerate,
  loading,
  loadingStage,
}: Props) {
  const [name, setName] = useState("");
  const [team, setTeam] = useState("");
  const [achievement, setAchievement] = useState("");
  const [futureDate, setFutureDate] = useState("");
  const [category, setCategory] = useState("all");
  const [photo, setPhoto] = useState("");
  const [location, setLocation] = useState("");
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [surpriseLoading, setSurpriseLoading] = useState(false);
  const cameraRef = useRef<HTMLInputElement>(null);
  const galleryRef = useRef<HTMLInputElement>(null);

  const lang = language;

  // Default future date to ~10 years out.
  useEffect(() => {
    if (!futureDate) {
      const d = new Date();
      d.setFullYear(d.getFullYear() + 10);
      setFutureDate(d.toISOString().slice(0, 10));
    }
  }, [futureDate]);

  const handlePhoto = async (file: File | undefined) => {
    if (!file) return;
    try {
      const dataUrl = await compressImage(file);
      setPhoto(dataUrl);
      setFieldErrors((p) => ({ ...p, photo: "" }));
    } catch {
      setError(lang === "zh" ? "图片处理失败。" : "Photo processing failed.");
    }
  };

  const surprise = async () => {
    setSurpriseLoading(true);
    setError("");
    try {
      const res = await fetch("/api/generate-achievement", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ category, language: lang }),
      });
      const data = await res.json();
      const list: string[] | null = data.achievements;
      const pool =
        ACHIEVEMENT_POOLS[lang][category] || ACHIEVEMENT_POOLS[lang].all;
      const pick = list && list.length ? list : pool;
      const choice = pick[Math.floor(Math.random() * pick.length)];
      setAchievement(choice);
    } catch {
      const pool =
        ACHIEVEMENT_POOLS[lang][category] || ACHIEVEMENT_POOLS[lang].all;
      setAchievement(pool[Math.floor(Math.random() * pool.length)]);
    } finally {
      setSurpriseLoading(false);
    }
  };

  // Inline validation on blur — shows error only after user leaves the field.
  const validateOnBlur = (field: string) => {
    const errs = { ...fieldErrors };
    if (field === "name") {
      errs.name = name.trim() ? "" : t(lang, "requiredFields");
    } else if (field === "team") {
      errs.team = team.trim() ? "" : t(lang, "requiredFields");
    } else if (field === "achievement") {
      errs.achievement = achievement.trim() ? "" : t(lang, "requiredFields");
    } else if (field === "photo") {
      errs.photo = photo ? "" : t(lang, "photoRequired");
    } else if (field === "date") {
      errs.date = futureDate ? "" : t(lang, "dateRequired");
    }
    setFieldErrors(errs);
  };

  const submit = () => {
    const errs: Record<string, string> = {};
    if (!name.trim()) errs.name = t(lang, "requiredFields");
    if (!team.trim()) errs.team = t(lang, "requiredFields");
    if (!achievement.trim()) errs.achievement = t(lang, "requiredFields");
    if (!photo) errs.photo = t(lang, "photoRequired");
    if (!futureDate) errs.date = t(lang, "dateRequired");

    if (Object.keys(errs).length > 0) {
      setFieldErrors(errs);
      const firstErr = Object.values(errs)[0];
      setError(firstErr);
      return;
    }
    setError("");
    setFieldErrors({});
    onGenerate(
      {
        name,
        team,
        achievement,
        futureDate,
        language: lang,
        category,
        location,
      },
      photo,
    );
  };

  const bodyClass = lang === "zh" ? "newspaper-body-zh" : "newspaper-body";
  const headClass = lang === "zh" ? "newspaper-head-zh" : "newspaper-head";
  const fieldErr = (f: string) =>
    fieldErrors[f] ? (
      <span
        className="mt-1 block text-xs"
        style={{ color: "var(--accent)" }}
        role="alert"
      >
        {fieldErrors[f]}
      </span>
    ) : null;

  return (
    <>
      <div className={`${bodyClass} mx-auto w-full max-w-2xl px-4 py-8`}>
        {/* Language toggle — aria-pressed for screen readers */}
        <div className="mb-6 flex items-center justify-between">
          <h2 className={`${headClass} text-2xl font-bold`}>
            {t(lang, "newspaperOf")} {t(lang, "theFuture")}
          </h2>
          <div
            className="flex border border-current"
            role="group"
            aria-label={t(lang, "language")}
          >
            <button
              onClick={() => onLanguageChange("en")}
              aria-pressed={lang === "en"}
              aria-label="English"
              className={`min-h-11 px-3 py-1 text-sm ${
                lang === "en" ? "bg-[var(--ink)] text-[var(--paper)]" : ""
              }`}
            >
              EN
            </button>
            <button
              onClick={() => onLanguageChange("zh")}
              aria-pressed={lang === "zh"}
              aria-label="中文"
              className={`min-h-11 px-3 py-1 text-sm ${
                lang === "zh" ? "bg-[var(--ink)] text-[var(--paper)]" : ""
              }`}
            >
              中文
            </button>
          </div>
        </div>

        {/* Name + Team — label htmlFor association + inline error */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="block">
            <label
              htmlFor="field-name"
              className="mb-1 block text-xs uppercase tracking-widest opacity-70"
            >
              {t(lang, "name")}
            </label>
            <input
              id="field-name"
              className="input-vintage"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onBlur={() => validateOnBlur("name")}
              placeholder={t(lang, "namePlaceholder")}
              maxLength={60}
              aria-invalid={!!fieldErrors.name}
              aria-describedby={fieldErrors.name ? "err-name" : undefined}
            />
            {fieldErrors.name && (
              <span
                id="err-name"
                className="mt-1 block text-xs"
                style={{ color: "var(--accent)" }}
                role="alert"
              >
                {fieldErrors.name}
              </span>
            )}
          </div>
          <div className="block">
            <label
              htmlFor="field-team"
              className="mb-1 block text-xs uppercase tracking-widest opacity-70"
            >
              {t(lang, "team")}
            </label>
            <input
              id="field-team"
              className="input-vintage"
              value={team}
              onChange={(e) => setTeam(e.target.value)}
              onBlur={() => validateOnBlur("team")}
              placeholder={t(lang, "teamPlaceholder")}
              maxLength={60}
              aria-invalid={!!fieldErrors.team}
              aria-describedby={fieldErrors.team ? "err-team" : undefined}
            />
            {fieldErrors.team && (
              <span
                id="err-team"
                className="mt-1 block text-xs"
                style={{ color: "var(--accent)" }}
                role="alert"
              >
                {fieldErrors.team}
              </span>
            )}
          </div>
        </div>

        {/* Future date */}
        <div className="mt-4 block">
          <label
            htmlFor="field-date"
            className="mb-1 block text-xs uppercase tracking-widest opacity-70"
          >
            {t(lang, "futureDate")}
          </label>
          <input
            id="field-date"
            type="date"
            className="input-vintage"
            value={futureDate}
            onChange={(e) => setFutureDate(e.target.value)}
            onBlur={() => validateOnBlur("date")}
            aria-invalid={!!fieldErrors.date}
          />
          {fieldErr("date")}
        </div>

        {/* Category chips — aria-pressed for active state */}
        <fieldset className="mt-4">
          <legend className="mb-2 block text-xs uppercase tracking-widest opacity-70">
            {t(lang, "category")}
          </legend>
          <div className="flex flex-wrap gap-2" role="group">
            {CATEGORIES.map((c) => (
              <button
                key={c.id}
                onClick={() => setCategory(c.id)}
                aria-pressed={category === c.id}
                className={`chip ${category === c.id ? "chip-active" : ""}`}
              >
                {c[lang]}
              </button>
            ))}
          </div>
        </fieldset>

        {/* Location */}
        <div className="mt-4 block">
          <label
            htmlFor="field-location"
            className="mb-1 block text-xs uppercase tracking-widest opacity-70"
          >
            {t(lang, "location")}
          </label>
          <input
            id="field-location"
            className="input-vintage"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder={t(lang, "locationPlaceholder")}
            maxLength={100}
          />
        </div>

        {/* Achievement */}
        <div className="mt-4 block">
          <div className="mb-1 flex items-center justify-between">
            <label
              htmlFor="field-achievement"
              className="block text-xs uppercase tracking-widest opacity-70"
            >
              {t(lang, "achievement")}
            </label>
            <button
              type="button"
              onClick={surprise}
              disabled={surpriseLoading}
              aria-label={t(lang, "surpriseMe")}
              aria-busy={surpriseLoading}
              className="chip"
            >
              {surpriseLoading ? "..." : t(lang, "surpriseMe")}
            </button>
          </div>
          <textarea
            id="field-achievement"
            className="input-vintage min-h-24 resize-y"
            value={achievement}
            onChange={(e) => setAchievement(e.target.value)}
            onBlur={() => validateOnBlur("achievement")}
            placeholder={t(lang, "achievementPlaceholder")}
            maxLength={500}
            aria-invalid={!!fieldErrors.achievement}
          />
          {fieldErr("achievement")}
        </div>

        {/* Photo upload */}
        <fieldset className="mt-4">
          <legend className="mb-2 block text-xs uppercase tracking-widest opacity-70">
            {t(lang, "photo")}
          </legend>
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => cameraRef.current?.click()}
              className="btn-outline btn-3d"
              aria-label={t(lang, "takePhoto")}
            >
              {t(lang, "takePhoto")}
            </button>
            <button
              type="button"
              onClick={() => galleryRef.current?.click()}
              className="btn-outline btn-3d"
              aria-label={t(lang, "choosePhoto")}
            >
              {t(lang, "choosePhoto")}
            </button>
            {photo && (
              <div className="polaroid-frame w-20">
                <img
                  src={photo}
                  alt={
                    lang === "zh"
                      ? `${name || "用户"} 的照片`
                      : `Photo of ${name || "user"}`
                  }
                  className="sepia-photo"
                />
              </div>
            )}
            <input
              ref={cameraRef}
              type="file"
              accept="image/*"
              capture="environment"
              className="hidden"
              aria-label={t(lang, "takePhoto")}
              onChange={(e) => handlePhoto(e.target.files?.[0])}
            />
            <input
              ref={galleryRef}
              type="file"
              accept="image/*"
              className="hidden"
              aria-label={t(lang, "choosePhoto")}
              onChange={(e) => handlePhoto(e.target.files?.[0])}
            />
          </div>
          {fieldErr("photo")}
        </fieldset>

        {/* Error summary — aria-live announces to screen readers */}
        <div aria-live="polite" aria-atomic="true">
          {error && (
            <p
              className="mt-4 text-sm"
              style={{ color: "var(--accent)" }}
              role="alert"
            >
              {error}
            </p>
          )}
        </div>

        {/* Generate — aria-busy announces loading state */}
        <div className="mt-6">
          <button
            onClick={submit}
            disabled={loading}
            aria-busy={loading}
            className="btn-vintage btn-3d w-full"
          >
            {loading ? t(lang, "generating") : t(lang, "generate")}
          </button>
        </div>
      </div>
      {loading && <LoadingAnimation language={language} stage={loadingStage} />}
    </>
  );
}
