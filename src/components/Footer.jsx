import React from 'react';
import { ExternalLink, ShieldCheck } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="mt-12 border-t border-slate-800/80 bg-slate-950/60 py-6 text-xs text-slate-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-3">
        
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
          {/* CivicAPI Attribution */}
          <div className="flex items-center gap-1.5 flex-wrap justify-center sm:justify-start">
            <span>Data powered by</span>
            <a
              href="https://www.civicapi.org"
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-sky-400 hover:text-sky-300 inline-flex items-center gap-1 transition underline decoration-sky-500/30"
            >
              CivicAPI v2 Public Results System
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          {/* Privacy & Host Note */}
          <div className="flex items-center gap-1.5 text-slate-400">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Private Local Dashboard • 127.0.0.1</span>
          </div>
        </div>

        {/* Disclaimer */}
        <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-[11px] text-slate-400 text-center sm:text-left leading-relaxed">
          <p>
            <strong className="text-slate-300">Disclaimer:</strong> This application is an unofficial, personal convenience view for monitoring election night returns. It is not an official election authority or certification source. Official certified results and final tabulations are provided solely by respective state and county election officials.
          </p>
        </div>

      </div>
    </footer>
  );
}
