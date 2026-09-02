"use client";

import { useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { DhikrItem } from "./items-list";

export default function ItemEditor({
  item,
  index,
  onDeleted,
}: {
  item: DhikrItem;
  index: number;
  onDeleted: () => void;
}) {
  const [malayalamNote, setMalayalamNote] = useState(item.malayalam_note ?? "");
  const [audioUrl, setAudioUrl] = useState(item.audio_url);
  const [sourcePdfUrl, setSourcePdfUrl] = useState(item.source_pdf_url);

  const [uploadingPdf, setUploadingPdf] = useState(false);
  const [uploadingAudio, setUploadingAudio] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savedAt, setSavedAt] = useState<number | null>(null);

  const pdfInputRef = useRef<HTMLInputElement>(null);
  const audioInputRef = useRef<HTMLInputElement>(null);

  async function handlePdfSelected(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setError(null);
    setUploadingPdf(true);

    try {
      const supabase = createClient();
      const path = `${item.set_id}/${item.id}.pdf`;
      const { error: uploadError } = await supabase.storage
        .from("source-pdfs")
        .upload(path, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from("source-pdfs").getPublicUrl(path);
      setSourcePdfUrl(data.publicUrl);
    } catch (err) {
      setError(err instanceof Error ? err.message : "PDF upload failed");
    } finally {
      setUploadingPdf(false);
      if (pdfInputRef.current) pdfInputRef.current.value = "";
    }
  }

  async function handleAudioSelected(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setError(null);
    setUploadingAudio(true);

    try {
      const supabase = createClient();
      const ext = file.name.split(".").pop() ?? "mp3";
      const path = `${item.set_id}/${item.id}.${ext}`;
      const { error: uploadError } = await supabase.storage
        .from("audio")
        .upload(path, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from("audio").getPublicUrl(path);
      setAudioUrl(data.publicUrl);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Audio upload failed");
    } finally {
      setUploadingAudio(false);
      if (audioInputRef.current) audioInputRef.current.value = "";
    }
  }

  async function handleSave() {
    setSaving(true);
    setError(null);

    const res = await fetch(`/api/admin/items/${item.id}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        malayalam_note: malayalamNote || null,
        audio_url: audioUrl,
        source_pdf_url: sourcePdfUrl,
      }),
    });

    setSaving(false);

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setError(body.error ?? "Save failed");
      return;
    }

    setSavedAt(Date.now());
  }

  async function handleDelete() {
    if (!confirm(`Delete item #${index + 1}?`)) return;
    setDeleting(true);
    await fetch(`/api/admin/items/${item.id}`, { method: "DELETE" });
    onDeleted();
  }

  return (
    <div className="space-y-3 rounded border border-shell-muted/20 p-4">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-shell-muted">
          Item #{index + 1}
        </span>
        <button
          onClick={handleDelete}
          disabled={deleting}
          className="text-xs text-red-400 disabled:opacity-50"
        >
          {deleting ? "Deleting..." : "Delete"}
        </button>
      </div>

      <div className="flex flex-wrap gap-3">
        <label className="cursor-pointer rounded border border-shell-muted/25 px-3 py-1.5 text-xs font-medium text-shell-muted">
          {uploadingPdf ? "Uploading..." : "Upload PDF"}
          <input
            ref={pdfInputRef}
            type="file"
            accept="application/pdf"
            onChange={handlePdfSelected}
            disabled={uploadingPdf}
            className="hidden"
          />
        </label>
        {sourcePdfUrl && (
          <a
            href={sourcePdfUrl}
            target="_blank"
            rel="noreferrer"
            className="self-center text-xs text-gold underline"
          >
            View PDF
          </a>
        )}

        <label className="cursor-pointer rounded border border-shell-muted/25 px-3 py-1.5 text-xs font-medium text-shell-muted">
          {uploadingAudio ? "Uploading..." : "Upload audio"}
          <input
            ref={audioInputRef}
            type="file"
            accept="audio/*"
            onChange={handleAudioSelected}
            disabled={uploadingAudio}
            className="hidden"
          />
        </label>
        {audioUrl && (
          <audio controls src={audioUrl} className="h-8 self-center" />
        )}
      </div>

      <div className="space-y-1">
        <label className="block text-xs font-medium text-shell-muted">
          Malayalam note (optional)
        </label>
        <textarea
          value={malayalamNote}
          onChange={(e) => setMalayalamNote(e.target.value)}
          rows={2}
          className="w-full rounded border border-shell-muted/25 bg-transparent px-2 py-1.5 text-sm text-shell-muted outline-none focus:border-gold"
        />
      </div>

      {error && <p className="text-sm text-red-400">{error}</p>}

      <div className="flex items-center gap-3">
        <button
          onClick={handleSave}
          disabled={saving}
          className="rounded border border-gold px-3 py-1.5 text-sm font-medium text-gold transition-colors hover:bg-gold hover:text-shell disabled:opacity-50"
        >
          {saving ? "Saving..." : "Save item"}
        </button>
        {savedAt && !saving && (
          <span className="text-xs text-shell-muted">Saved</span>
        )}
      </div>
    </div>
  );
}
