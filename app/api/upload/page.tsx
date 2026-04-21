"use client";

import { useState } from "react";

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState("");

  async function handleUpload() {
    if (!file) return;

    setUploading(true);

    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    });

    const data = await res.json();
    setResult(JSON.stringify(data, null, 2));
    setUploading(false);
  }

  return (
    <div style={{ padding: 40 }}>
      <h1>Upload PDF</h1>

      <input
        type="file"
        accept="application/pdf"
        onChange={(e) => setFile(e.target.files?.[0] || null)}
      />

      <button
        onClick={handleUpload}
        disabled={!file || uploading}
        style={{ marginLeft: 10 }}
      >
        {uploading ? "Uploading..." : "Upload"}
      </button>

      {result && (
        <pre
          style={{
            marginTop: 20,
            padding: 20,
            background: "#f4f4f4",
            borderRadius: 6,
          }}
        >
          {result}
        </pre>
      )}
    </div>
  );
}
