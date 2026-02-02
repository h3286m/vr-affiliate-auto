export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-8 text-center sm:p-20">
      <main className="flex flex-col items-center gap-8">
        <h1 className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-5xl font-bold text-transparent sm:text-7xl">
          VR Experience
        </h1>
        <p className="max-w-md text-lg text-gray-400">
          The ultimate immersive experience is coming soon.
          <br />
          Built with Next.js & Tailwind CSS.
        </p>

        <div className="flex gap-4">
          <button className="rounded-full bg-primary px-8 py-3 font-semibold text-white transition hover:opacity-90">
            Enter
          </button>
          <button className="rounded-full border border-gray-700 px-8 py-3 font-semibold text-gray-300 transition hover:bg-white/5">
            Learn More
          </button>
        </div>
      </main>
    </div>
  );
}
