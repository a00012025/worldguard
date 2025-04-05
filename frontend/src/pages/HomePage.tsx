
const HomePage = () => {
  return (
    <div className="min-h-screen flex flex-col bg-white text-slate-900">
      {/* Hero Section */}
      <div className="py-24 px-4 text-center space-y-6 max-w-4xl mx-auto">
        <h1 className="text-5xl font-bold tracking-tight text-black">WorldGuard</h1>
        <p className="text-lg text-slate-600 max-w-md mx-auto">
          Secure your Telegram groups with World ID verification
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-6">
          <a
            href="#verify"
            className="px-6 py-3 bg-black text-white rounded-md hover:bg-black/90 transition-all font-medium"
          >
            Verify with World ID
          </a>

          <a
            href="https://t.me/worldguard_bot"
            target="_blank"
            rel="noreferrer"
            className="px-6 py-3 bg-white text-black rounded-md border border-slate-200 hover:bg-slate-50 transition-all font-medium"
          >
            Add Bot to Telegram
          </a>
        </div>
      </div>

      {/* Features Section */}
      <div className="px-4 py-16 max-w-5xl mx-auto w-full">
        <h2 className="text-2xl font-semibold mb-10 text-center text-black">Key Features</h2>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
          <div className="p-6 rounded-lg border border-slate-200 bg-white hover:shadow-sm transition-all">
            <h3 className="text-lg font-medium text-black mb-2">Spam Protection</h3>
            <p className="text-slate-600 text-sm leading-relaxed">
              Keep your Telegram groups free of spam and bot accounts by requiring
              human verification through World ID.
            </p>
          </div>

          <div className="p-6 rounded-lg border border-slate-200 bg-white hover:shadow-sm transition-all">
            <h3 className="text-lg font-medium text-black mb-2">Privacy First</h3>
            <p className="text-slate-600 text-sm leading-relaxed">
              World ID's zero-knowledge proofs allow verification without
              revealing personal information.
            </p>
          </div>

          <div className="p-6 rounded-lg border border-slate-200 bg-white hover:shadow-sm transition-all">
            <h3 className="text-lg font-medium text-black mb-2">Easy Setup</h3>
            <p className="text-slate-600 text-sm leading-relaxed">
              Add the WorldGuard bot to your Telegram group, and it will handle
              verification for all new members automatically.
            </p>
          </div>
        </div>
      </div>

      <div className="mt-auto">
        <footer className="py-6 text-center text-slate-500 border-t border-slate-100">
          <p className="text-sm">
            Powered by{" "}
            <a href="https://worldcoin.org/" target="_blank" rel="noreferrer" className="text-black hover:underline">
              World ID
            </a>
          </p>
        </footer>
      </div>
    </div>
  );
};

export default HomePage;