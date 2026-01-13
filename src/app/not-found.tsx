export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0a0f1a] via-[#0d1420] to-[#0a0f1a] text-white">
      <div className="text-center space-y-4">
        <h1 className="text-6xl font-bold text-cyan-400">404</h1>
        <h2 className="text-2xl font-semibold">Page Not Found</h2>
        <p className="text-slate-400">The page you are looking for does not exist.</p>
        <a
          href="/"
          className="inline-block mt-6 px-6 py-3 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-lg font-semibold hover:opacity-90 transition-opacity"
        >
          Go Back Home
        </a>
      </div>
    </div>
  );
}



