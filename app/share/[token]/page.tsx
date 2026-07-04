"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Newspaper from "@/components/Newspaper";
import type { SharedNewspaper } from "@/lib/types";

export default function SharePage() {
  const params = useParams<{ token: string }>();
  const token = params.token;
  const [data, setData] = useState<SharedNewspaper | null>(null);
  const [status, setStatus] = useState<"loading" | "ok" | "error">("loading");

  useEffect(() => {
    if (!token) return;
    fetch(`/api/share/${token}`)
      .then((r) => (r.ok ? r.json() : Promise.reject(r.status)))
      .then((d) => {
        setData(d);
        setStatus("ok");
      })
      .catch(() => setStatus("error"));
  }, [token]);

  if (status === "loading") {
    // Skeleton screen — matches newspaper layout for visual continuity.
    return (
      <div
        className="mx-auto max-w-3xl p-6 sm:p-10"
        aria-busy="true"
        aria-label="Loading newspaper"
      >
        <div className="masthead py-4 text-center">
          <div className="skeleton mx-auto h-3 w-40" />
          <div className="skeleton mx-auto mt-4 h-12 w-80" />
          <div className="skeleton mx-auto mt-2 h-3 w-60" />
        </div>
        <div className="skeleton mx-auto mt-6 h-10 w-full max-w-xl" />
        <div className="skeleton mx-auto mt-3 h-3 w-48" />
        <div className="mt-6 flex justify-center gap-6">
          <div className="skeleton h-48 w-44" />
          <div className="skeleton h-48 w-64" />
        </div>
        <div className="mt-6 space-y-3">
          <div className="skeleton h-4 w-full" />
          <div className="skeleton h-4 w-full" />
          <div className="skeleton h-4 w-3/4" />
        </div>
        <div className="skeleton mx-auto mt-6 h-20 w-full" />
      </div>
    );
  }

  if (status === "error" || !data) {
    return (
      <div className="newspaper-body mx-auto max-w-md p-8 text-center">
        <h1 className="newspaper-head text-3xl font-bold">
          Newspaper Not Found
        </h1>
        <p className="mt-2 opacity-70">
          This share link may have expired or never existed.
        </p>
        <Link href="/" className="btn-vintage mt-6 inline-block">
          Home
        </Link>
      </div>
    );
  }

  return (
    <div className="px-2 py-6 sm:py-10">
      <Newspaper newspaper={data} shareToken={token} />
    </div>
  );
}
