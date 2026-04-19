export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-zinc-50 dark:bg-black px-6">
      <main className="w-full max-w-3xl py-24 flex flex-col items-center text-center">
        
        {/* Logo / Title */}
        <h1 className="text-4xl font-bold tracking-tight text-black dark:text-white mb-4">
          Study<span className="text-blue-600">In</span>Motion
        </h1>

        {/* Tagline */}
        <p className="text-lg text-zinc-600 dark:text-zinc-400 max-w-xl mb-10">
          Bring your study material to life with animated read‑aloud learning.
          Upload a PDF and let StudyInMotion turn it into an engaging,
          narrated, visual experience.
        </p>

        {/* Upload Button */}
        <a
          href="/upload"
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-8 py-4 rounded-full transition-colors"
        >
          Upload PDF
        </a>

        {/* Footer note */}
        <p className="mt-12 text-sm text-zinc-500 dark:text-zinc-400">
          More features coming soon — audio narration, animation, and study tools.
        </p>
      </main>
    </div>
  );
}
