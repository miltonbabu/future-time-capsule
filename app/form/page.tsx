"use client";

import { useEffect, useState } from "react";
import CapsuleForm from "@/components/CapsuleForm";
import Newspaper from "@/components/Newspaper";
import type { CapsuleInput, Language, SharedNewspaper } from "@/lib/types";
import { t } from "@/lib/i18n";
import { loadCapsules, makeId, removeCapsule, saveCapsule } from "@/lib/storage";

export default function FormPage() {
  const [language, setLanguage] = useState<Language>("en");
  const [loading, setLoading] = useState(false);
  const [loadingLabel, setLoadingLabel] = useState("");
  const [result, setResult] = useState<SharedNewspaper | null>(null);
  const [token, setToken] = useState<string | undefined>();
  const [archive, setArchive] = useState<SharedNewspaper[]>([]);
  const [showArchive, setShowArchive] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<SharedNewspaper | null>(
    null,
  );

  // Load saved capsules + persisted language on mount.
  useEffect(() => {
    setArchive(loadCapsules());
    const saved = localStorage.getItem("ftc_lang");
    if (saved === "zh" || saved === "en") setLanguage(saved);
  }, []);

  // Lock body scroll when modal is open.
  useEffect(() => {
    if (showArchive || pendingDelete) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [showArchive, pendingDelete]);

  // Close modal on Escape key.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setShowArchive(false);
        setPendingDelete(null);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const handleGenerate = async (input: CapsuleInput, photoDataUrl: string) => {
    setLoading(true);
    setLoadingLabel(t(language, "generatingArticle"));
    try {
      // 1. Generate article (GLM → fallback templates).
      const articleRes = await fetch("/api/generate-article", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });
      if (!articleRes.ok) throw new Error("article failed");
      const { article } = await articleRes.json();

      // 2. Generate AI illustration (free CogView-3-Flash, server-side).
      setLoadingLabel(t(language, "generatingImage"));
      let imageUrl: string | undefined;
      try {
        const imgRes = await fetch("/api/generate-image", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            prompt: `${input.achievement}. ${article.image_prompt}`,
          }),
        });
        const imgData = await imgRes.json();
        imageUrl = imgData?.src || undefined;
      } catch {
        imageUrl = undefined; // graceful: newspaper shows without illustration
      }

      const newspaper: SharedNewspaper = {
        id: makeId(),
        input,
        article,
        photoDataUrl,
        imageUrl,
        createdAt: new Date().toISOString(),
      };

      // 3. Create share token (downloads illustration → base64 for permanence).
      try {
        const shareRes = await fetch("/api/share", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(newspaper),
        });
        const shareData = await shareRes.json();
        if (shareData?.token) {
          setToken(shareData.token);
          newspaper.token = shareData.token;
        }
      } catch {
        setToken(undefined);
      }

      // 4. Save to localStorage + DB.
      const next = saveCapsule(newspaper);
      setArchive(next);
      // Best-effort DB sync (server persistence).
      fetch("/api/capsules", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...newspaper, _storedAt: newspaper.createdAt }),
      }).catch(() => {});

      // 5. Show newspaper.
      setResult(newspaper);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch {
      alert(
        language === "zh"
          ? "生成失败，请重试。"
          : "Generation failed — please try again.",
      );
    } finally {
      setLoading(false);
      setLoadingLabel("");
    }
  };

  const reset = () => {
    setResult(null);
    setToken(undefined);
  };

  const confirmDelete = () => {
    if (!pendingDelete) return;
    const next = removeCapsule(pendingDelete.id);
    setArchive(next);
    fetch("/api/capsules", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: pendingDelete.id }),
    }).catch(() => {});
    setPendingDelete(null);
  };

  const bodyClass = language === "zh" ? "newspaper-body-zh" : "newspaper-body";
  const confirmMsg =
    language === "zh"
      ? "确定要删除这份报纸吗？此操作无法撤销。"
      : "Delete this newspaper? This cannot be undone.";

  return (
    <div className="flex-1">
      {result ? (
        <div className="px-2 py-6 sm:py-10">
          <Newspaper
            newspaper={result}
            shareToken={token}
            onReset={reset}
          />
        </div>
      ) : (
        <CapsuleForm
          language={language}
          onLanguageChange={setLanguage}
          onGenerate={handleGenerate}
          loading={loading}
          loadingLabel={loadingLabel}
        />
      )}

      {/* Floating archive button — safe-area aware, systematic z-index */}
      {!result && (
        <button
          onClick={() => setShowArchive(true)}
          className="btn-outline z-fixed safe-bottom fixed bottom-6 right-6 shadow-lg"
          aria-label={`${t(language, "myNewspapers")} (${archive.length})`}
        >
          {t(language, "myNewspapers")} ({archive.length})
        </button>
      )}

      {/* Archive modal — role=dialog, aria-modal, Escape to close */}
      {showArchive && (
        <div
          className="z-modal fixed inset-0 flex items-center justify-center bg-black/50 p-4"
          onClick={() => setShowArchive(false)}
          role="dialog"
          aria-modal="true"
          aria-label={t(language, "myNewspapers")}
        >
          <div
            className="paper-bg safe-top safe-bottom max-h-[80vh] w-full max-w-2xl overflow-y-auto p-6"
            style={{ background: "var(--paper)" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex items-center justify-between">
              <h2 className={`${bodyClass} text-xl font-bold`}>
                {t(language, "myNewspapers")}
              </h2>
              <button
                onClick={() => setShowArchive(false)}
                className="btn-outline"
                aria-label={t(language, "close")}
              >
                {t(language, "close")}
              </button>
            </div>
            {archive.length === 0 ? (
              <p className={`${bodyClass} opacity-70`}>
                {t(language, "noSaved")}
              </p>
            ) : (
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                {archive.map((c) => (
                  <div key={c.id} className="rule-box">
                    <button
                      className="w-full cursor-pointer text-left"
                      onClick={() => {
                        setResult(c);
                        setToken(c.token);
                        setShowArchive(false);
                        window.scrollTo({ top: 0, behavior: "smooth" });
                      }}
                      aria-label={`${c.article.headline} — ${c.input.name}`}
                    >
                      {c.photoDataUrl ? (
                        <img
                          src={c.photoDataUrl}
                          alt={c.input.name}
                          className="sepia-photo mb-2 w-full"
                          loading="lazy"
                        />
                      ) : (
                        <div className="mb-2 flex h-24 items-center justify-center bg-black/10 text-xs opacity-50">
                          ?
                        </div>
                      )}
                      <p
                        className={`${bodyClass} line-clamp-2 text-xs font-bold`}
                      >
                        {c.article.headline}
                      </p>
                      <p className={`${bodyClass} text-xs opacity-60`}>
                        {c.input.name}
                      </p>
                    </button>
                    <button
                      onClick={() => setPendingDelete(c)}
                      className="mt-2 w-full min-h-11 text-xs uppercase tracking-widest opacity-70 hover:opacity-100"
                      style={{ color: "var(--accent)" }}
                      aria-label={`${t(language, "delete")} ${c.article.headline}`}
                    >
                      {t(language, "delete")}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Confirmation dialog for destructive delete action */}
      {pendingDelete && (
        <div
          className="z-modal fixed inset-0 flex items-center justify-center bg-black/50 p-4"
          role="dialog"
          aria-modal="true"
          aria-label={t(language, "delete")}
        >
          <div
            className="paper-bg w-full max-w-sm p-6 text-center"
            style={{ background: "var(--paper)" }}
          >
            <p className={`${bodyClass} mb-6 text-sm`}>{confirmMsg}</p>
            <div className="flex justify-center gap-3">
              <button
                onClick={() => setPendingDelete(null)}
                className="btn-outline"
              >
                {t(language, "close")}
              </button>
              <button
                onClick={confirmDelete}
                className="btn-vintage"
                style={{ background: "var(--accent)", borderColor: "var(--accent)" }}
              >
                {t(language, "delete")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
