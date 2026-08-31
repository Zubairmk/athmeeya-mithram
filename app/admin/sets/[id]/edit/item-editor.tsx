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
  const [arabicText, setArabicText] = useState(item.arabic_text);
  const [malayalamNote, setMalayalamNote] = useState(item.malayalam_note ?? "");
  const [audioUrl, setAudioUrl] = useState(item.audio_url);
  const [sourcePdfUrl, setSourcePdfUrl] = useState(item.source_pdf_url);

  const [extracting, setExtracting] = useState(false);
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
    setExtracting(true);

    try {
      const supabase = createClient();
      const path = `${item.set_id}/${item.id}.pdf`;
      const { error: uploadError } = await supabase.storage
        .from("source-pdfs")
        .upload(path, file, { upsert: true });

      if (uploadError) throw uploadError;
      setSourcePdfUrl(path);

      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/admin/extract", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? "Extraction failed");
      }

      const result = await res.json();
      setArabicText(result.arabic_text);
      setMalayalamNote(result.malayalam_note);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setExtracting(false);
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
        arabic_text: arabicText,
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
    <div className="space-y-3 rounded border border-gray-200 p-4">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-gray-400">
          Item #{index + 1}
        </span>
        <button
          onClick={handleDelete}
          disabled={deleting}
          className="text-xs text-red-600 disabled:opacity-50"
        >
          {deleting ? "Deleting..." : "Delete"}
        </button>
      </div>

      <div className="flex flex-wrap gap-3">
        <label className="cursor-pointer rounded border border-gray-300 px-3 py-1.5 text-xs font-medium">
          {extracting ? "Extracting..." : "Upload PDF & extract"}
          <input
            ref={pdfInputRef}
            type="file"
            accept="application/pdf"
            onChange={handlePdfSelected}
            disabled={extracting}
            className="hidden"
          />
        </label>
        {sourcePdfUrl && (
          <span className="self-center text-xs text-gray-400">
            PDF attached
          </span>
        )}

        <label className="cursor-pointer rounded border border-gray-300 px-3 py-1.5 text-xs font-medium">
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
        <label className="block text-xs font-medium text-gray-500">
          Arabic text
        </label>
        <textarea
          dir="rtl"
          value={arabicText}
          onChange={(e) => setArabicText(e.target.value)}
          rows={3}
          className="w-full rounded border border-gray-300 px-2 py-1.5 text-sm"
        />
      </div>

      <div className="space-y-1">
        <label className="block text-xs font-medium text-gray-500">
          Malayalam note
        </label>
        <textarea
          value={malayalamNote}
          onChange={(e) => setMalayalamNote(e.target.value)}
          rows={2}
          className="w-full rounded border border-gray-300 px-2 py-1.5 text-sm"
        />
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="flex items-center gap-3">
        <button
          onClick={handleSave}
          disabled={saving}
          className="rounded bg-gray-900 px-3 py-1.5 text-sm font-medium text-white disabled:opacity-50"
        >
          {saving ? "Saving..." : "Save item"}
        </button>
        {savedAt && !saving && (
          <span className="text-xs text-gray-400">Saved</span>
        )}
      </div>
    </div>
  );
}
