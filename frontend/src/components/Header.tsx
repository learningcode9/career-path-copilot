import { Menu } from "lucide-react";

export default function Header() {
  return (
    <header className="bg-slate-900 border-b border-slate-700">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        
        {/* Left: Logo / Brand */}
        <div className="text-xl font-bold text-white">
          Career Path Copilot
        </div>

        {/* Center: Navigation */}
        <nav className="hidden md:flex space-x-8 text-slate-300">
          <a href="#" className="hover:text-white transition">
            Docs
          </a>
          <a href="#" className="hover:text-white transition">
            Pipeline
          </a>
          <a href="#" className="hover:text-white transition">
            New Request
          </a>
        </nav>

        {/* Right: GitHub button */}
        <div className="flex items-center space-x-4">
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-slate-800 px-4 py-2 rounded-lg text-slate-200 hover:bg-slate-700 transition"
          >
            GitHub
          </a>

          {/* Mobile Menu Icon */}
          <button className="md:hidden p-2 rounded-lg hover:bg-slate-800">
            <Menu className="text-white w-6 h-6" />
          </button>
        </div>
      </div>
    </header>
  );
}
