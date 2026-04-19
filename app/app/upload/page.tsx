"use client";

import { useState } from "react";

export default function UploadPage() {
  const [fileName, setFileName] = useState<string | null>(null);

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) setFileName(file.name);
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-zinc-50 dark:bg-black px-6">
      <main className="w-full max-w-xl bg-white dark:bg-zinc-900 p-10 rounded-xl shadow-md text-center">
        
        <h1 className="text-3xl font-bold text-black dark:text-white mb-4">
          Upload a PDF
        </h1>

        <p className="text-zinc-600 dark:text-zinc-400 mb-8">
          Choose a PDF to begin generating audio narration and animations.
        </p>

        {/* Upload box */}
        <label className="flex flex-col items-center justify-center border-2 border-dashed border-zinc-300 dark:border-zinc-700 rounded-xl p-10 cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-800 transition">
          <span className="text-zinc-600 dark:text-zinc-400 mb-2">
            Click to select a PDF
          </span>
          <input
            type="file"
            accept="application/pdf"
            className="hidden"
            onChange={handleFileSelect}
          />
        </label>

        {fileName && (
          <p className="mt-4 text-sm text-blue-600 dark:text-blue-400">
            Selected: {fileName}
          </p>
        )}

        <button
  disabled={!fileName}
  onClick={() => window.location.href = "/process"}
  className="mt-8 w-full bg-blue-600 disabled:bg-blue-300 text-white py-3 rounded-full font-medium transition"
>
  Continue
</button>

      </main>
    </div>
  );
}

