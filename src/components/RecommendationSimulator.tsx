import React, { useState, useMemo } from 'react';
import {
  UserProfile,
  HealthCondition,
  WearableBiometrics,
  UserSubstitutionPreference,
  SubstitutionMode
} from '../types/health';
import { generatePersonalizedRecommendation } from '../services/recommendationEngine';
import {
  Activity,
  Watch,
  Heart,
  Moon,
  Flame,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  Clock,
  Pill,
  Utensils,
  Dumbbell,
  ShieldCheck,
  ChevronRight
} from 'lucide-react';

const INITIAL_USER: UserProfile = {
  id: 'usr_carlos_38',
  name: 'Carlos Mendes',
  age: 38,
  gender: 'male',
  weightKg: 78.5,
  heightCm: 177,
  activityLevel: 'moderate',
  primaryGoal: 'cholesterol_control',
  wakeTime: '06:30',
  bedTime: '22:30'
};

const INITIAL_CONDITIONS: HealthCondition[] = [
  {
    id: 'cholesterol_severe',
    code: 'E78.0',
    name: 'Hipercolesterolemia Severa (Colesterol Total 400 mg/dL)',
    category: 'cardiovascular',
    severity: 'severe',
    notes: 'Paciente optou por protocolo natural sem estatinas sintéticas. LDL atual: 245 mg/dL. ApoB: 142 mg/dL.',
    labMarkersTriggered: [
      { marker: 'Colesterol Total', value: 400, unit: 'mg/dL', referenceRange: '< 190' },
      { marker: 'LDL-c Direto', value: 245, unit: 'mg/dL', referenceRange: '< 100' },
      { marker: 'Triglicerídeos', value: 165, unit: 'mg/dL', referenceRange: '< 150' }
    ]
  },
  {
    id: 'gastritis_gerd',
    code: 'K29.0',
    name: 'Gastrite Erosiva Antral & Refluxo Gastroesofágico',
    category: 'gastrointestinal',
    severity: 'moderate',
    notes: 'Epigastralgia em jejum e queimação retroesternal se comer perto do horário de dormir.',
    labMarkersTriggered: [
      { marker: 'EDA', value: 1, unit: 'laudo', referenceRange: 'Erosões planas no antro gástrico, H. pylori negativo' }
    ]
  },
  {
    id: 'lactose_intolerance',
    code: 'E73.0',
    name: 'Intolerância à Lactose (Hipolactasia Primária)',
    category: 'intolerance',
    severity: 'moderate',
    notes: 'Distensão abdominal e gases acentuados após laticínios fluidos não tratados.'
  }
];

