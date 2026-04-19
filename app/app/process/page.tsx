export default function ProcessPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-zinc-50 dark:bg-black px-6">
      <main className="w-full max-w-xl bg-white dark:bg-zinc-900 p-10 rounded-xl shadow-md text-center">
        <h1 className="text-3xl font-bold text-black dark:text-white mb-4">
          Processing your PDF…
        </h1>

        <p className="text-zinc-600 dark:text-zinc-400">
          This is where text extraction, audio generation, and animation
          will happen.
        </p>
      </main>
    </div>
  );
}

