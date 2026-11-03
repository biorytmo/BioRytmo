import React, { useState } from 'react';
import { PATHOLOGY_KNOWLEDGE_BASE } from '../data/knowledgeBaseData';
import { PathologyKnowledge } from '../types/health';
import {
  BookOpen,
  Heart,
  Pill,
  AlertCircle,
  CheckCircle2,
  Utensils,
  Dumbbell,
  ShieldAlert,
  Clock,
  Sparkles,
  ChevronRight
} from 'lucide-react';

export const PathologyKnowledgeExplorer: React.FC = () => {
  const [selectedPathology, setSelectedPathology] = useState<PathologyKnowledge>(PATHOLOGY_KNOWLEDGE_BASE[0]);
  const [activeTab, setActiveTab] = useState<'overview' | 'harms_helps' | 'supplements' | 'nutrition_exercise' | 'labs'>('overview');

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 lg:p-8">
        <div className="max-w-3xl space-y-2">
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400">
            <BookOpen className="w-4 h-4" />
            <span>Pilar 4: Base de Conhecimento Estruturada</span>
            <span>·</span>
            <span>Medicina Funcional & Evidências</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight">
            Enciclopédia Clínica Interativa de Patologias
          </h1>
          <p className="text-xs text-slate-300 leading-relaxed">
            Cada doença no BioRytmo é parametrizada com fisiopatologia, gatilhos inflamatórios, alimentos protetores, suplementação natural graduada (A/B/C), regras de volume gástrico e guia biomecânico de exercícios.
          </p>
        </div>

        {/* Pathology Selector Pills */}
        <div className="mt-6 pt-6 border-t border-slate-800 flex flex-wrap gap-2">
          {PATHOLOGY_KNOWLEDGE_BASE.map((p) => {
            const isSelected = selectedPathology.id === p.id;
            return (
              <button
                key={p.id}
                onClick={() => setSelectedPathology(p)}
                className={`px-3 py-2 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                  isSelected
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700'
                }`}
              >
                {p.name.split('(')[0].trim()}
              </button>
            );
          })}
        </div>
      </div>

      {/* Pathology Detailed View Container */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-6">
        {/* Title & Badge */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200">
          <div>
            <span className="text-[11px] font-mono uppercase tracking-wider font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded">
              ID: {selectedPathology.id} · Categoria: {selectedPathology.category}
            </span>
            <h2 className="text-xl font-bold text-slate-900 mt-2">
              {selectedPathology.name}
            </h2>
            <p className="text-xs text-slate-600 mt-1 max-w-3xl leading-relaxed">
              {selectedPathology.description}
            </p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-1 border-b border-slate-200 overflow-x-auto pb-px">
          {[
            { id: 'overview', label: 'Causas & Mecanismos' },
            { id: 'harms_helps', label: 'O Que Faz Mal vs O Que Faz Bem' },
            { id: 'supplements', label: 'Suplementos Naturais (Grau A/B)' },
            { id: 'nutrition_exercise', label: 'Crononutrição & Exercícios' },
            { id: 'labs', label: 'Exames & Periodicidade' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2.5 text-xs font-semibold whitespace-nowrap transition-colors border-b-2 ${
                activeTab === tab.id
                  ? 'border-emerald-600 text-slate-900 bg-slate-50/50'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab 1: Overview & Root Causes */}
        {activeTab === 'overview' && (
          <div className="space-y-4">
            <span className="text-xs font-bold text-slate-900 uppercase tracking-wider block">
              Causas de Raiz & Fisiopatologia:
            </span>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {selectedPathology.rootCauses.map((cause, i) => (
                <div key={i} className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 text-xs flex items-start gap-3">
                  <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-700 font-mono font-bold flex items-center justify-center shrink-0 text-[10px]">
                    {i + 1}
                  </span>
                  <p className="text-slate-700 leading-relaxed">{cause}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 2: What Harms vs What Helps */}
        {activeTab === 'harms_helps' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* What Harms */}
            <div className="p-4 rounded-xl border border-rose-200 bg-rose-50/30 space-y-3 text-xs">
              <div className="flex items-center gap-2 text-rose-800 pb-2 border-b border-rose-200">
                <ShieldAlert className="w-4 h-4 text-rose-600" />
                <h3 className="font-bold text-sm">O Que Faz Mal (Gatilhos & Inflamatórios)</h3>
              </div>
              
              <div className="space-y-2">
                <span className="font-semibold text-rose-950 block text-[11px] uppercase tracking-wide">
                  Alimentos a Evitar ou Moderar:
                </span>
                <ul className="list-disc list-inside space-y-1 text-slate-700 text-[11px]">
                  {selectedPathology.whatHarms.foods.map((food, i) => (
                    <li key={i}>{food}</li>
                  ))}
                </ul>
              </div>

              <div className="space-y-2 pt-2 border-t border-rose-100">
                <span className="font-semibold text-rose-950 block text-[11px] uppercase tracking-wide">
                  Hábitos Prejudiciais:
                </span>
                <ul className="list-disc list-inside space-y-1 text-slate-700 text-[11px]">
                  {selectedPathology.whatHarms.habits.map((habit, i) => (
                    <li key={i}>{habit}</li>
                  ))}
                </ul>
              </div>
            </div>

            {/* What Helps */}
            <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/30 space-y-3 text-xs">
              <div className="flex items-center gap-2 text-emerald-800 pb-2 border-b border-emerald-200">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <h3 className="font-bold text-sm">O Que Faz Bem (Protetores & Fitoquímicos)</h3>
              </div>
              
              <div className="space-y-2">
                <span className="font-semibold text-emerald-950 block text-[11px] uppercase tracking-wide">
                  Alimentos Funcionais & Protetores:
                </span>
                <ul className="list-disc list-inside space-y-1 text-slate-700 text-[11px]">
                  {selectedPathology.whatHelps.foods.map((food, i) => (
                    <li key={i}>{food}</li>
                  ))}
                </ul>
              </div>

              <div className="space-y-2 pt-2 border-t border-emerald-100">
                <span className="font-semibold text-emerald-950 block text-[11px] uppercase tracking-wide">
                  Compostos Ativos Funcionais:
                </span>
                <ul className="list-disc list-inside space-y-1 text-slate-700 text-[11px]">
                  {selectedPathology.whatHelps.functionalCompounds.map((comp, i) => (
                    <li key={i}>{comp}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Natural Supplements */}
        {activeTab === 'supplements' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-900 uppercase tracking-wider block">
                Prescrição de Suplementos Naturais Baseados em Evidências ({selectedPathology.naturalSupplements.length})
              </span>
              <span className="text-[11px] text-slate-500">Graduação científica A (Ensaio Clínico) e B (Coorte)</span>
            </div>

            <div className="grid grid-cols-1 gap-3">
              {selectedPathology.naturalSupplements.map((supp, i) => (
                <div key={i} className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 space-y-2 text-xs">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-600 shrink-0" />
                      <h4 className="font-bold text-sm text-slate-900">{supp.compound}</h4>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-slate-800 bg-slate-200/80 px-2 py-0.5 rounded">
                        {supp.dosage}
                      </span>
                      <span className="font-mono text-xs font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">
                        Evidência Grau {supp.evidenceGrade}
                      </span>
                    </div>
                  </div>

                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    <strong className="text-slate-900">Mecanismo Biológico:</strong> {supp.biologicalMechanism}
                  </p>

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2 border-t border-slate-200/60 text-[11px]">
                    <span className="text-indigo-700 font-semibold">
                      Horário Ideal: {supp.timing}
                    </span>
                    {supp.safetyWarnings && supp.safetyWarnings.length > 0 && (
                      <span className="text-amber-800">
                        Atenção: {supp.safetyWarnings.join(', ')}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 4: Circadian Nutrition & Exercise Rules */}
        {activeTab === 'nutrition_exercise' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 text-xs">
            {/* Circadian Nutrition */}
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-3">
              <div className="flex items-center gap-2 text-slate-900 pb-2 border-b border-slate-200">
                <Utensils className="w-4 h-4 text-emerald-600" />
                <h3 className="font-bold text-sm">Diretrizes de Crononutrição & Volume Gástrico</h3>
              </div>

              <div className="space-y-1.5">
                <span className="font-semibold text-slate-900 block">Frequência das Refeições:</span>
                <p className="text-slate-700">{selectedPathology.circadianNutritionRules.mealFrequency}</p>
              </div>

              <div className="space-y-1.5">
                <span className="font-semibold text-slate-900 block">Volume Máximo Tolerado por Refeição:</span>
                <p className="text-slate-700 font-mono font-bold text-emerald-700">
                  {selectedPathology.circadianNutritionRules.maxVolumePerMealMl} ml / g
                </p>
              </div>

              <div className="space-y-1.5">
                <span className="font-semibold text-slate-900 block">Janela Alimentar Recomendada:</span>
                <p className="text-slate-700">{selectedPathology.circadianNutritionRules.recommendedWindow}</p>
              </div>

              <div className="space-y-1.5">
                <span className="font-semibold text-slate-900 block">Esvaziamento Gástrico & Digestibilidade:</span>
                <p className="text-slate-700">{selectedPathology.circadianNutritionRules.gastricEmptyingNotes}</p>
              </div>
            </div>

            {/* Exercise Guidance */}
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-3">
              <div className="flex items-center gap-2 text-slate-900 pb-2 border-b border-slate-200">
                <Dumbbell className="w-4 h-4 text-indigo-600" />
                <h3 className="font-bold text-sm">Prescrição & Contraindicações de Exercício</h3>
              </div>

              <div className="space-y-1.5">
                <span className="font-semibold text-emerald-800 block">Modalidades Ideais:</span>
                <ul className="list-disc list-inside space-y-1 text-slate-700 text-[11px]">
                  {selectedPathology.exerciseGuidance.optimalTypes.map((opt, i) => (
                    <li key={i}>{opt}</li>
                  ))}
                </ul>
              </div>

              <div className="space-y-1.5 pt-2 border-t border-slate-200">
                <span className="font-semibold text-rose-800 block">Exercícios Contraindicados:</span>
                <ul className="list-disc list-inside space-y-1 text-slate-700 text-[11px]">
                  {selectedPathology.exerciseGuidance.contraindicatedTypes.map((contra, i) => (
                    <li key={i}>{contra}</li>
                  ))}
                </ul>
              </div>

              <div className="space-y-1.5 pt-2 border-t border-slate-200">
                <span className="font-semibold text-slate-900 block">Adaptação para Baixa Recuperação (Wearable):</span>
                <p className="text-slate-700 italic">{selectedPathology.exerciseGuidance.adaptationsForLowRecovery}</p>
              </div>
            </div>
          </div>
        )}

        {/* Tab 5: Recommended Lab Tests */}
        {activeTab === 'labs' && (
          <div className="space-y-4 text-xs">
            <span className="text-xs font-bold text-slate-900 uppercase tracking-wider block">
              Painel de Exames Clínicos Obrigatórios & Intervalos de Repetição
            </span>

            <div className="grid grid-cols-1 gap-3">
              {selectedPathology.recommendedLabTests.map((lab, i) => (
                <div key={i} className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-1 max-w-2xl">
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-slate-900 text-sm">{lab.testName}</h4>
                      {lab.loincCode && (
                        <span className="font-mono text-[10px] text-slate-500 bg-slate-200 px-1.5 py-0.5 rounded">
                          LOINC: {lab.loincCode}
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-600">
                      <strong>Racional Clínico:</strong> {lab.clinicalRationale}
                    </p>
                    <p className="text-[11px] text-emerald-800 font-medium">
                      <strong>Alvo Terapêutico Ótimo:</strong> {lab.targetOptimalRange}
                    </p>
                  </div>

                  <div className="shrink-0 text-left md:text-right">
                    <span className="text-xs font-mono font-bold text-slate-900 block">
                      Repetir a cada {lab.repeatIntervalMonths} {lab.repeatIntervalMonths === 1 ? 'mês' : 'meses'}
                    </span>
                    <span className="text-[10px] text-slate-500">
                      Disparo automático no app
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
