"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/src/lib/supabaseClient";

function normalizeStoragePath(path?: string | null) {
  if (!path) return "";

  const trimmed = path.trim();

  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    return trimmed;
  }

  return trimmed.replace(/^\/+/, "").replace(/^applications\//, "");
}

export default function AttachmentLink({
  label,
  href,
}: {
  label: string;
  href?: string | null;
}) {
  const [signedUrl, setSignedUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [linkError, setLinkError] = useState("");

  useEffect(() => {
    let isMounted = true;

    async function createSecureLink() {
      const storagePath = normalizeStoragePath(href);

      if (!storagePath) return;

      if (storagePath.startsWith("http://") || storagePath.startsWith("https://")) {
        if (isMounted) {
          setSignedUrl(storagePath);
          setLinkError("");
        }
        return;
      }

      setLoading(true);
      setLinkError("");

      const { data, error } = await supabase.storage
        .from("applications")
        .createSignedUrl(storagePath, 60 * 30);

      if (!isMounted) return;

      if (error || !data?.signedUrl) {
        console.error("Failed to create signed file URL:", error);
        setSignedUrl("");
        setLinkError("Could not open this file. Check that the file exists in the applications bucket.");
      } else {
        setSignedUrl(data.signedUrl);
      }

      setLoading(false);
    }

    createSecureLink();

    return () => {
      isMounted = false;
    };
  }, [href]);

  if (!href) return null;

  return (
    <div className="mb-4 rounded-xl border border-white/10 bg-white/5 p-4">
      <p className="mb-2 text-sm text-slate-400">{label}</p>

      {loading && (
        <p className="text-sm font-semibold text-slate-300">
          Preparing secure link...
        </p>
      )}

      {!loading && signedUrl && (
        <a
          href={signedUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex rounded-lg bg-orange-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-orange-600"
        >
          Open uploaded file
        </a>
      )}

      {!loading && linkError && (
        <p className="text-sm font-semibold text-red-300">{linkError}</p>
      )}
    </div>
  );
}