export const RecommendationSimulator: React.FC = () => {
  const [user, setUser] = useState<UserProfile>(INITIAL_USER);
  const [conditions, setConditions] = useState<HealthCondition[]>(INITIAL_CONDITIONS);
  const [lactoseMode, setLactoseMode] = useState<SubstitutionMode>('enzymatic_supplement');

  // Wearable Galaxy Fit 3 simulated state
  const [sleepScore, setSleepScore] = useState<number>(54); // Default to low sleep to show auto-adjustment
  const [sleepHours, setSleepHours] = useState<number>(5.5);
  const [deepSleepMin, setDeepSleepMin] = useState<number>(35);
  const [restingHr, setRestingHr] = useState<number>(73);
  const [stressLevel, setStressLevel] = useState<'low' | 'moderate' | 'high'>('high');

  const wearableData: WearableBiometrics = useMemo(() => ({
    deviceId: 'samsung_galaxy_fit3_carlos',
    deviceModel: 'Samsung Galaxy Fit 3',
    timestamp: new Date().toISOString(),
    sleepScore,
    totalSleepMinutes: Math.round(sleepHours * 60),
    deepSleepMinutes: deepSleepMin,
    remSleepMinutes: 65,
    lightSleepMinutes: Math.max(0, Math.round(sleepHours * 60) - deepSleepMin - 65),
    restingHeartRateBpm: restingHr,
    baselineRestingHeartRateBpm: 65,
    hrvRmssdMs: restingHr > 70 ? 28 : 52,
    stressLevel,
    stepsCount: 6840,
    activeCalories: 340,
    recoveryStatus: sleepScore < 60 || restingHr > 72 ? 'depleted' : sleepScore > 78 ? 'optimal' : 'moderate'
  }), [sleepScore, sleepHours, deepSleepMin, restingHr, stressLevel]);

  const substitutionPrefs: UserSubstitutionPreference[] = useMemo(() => [
    {
      intoleranceCode: 'lactose',
      preferredMode: lactoseMode
    }
  ], [lactoseMode]);

  const recommendations = useMemo(() => {
    return generatePersonalizedRecommendation(user, conditions, wearableData, substitutionPrefs);
  }, [user, conditions, wearableData, substitutionPrefs]);

  // Preset scenarios
  const applyPreset = (preset: 'poor_sleep' | 'great_recovery' | 'moderate') => {
    if (preset === 'poor_sleep') {
      setSleepScore(48);
      setSleepHours(5.0);
      setDeepSleepMin(25);
      setRestingHr(75);
      setStressLevel('high');
    } else if (preset === 'great_recovery') {
      setSleepScore(88);
      setSleepHours(8.0);
      setDeepSleepMin(95);
      setRestingHr(62);
      setStressLevel('low');
    } else {
      setSleepScore(70);
      setSleepHours(7.0);
      setDeepSleepMin(60);
      setRestingHr(67);
      setStressLevel('moderate');
    }
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Top Banner / Hero Context */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 lg:p-8 shadow-sm">
        <div className="max-w-4xl space-y-3">
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400">
            <span>Motor de Inteligência Clínica & Fisiológica</span>
            <span>·</span>
            <span>Simulador em Tempo Real</span>
          </div>
          <h1 className="text-2xl lg:text-3xl font-bold tracking-tight text-white">
            Painel de Prescrição Adaptativa: Relógio + Patologias + Dieta
          </h1>
          <p className="text-sm text-slate-300 leading-relaxed max-w-3xl">
            Este simulador cruza a telemetria do <strong>Samsung Galaxy Fit 3</strong> com o histórico patológico 
            (<strong>Colesterol Total 400 mg/dL</strong> sem estatinas + <strong>Gastrite Erosiva</strong>) e calcula a rotina, o protocolo natural de suplementação e as substituições flexíveis para intolerância à lactose.
          </p>
        </div>

        {/* Quick Presets */}
        <div className="mt-6 pt-6 border-t border-slate-800 flex flex-wrap items-center gap-3">
          <span className="text-xs text-slate-400 font-medium">Testar Cenário do Galaxy Fit 3:</span>
          <button
            onClick={() => applyPreset('poor_sleep')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              sleepScore <= 55 ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            Noite Mal Dormida (Score 48, FC 75 bpm)
          </button>
          <button
            onClick={() => applyPreset('moderate')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              sleepScore > 55 && sleepScore < 80 ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            Recuperação Média (Score 70, FC 67 bpm)
          </button>
          <button
            onClick={() => applyPreset('great_recovery')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              sleepScore >= 80 ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            Sono Ótimo / Alta Prontidão (Score 88, FC 62 bpm)
          </button>
        </div>
      </div>

      {/* Main Grid: Controls vs Results */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Interactive Inputs & Hardware Simulator (5 Cols) */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Card 1: User Profile & Conditions */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Perfil Ativo do Usuário</h3>
                <p className="text-xs text-slate-500">Carlos Mendes, 38 anos · 78.5 kg · Meta: Longevidade & Lipídios</p>
              </div>
              <span className="text-[11px] font-mono text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                Acorda: {user.wakeTime} · Dorme: {user.bedTime}
              </span>
            </div>

            <div className="mt-4 space-y-3">
              <span className="text-xs font-semibold text-slate-700 block">Patologias Cadastradas:</span>
              
              {/* Condition 1: Cholesterol */}
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-900">Hipercolesterolemia Severa</span>
                  <span className="text-[11px] font-mono font-bold text-rose-700">Colesterol: 400 mg/dL</span>
                </div>
                <p className="text-[11px] text-slate-600">
                  Sem estatinas sintéticas por opção pessoal. Requer ativação de receptores LDLR e inibição de PCSK9 via fitoterápicos.
                </p>
              </div>

              {/* Condition 2: Gastritis */}
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-900">Gastrite Erosiva & DRGE</span>
                  <span className="text-[11px] font-semibold text-amber-700">Moderada</span>
                </div>
                <p className="text-[11px] text-slate-600">
                  Exige fracionamento de volume (max 400ml), jantar 3h antes de dormir e gastroproteção natural.
                </p>
              </div>

              {/* Condition 3: Lactose with Interactive Strategy */}
              <div className="p-3 rounded-lg bg-emerald-50/60 border border-emerald-200 text-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-emerald-950">Intolerância à Lactose (Estratégia Flexível)</span>
                </div>
                <p className="text-[11px] text-emerald-900">
                  O BioRytmo não impõe restrição única. Escolha a sua conduta atual:
                </p>

                <div className="grid grid-cols-1 gap-1.5 pt-1">
                  <label className="flex items-center gap-2 p-2 bg-white rounded border border-emerald-200 cursor-pointer hover:bg-emerald-50 transition-colors">
                    <input
                      type="radio"
                      name="lactose_mode"
                      value="enzymatic_supplement"
                      checked={lactoseMode === 'enzymatic_supplement'}
                      onChange={() => setLactoseMode('enzymatic_supplement')}
                      className="text-emerald-600 focus:ring-emerald-500"
                    />
                    <div className="text-[11px]">
                      <span className="font-bold text-slate-900 block">Opção A: Suplementação com Enzima Lactase</span>
                      <span className="text-slate-600">Consome laticínios tradicionais com 10.000 FCC antes da refeição</span>
                    </div>
                  </label>

                  <label className="flex items-center gap-2 p-2 bg-white rounded border border-emerald-200 cursor-pointer hover:bg-emerald-50 transition-colors">
                    <input
                      type="radio"
                      name="lactose_mode"
                      value="alternative_certified"
                      checked={lactoseMode === 'alternative_certified'}
                      onChange={() => setLactoseMode('alternative_certified')}
                      className="text-emerald-600 focus:ring-emerald-500"
                    />
                    <div className="text-[11px]">
                      <span className="font-bold text-slate-900 block">Opção B: Produtos Zero Lactose & Queijos Curados</span>
                      <span className="text-slate-600">Consome lácteos sem lactose e queijos envelhecidos (Parmesão)</span>
                    </div>
                  </label>

                  <label className="flex items-center gap-2 p-2 bg-white rounded border border-emerald-200 cursor-pointer hover:bg-emerald-50 transition-colors">
                    <input
                      type="radio"
                      name="lactose_mode"
                      value="strict_cut"
                      checked={lactoseMode === 'strict_cut'}
                      onChange={() => setLactoseMode('strict_cut')}
                      className="text-emerald-600 focus:ring-emerald-500"
                    />
                    <div className="text-[11px]">
                      <span className="font-bold text-slate-900 block">Opção C: Corte Estrito de Derivados Lácteos</span>
                      <span className="text-slate-600">100% à base de plantas com compensação óssea (Lithothamnium)</span>
                    </div>
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Card 2: Wearable Telemetry Controller (Galaxy Fit 3) */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Watch className="w-4 h-4 text-emerald-600" />
                <h3 className="text-sm font-bold text-slate-900">Simulador: Samsung Galaxy Fit 3</h3>
              </div>
              <span className="text-[11px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-mono">
                Sincronizado via Health Connect
              </span>
            </div>

            <p className="text-xs text-slate-500 mt-2">
              Altere os controles abaixo para simular como a noite de sono e os batimentos cardíacos alteram a rotina automaticamente:
            </p>

            <div className="mt-4 space-y-4">
              {/* Slider 1: Sleep Score */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="font-medium text-slate-700">Pontuação de Sono (Galaxy Sleep Score):</span>
                  <span className="font-mono font-bold text-slate-900">{sleepScore} / 100</span>
                </div>
                <input
                  type="range"
                  min="30"
                  max="100"
                  value={sleepScore}
                  onChange={(e) => setSleepScore(Number(e.target.value))}
                  className="w-full accent-emerald-600 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-600">
                  <span>30 (Insônia grave)</span>
                  <span>70 (Adequado)</span>
                  <span>100 (Sono perfeito)</span>
                </div>
              </div>

              {/* Slider 2: Sleep Duration */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="font-medium text-slate-700">Duração Total do Sono:</span>
                  <span className="font-mono font-bold text-slate-900">{sleepHours}h ({Math.round(sleepHours * 60)} min)</span>
                </div>
                <input
                  type="range"
                  min="4.0"
                  max="10.0"
                  step="0.5"
                  value={sleepHours}
                  onChange={(e) => setSleepHours(Number(e.target.value))}
                  className="w-full accent-emerald-600 cursor-pointer"
                />
              </div>

              {/* Slider 3: Deep Sleep */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="font-medium text-slate-700">Sono Profundo (Estágio N3):</span>
                  <span className="font-mono font-bold text-slate-900">{deepSleepMin} min</span>
                </div>
                <input
                  type="range"
                  min="15"
                  max="120"
                  step="5"
                  value={deepSleepMin}
                  onChange={(e) => setDeepSleepMin(Number(e.target.value))}
                  className="w-full accent-emerald-600 cursor-pointer"
                />
                <span className="text-[10px] text-slate-600 block">
                  Fundamental para reparo da barreira mucosa gástrica e modulação do cortisol matinal.
                </span>
              </div>

              {/* Slider 4: Resting Heart Rate */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="font-medium text-slate-700">FC de Repouso (RHR):</span>
                  <span className="font-mono font-bold text-slate-900">{restingHr} bpm</span>
                </div>
                <input
                  type="range"
                  min="55"
                  max="90"
                  value={restingHr}
                  onChange={(e) => setRestingHr(Number(e.target.value))}
                  className="w-full accent-emerald-600 cursor-pointer"
                />
                <span className="text-[10px] text-slate-600 block">
                  Baseline do usuário: 65 bpm. (Diferença: {restingHr - 65 > 0 ? `+${restingHr - 65}` : restingHr - 65} bpm)
                </span>
              </div>

              {/* Stress Level Buttons */}
              <div className="space-y-1.5 pt-1">
                <span className="text-xs font-medium text-slate-700 block">Nível de Estresse Estimado pelo Relógio:</span>
                <div className="grid grid-cols-3 gap-2">
                  {(['low', 'moderate', 'high'] as const).map((lvl) => (
                    <button
                      key={lvl}
                      type="button"
                      onClick={() => setStressLevel(lvl)}
                      className={`py-1.5 text-xs font-medium rounded border transition-colors ${
                        stressLevel === lvl
                          ? 'bg-slate-900 text-white border-slate-900'
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      {lvl === 'low' ? 'Baixo' : lvl === 'moderate' ? 'Moderado' : 'Alto'}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Dynamic Recommendation Engine Output (7 Cols) */}
        <div className="lg:col-span-7 space-y-6">

          {/* Biometric Autonomic Readiness Card */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-emerald-600" />
                <h2 className="text-base font-bold text-slate-900">
                  Prontidão Fisiológica Diária & Ajuste de Carga
                </h2>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500">Score Autonômico:</span>
                <span className={`text-sm font-bold font-mono px-2 py-0.5 rounded ${
                  recommendations.recoveryStatus === 'optimal'
                    ? 'bg-emerald-100 text-emerald-800'
                    : recommendations.recoveryStatus === 'moderate'
                    ? 'bg-amber-100 text-amber-800'
                    : 'bg-rose-100 text-rose-800'
                }`}>
                  {recommendations.autonomicReadinessScore} / 100
                </span>
              </div>
            </div>

            <div className="mt-4 p-3 rounded-lg bg-slate-50 border border-slate-200">
              <span className="text-xs font-semibold text-slate-900 block mb-1">
                Diagnóstico Fisiológico do Wearable:
              </span>
              <p className="text-xs text-slate-700 leading-relaxed">
                {recommendations.dailyWorkoutPrescription.wearableTriggerRationale}
              </p>
            </div>

            {/* Workout Prescription Comparison */}
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs">
                <span className="text-[11px] uppercase tracking-wider text-slate-500 font-semibold block mb-1">
                  Treino Original da Grade
                </span>
                <p className="font-semibold text-slate-800">{recommendations.dailyWorkoutPrescription.originalType}</p>
                <span className="text-[11px] text-slate-500 block mt-1">Intensidade planejada: Alta (HIIT)</span>
              </div>

              <div className={`p-3 rounded-lg border text-xs ${
                recommendations.recoveryStatus === 'depleted'
                  ? 'bg-rose-50/50 border-rose-200 text-rose-950'
                  : 'bg-emerald-50/50 border-emerald-200 text-emerald-950'
              }`}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[11px] uppercase tracking-wider font-bold block">
                    Prescrição Reajustada BioRytmo
                  </span>
                  <span className="font-mono text-[11px] font-bold">
                    {recommendations.dailyWorkoutPrescription.durationMinutes} min
                  </span>
                </div>
                <p className="font-bold">{recommendations.dailyWorkoutPrescription.adjustedType}</p>
                <span className="text-[11px] block mt-1 opacity-80">
                  {recommendations.recoveryStatus === 'depleted' 
                    ? 'Ajuste protetor: evita lesão da mucosa por vasoconstrição esplâncnica e elevação de cortisol.'
                    : 'Estímulo liberado: resposta parassimpática robusta.'}
                </span>
              </div>
            </div>
          </div>

          {/* Natural Protocol for High Cholesterol & Gastritis */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Pill className="w-5 h-5 text-indigo-600" />
                <div>
                  <h2 className="text-base font-bold text-slate-900">
                    Protocolo Natural de Suplementação Baseado em Evidências
                  </h2>
                  <p className="text-xs text-slate-500">
                    Alternativa clínica para Colesterol Total 400 mg/dL + Proteção de Mucosa Gástrica
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-2.5">
              {recommendations.activeSupplementsSchedule.map((supp, idx) => (
                <div key={idx} className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900">{supp.supplement}</span>
                      <span className="font-mono text-[11px] bg-slate-200/70 text-slate-700 px-2 py-0.5 rounded font-medium">
                        {supp.dosage}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-600 leading-relaxed">
                      {supp.reason}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-[10px] uppercase font-mono tracking-wider font-semibold text-indigo-700 bg-indigo-50 px-2 py-1 rounded block">
                      {supp.timeSlot === 'com_almoco' ? 'No Almoço' : supp.timeSlot === 'com_jantar' ? 'No Jantar' : supp.timeSlot === 'com_refeicao_manha' ? 'No Café' : 'Antes de Dormir'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Circadian Nutrition & Meal Timing */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Utensils className="w-5 h-5 text-emerald-600" />
                <div>
                  <h2 className="text-base font-bold text-slate-900">
                    Plano de Crononutrição & Janelas Biológicas
                  </h2>
                  <p className="text-xs text-slate-500">
                    Ajustado à gastrite (volume max 400ml), clearance lipídico e estratégia de lactose escolhida
                  </p>
                </div>
              </div>
              <span className="text-xs font-mono font-semibold text-slate-700 bg-slate-100 px-2.5 py-1 rounded">
                Meta de Água: {recommendations.circadianNutritionPlan.hydrationTargetMl} ml
              </span>
            </div>

            {/* Meals */}
            <div className="space-y-3">
              {/* Breakfast */}
              <div className="p-3.5 rounded-lg border border-slate-200 bg-slate-50/50 space-y-1.5 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900">
                    Café da Manhã Funcional ({recommendations.circadianNutritionPlan.breakfast.time})
                  </span>
                  <span className="text-[11px] text-emerald-700 font-medium">Gastroprotetor & Beta-glucana</span>
                </div>
                <ul className="list-disc list-inside text-slate-700 space-y-1 text-[11px]">
                  {recommendations.circadianNutritionPlan.breakfast.items.map((item, i) => (
                    <li key={i}>{item}</li>
                  ))}
                </ul>
                <p className="text-[10px] text-slate-600 pt-1 italic">
                  {recommendations.circadianNutritionPlan.breakfast.notes}
                </p>
              </div>

              {/* Lunch */}
              <div className="p-3.5 rounded-lg border border-slate-200 bg-slate-50/50 space-y-1.5 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900">
                    Almoço Antiaterogênico ({recommendations.circadianNutritionPlan.lunch.time})
                  </span>
                  <span className="text-[11px] text-indigo-700 font-medium">Fitoesteróis & Polifenóis</span>
                </div>
                <ul className="list-disc list-inside text-slate-700 space-y-1 text-[11px]">
                  {recommendations.circadianNutritionPlan.lunch.items.map((item, i) => (
                    <li key={i}>{item}</li>
                  ))}
                </ul>
              </div>

              {/* Dinner */}
              <div className="p-3.5 rounded-lg border border-slate-200 bg-slate-50/50 space-y-1.5 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900">
                    Jantar Leve de Fácil Digestão ({recommendations.circadianNutritionPlan.dinner.time})
                  </span>
                  <span className="text-[11px] text-amber-700 font-medium">Janela de 3h pré-sono</span>
                </div>
                <ul className="list-disc list-inside text-slate-700 space-y-1 text-[11px]">
                  {recommendations.circadianNutritionPlan.dinner.items.map((item, i) => (
                    <li key={i}>{item}</li>
                  ))}
                </ul>
                <p className="text-[10px] text-slate-600 pt-1 italic">
                  {recommendations.circadianNutritionPlan.dinner.notes}
                </p>
              </div>
            </div>
          </div>

          {/* Critical Lab Monitoring Alerts */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-amber-600" />
                <h2 className="text-base font-bold text-slate-900">
                  Monitoramento Laboratorial de Segurança
                </h2>
              </div>
              <span className="text-xs text-slate-500">Mapeamento Automático</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {recommendations.criticalLabAlerts.map((alert, i) => (
                <div key={i} className="p-3 rounded-lg border border-amber-200 bg-amber-50/50 text-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900">{alert.testName}</span>
                    <span className="text-[10px] font-mono font-bold text-amber-800 bg-amber-100 px-1.5 py-0.5 rounded">
                      {alert.dueDate}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-700">
                    {alert.rationale}
                  </p>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
