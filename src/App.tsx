import React, { useState } from 'react';
import { TopBar } from './components/TopBar';
import { MobileExperienceViewer } from './components/mobile/MobileExperienceViewer';
import { RecommendationSimulator } from './components/RecommendationSimulator';
import { DatabaseSchemaViewer } from './components/DatabaseSchemaViewer';
import { PathologyKnowledgeExplorer } from './components/PathologyKnowledgeExplorer';
import { SamsungWearableRoadmap } from './components/SamsungWearableRoadmap';
import { ArchitectureDirectoryViewer } from './components/ArchitectureDirectoryViewer';
import { AiClinicalAnalyst } from './components/AiClinicalAnalyst';

export default function App() {
  const [activeTab, setActiveTab] = useState<'mobile_app' | 'simulator' | 'database' | 'knowledge' | 'wearable' | 'architecture' | 'ai_analyst'>('mobile_app');

  return (
    <div className="min-h-screen bg-slate-100/60 text-slate-900 flex flex-col font-sans selection:bg-emerald-100 selection:text-emerald-900">
      {/* 3-Zone Top Bar */}
      <TopBar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        {activeTab === 'mobile_app' && <MobileExperienceViewer />}
        {activeTab === 'simulator' && <RecommendationSimulator />}
        {activeTab === 'database' && <DatabaseSchemaViewer />}
        {activeTab === 'knowledge' && <PathologyKnowledgeExplorer />}
        {activeTab === 'wearable' && <SamsungWearableRoadmap />}
        {activeTab === 'architecture' && <ArchitectureDirectoryViewer />}
        {activeTab === 'ai_analyst' && <AiClinicalAnalyst />}
      </main>

      {/* Clean Footer */}
      <footer className="border-t border-slate-200 bg-white py-6 mt-12 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-800">BioRytmo Health OS</span>
            <span>·</span>
            <span>Medicina Funcional, Crononutrição e Biometria de Wearables</span>
          </div>
          <div className="flex items-center gap-4 text-slate-600">
            <span>Supabase DDL</span>
            <span>·</span>
            <span>Health Connect Android SDK</span>
            <span>·</span>
            <span>Galaxy Fit 3</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
