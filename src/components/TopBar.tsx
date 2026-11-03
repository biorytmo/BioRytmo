import React from 'react';
import { Activity, ShieldCheck, HeartPulse, Sparkles } from 'lucide-react';

interface TopBarProps {
  activeTab: 'mobile_app' | 'simulator' | 'database' | 'knowledge' | 'wearable' | 'architecture' | 'ai_analyst';
  setActiveTab: (tab: 'mobile_app' | 'simulator' | 'database' | 'knowledge' | 'wearable' | 'architecture' | 'ai_analyst') => void;
  onOpenDemoUserModal?: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({ activeTab, setActiveTab }) => {
  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Brand wordmark */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="w-9 h-9 rounded-xl bg-slate-900 flex items-center justify-center text-white shadow-sm">
            <HeartPulse className="w-5 h-5 text-emerald-400" />
          </div>
          <button 
            onClick={() => setActiveTab('mobile_app')}
            className="text-left cursor-pointer focus:outline-none"
          >
            <span className="text-lg font-bold tracking-tight text-slate-900 whitespace-nowrap block leading-tight">
              BioRytmo
            </span>
            <span className="text-[11px] text-slate-500 font-medium tracking-wide">
              Health OS & Mobile Experience
            </span>
          </button>
        </div>

        {/* Zone 2: Navigation Links */}
        <nav className="hidden lg:flex items-center gap-6 text-sm font-medium text-slate-600">
          <button
            onClick={() => setActiveTab('mobile_app')}
            className={`transition-colors whitespace-nowrap shrink-0 py-1 border-b-2 text-xs uppercase tracking-wider font-semibold ${
              activeTab === 'mobile_app'
                ? 'border-emerald-600 text-slate-900'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            📱 App Mobile (Wizard & Dashboard)
          </button>
          <button
            onClick={() => setActiveTab('simulator')}
            className={`transition-colors whitespace-nowrap shrink-0 py-1 border-b-2 text-xs uppercase tracking-wider font-semibold ${
              activeTab === 'simulator'
                ? 'border-emerald-600 text-slate-900'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            Simulador Clínico
          </button>
          <button
            onClick={() => setActiveTab('database')}
            className={`transition-colors whitespace-nowrap shrink-0 py-1 border-b-2 text-xs uppercase tracking-wider font-semibold ${
              activeTab === 'database'
                ? 'border-emerald-600 text-slate-900'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            Banco Supabase (SQL V2)
          </button>
          <button
            onClick={() => setActiveTab('wearable')}
            className={`transition-colors whitespace-nowrap shrink-0 py-1 border-b-2 text-xs uppercase tracking-wider font-semibold ${
              activeTab === 'wearable'
                ? 'border-emerald-600 text-slate-900'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            SDK Galaxy Fit 3
          </button>
          <button
            onClick={() => setActiveTab('knowledge')}
            className={`transition-colors whitespace-nowrap shrink-0 py-1 border-b-2 text-xs uppercase tracking-wider font-semibold ${
              activeTab === 'knowledge'
                ? 'border-emerald-600 text-slate-900'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            Base de Patologias
          </button>
        </nav>

        {/* Zone 3: Primary Action */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => setActiveTab('ai_analyst')}
            className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors whitespace-nowrap shrink-0 shadow-sm"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>Consultar IA Clínica</span>
          </button>
        </div>
      </div>
    </header>
  );
};
