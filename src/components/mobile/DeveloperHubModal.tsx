import React, { useState } from 'react';
import {
  X,
  Database,
  Cpu,
  BookOpen,
  Watch,
  FolderTree,
  Sparkles,
  ChevronRight,
  ExternalLink
} from 'lucide-react';
import { DatabaseSchemaViewer } from '../DatabaseSchemaViewer';
import { RecommendationSimulator } from '../RecommendationSimulator';
import { SamsungWearableRoadmap } from '../SamsungWearableRoadmap';
import { PathologyKnowledgeExplorer } from '../PathologyKnowledgeExplorer';
import { ArchitectureDirectoryViewer } from '../ArchitectureDirectoryViewer';
import { AiClinicalAnalyst } from '../AiClinicalAnalyst';

interface DeveloperHubModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type DevTab = 'database' | 'simulator' | 'wearable' | 'knowledge' | 'architecture' | 'ai_analyst';

export const DeveloperHubModal: React.FC<DeveloperHubModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<DevTab>('database');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-950/70 backdrop-blur-sm p-0 sm:p-4 transition-all">
      <div className="bg-white w-full max-w-4xl h-[92vh] sm:h-[88vh] rounded-t-3xl sm:rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-slate-200 animate-in slide-in-from-bottom-6 duration-200">
        
        {/* Modal Header */}
        <div className="px-5 py-4 border-b border-slate-200 bg-slate-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 font-bold text-xs">
              DEV
            </div>
            <div>
              <h2 className="text-sm font-bold text-white">
                BioRytmo · Central Técnica & Arquitetura
              </h2>
              <span className="text-[10px] text-slate-400 font-mono">
                Supabase SQL · Health Connect SDK · Motor Clínico · Gemini 3.8
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-300 hover:text-white transition-colors cursor-pointer"
            aria-label="Fechar painel"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Navigation Pill Bar */}
        <div className="bg-slate-100 border-b border-slate-200 px-4 py-2 overflow-x-auto flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab('database')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 whitespace-nowrap transition-colors cursor-pointer ${
              activeTab === 'database'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Database className="w-3.5 h-3.5 text-emerald-600" />
            <span>Supabase DDL SQL</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('wearable')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 whitespace-nowrap transition-colors cursor-pointer ${
              activeTab === 'wearable'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Watch className="w-3.5 h-3.5 text-indigo-600" />
            <span>Galaxy Fit 3 SDK</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('simulator')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 whitespace-nowrap transition-colors cursor-pointer ${
              activeTab === 'simulator'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Cpu className="w-3.5 h-3.5 text-amber-600" />
            <span>Motor de Regras</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('knowledge')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 whitespace-nowrap transition-colors cursor-pointer ${
              activeTab === 'knowledge'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5 text-rose-600" />
            <span>Patologias</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('ai_analyst')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 whitespace-nowrap transition-colors cursor-pointer ${
              activeTab === 'ai_analyst'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-purple-600" />
            <span>IA Clínica</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('architecture')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 whitespace-nowrap transition-colors cursor-pointer ${
              activeTab === 'architecture'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <FolderTree className="w-3.5 h-3.5 text-teal-600" />
            <span>Diretórios</span>
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-50/50">
          {activeTab === 'database' && <DatabaseSchemaViewer />}
          {activeTab === 'wearable' && <SamsungWearableRoadmap />}
          {activeTab === 'simulator' && <RecommendationSimulator />}
          {activeTab === 'knowledge' && <PathologyKnowledgeExplorer />}
          {activeTab === 'ai_analyst' && <AiClinicalAnalyst />}
          {activeTab === 'architecture' && <ArchitectureDirectoryViewer />}
        </div>

        {/* Modal Footer */}
        <div className="px-5 py-3 border-t border-slate-200 bg-white flex items-center justify-between text-xs text-slate-500 shrink-0">
          <span>BioRytmo Engine · Supabase: <strong className="font-mono text-slate-800">dghygagvamygvxudvwtn</strong></span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-900 text-white font-semibold hover:bg-slate-800 cursor-pointer"
          >
            Voltar ao Aplicativo
          </button>
        </div>

      </div>
    </div>
  );
};
