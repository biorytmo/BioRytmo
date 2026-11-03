import React, { useState } from 'react';
import { AuthScreen } from './AuthScreen';
import { MobileOnboardingWizard } from './MobileOnboardingWizard';
import { MobileDashboard } from './MobileDashboard';
import { OnboardingState } from '../../types/health';
import { Smartphone, Check, Sparkles, Layers, Code, Pill, ShoppingCart, RefreshCw } from 'lucide-react';

const DEFAULT_ONBOARDING_DATA: OnboardingState = {
  currentStep: 8,
  personal: {
    name: 'Carlos Mendes',
    birthDate: '1988-06-14',
    gender: 'male',
    heightCm: 177,
    weightKg: 78.5
  },
  gutHealth: ['Gastrite', 'Refluxo / DRGE', 'Intolerância à Lactose'],
  mentalHealth: ['Ansiedade', 'Insônia Crônica'],
  chronicConditions: ['Hipercolesterolemia (Colesterol Alto)'],
  medications: [
    {
      id: 'med_1',
      name: 'Fitoesteróis Livres',
      dosage: '1.000 mg',
      type: 'continuous',
      continuousFrequency: 'daily',
      startDate: '2026-11-01',
      times: ['12:30', '19:30'],
      currentStock: 6, // Baixo estoque deliberado para demonstrar alerta (< 5 dias)
      minStockAlertDays: 5,
      unit: 'cápsulas',
      instructions: '15 min antes das refeições principais'
    },
    {
      id: 'med_2',
      name: 'Berberina Fitossomada',
      dosage: '500 mg',
      type: 'continuous',
      continuousFrequency: 'daily',
      startDate: '2026-11-01',
      times: ['12:30', '19:30'],
      currentStock: 40,
      minStockAlertDays: 5,
      unit: 'cápsulas',
      instructions: 'Junto com a refeição (ativação AMPK)'
    },
    {
      id: 'med_3',
      name: 'Amoxicilina + Clavulanato',
      dosage: '875 mg',
      type: 'temporary',
      intervalHours: 12,
      startDate: '2026-11-01',
      endDate: '2026-11-08',
      times: ['08:00', '20:00'],
      currentStock: 10,
      unit: 'comprimidos',
      instructions: 'De 12 em 12h com água'
    }
  ],
  wearables: {
    deviceModel: 'Samsung Galaxy Fit 3',
    trackedMetrics: ['sono', 'frequencia_cardiaca', 'estresse'],
    manualOverride: true
  },
  labFiles: [
    { id: 'f1', name: 'Perfil_Lipidico_ApoB.pdf', size: '1.4 MB', date: '2026-10-24', type: 'application/pdf' },
    { id: 'f2', name: 'Endoscopia_Digestiva_Alta.jpg', size: '2.8 MB', date: '2026-08-15', type: 'image/jpeg' }
  ],
  goals: ['cholesterol', 'gut', 'sleep']
};

export const MobileExperienceViewer: React.FC = () => {
  const [activeScreen, setActiveScreen] = useState<'auth' | 'wizard' | 'dashboard' | 'code_logic'>('dashboard');
  const [onboardingData, setOnboardingData] = useState<OnboardingState>(DEFAULT_ONBOARDING_DATA);

  const handleLoginSuccess = (isFirstLogin: boolean) => {
    if (isFirstLogin) {
      setActiveScreen('wizard');
    } else {
      setActiveScreen('dashboard');
    }
  };

  const handleWizardComplete = (data: OnboardingState) => {
    setOnboardingData(data);
    setActiveScreen('dashboard');
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner Context */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 lg:p-8 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="max-w-3xl space-y-2">
            <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400">
              <Smartphone className="w-4 h-4" />
              <span>Simulador Mobile-First</span>
              <span>·</span>
              <span>Next.js + Tailwind CSS + Supabase</span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight">
              Fluxo Mobile Completo: Auth ➔ Wizard 8 Passos ➔ Dashboard
            </h1>
            <p className="text-xs text-slate-300 leading-relaxed">
              Teste a experiência no formato de smartphone: faça login com Supabase Auth, preencha o questionário passo a passo (com dados pessoais, saúde mental/intestinal, medicamentos contínuos e temporários com cálculo de estoque) e explore o Dashboard mobile gerado com o botão <strong>"Já tomei"</strong> e a lista automática de farmácia.
            </p>
          </div>

          {/* Mode Switcher */}
          <div className="flex flex-wrap items-center gap-2 bg-slate-800 p-1.5 rounded-xl border border-slate-700">
            <button
              onClick={() => setActiveScreen('auth')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                activeScreen === 'auth' ? 'bg-emerald-600 text-white' : 'text-slate-300 hover:text-white'
              }`}
            >
              1. Login Supabase
            </button>
            <button
              onClick={() => setActiveScreen('wizard')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                activeScreen === 'wizard' ? 'bg-emerald-600 text-white' : 'text-slate-300 hover:text-white'
              }`}
            >
              2. Onboarding (8 Passos)
            </button>
            <button
              onClick={() => setActiveScreen('dashboard')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                activeScreen === 'dashboard' ? 'bg-emerald-600 text-white' : 'text-slate-300 hover:text-white'
              }`}
            >
              3. Dashboard Mobile
            </button>
          </div>
        </div>
      </div>

      {/* Main Container: Mobile Frame + Technical Explanations */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Interactive Mobile Phone Mockup (6 Cols) */}
        <div className="lg:col-span-6 flex justify-center">
          <div className="w-full max-w-[420px] bg-slate-950 p-3 rounded-[44px] shadow-2xl border-4 border-slate-800">
            {/* Phone Notch / Dynamic Island */}
            <div className="w-full flex items-center justify-between px-6 pt-2 pb-1 text-white text-[11px] font-mono">
              <span>09:45</span>
              <div className="w-20 h-4 bg-black rounded-full mx-auto" />
              <div className="flex items-center gap-1">
                <span>5G</span>
                <span>100%</span>
              </div>
            </div>

            {/* Screen Content Viewport */}
            <div className="bg-slate-50 rounded-[34px] overflow-hidden min-h-[680px] max-h-[750px] overflow-y-auto">
              {activeScreen === 'auth' && (
                <AuthScreen onLoginSuccess={handleLoginSuccess} />
              )}
              {activeScreen === 'wizard' && (
                <MobileOnboardingWizard
                  onComplete={handleWizardComplete}
                  initialData={onboardingData}
                />
              )}
              {activeScreen === 'dashboard' && (
                <MobileDashboard
                  onboardingData={onboardingData}
                  onOpenOnboarding={() => setActiveScreen('wizard')}
                />
              )}
            </div>

            {/* Home Indicator Bar */}
            <div className="w-32 h-1 bg-slate-700 rounded-full mx-auto mt-2.5 mb-1" />
          </div>
        </div>

        {/* Right Column: Architectural & Clinical Explanations (6 Cols) */}
        <div className="lg:col-span-6 space-y-5 text-xs">
          
          {/* Card 1: Features demonstrated */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-3">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-600" />
              <span>Funcionalidades Demonstradas no Mobile</span>
            </h3>

            <div className="space-y-2.5 text-slate-600 leading-relaxed">
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 space-y-1">
                <strong className="text-slate-900 block">1. Redirecionamento Obrigatório (1º Acesso):</strong>
                <p>
                  A coluna <code>onboarding_completed</code> na tabela <code>profiles</code> controla o fluxo. Se <code>false</code>, o Next.js / React Router força o redirecionamento imediato para a rota <code>/onboarding</code>.
                </p>
              </div>

              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 space-y-1">
                <strong className="text-slate-900 block">2. Medicamentos Contínuos vs Temporários com Estoque:</strong>
                <p>
                  No Passo 5, tratamentos agudos (ex: antibióticos de 8 em 8 horas) calculam a quantidade total exata até a data de término e alertam se o número de caixas for insuficiente.
                </p>
              </div>

              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 space-y-1">
                <strong className="text-slate-900 block">3. Botão "Já Tomei" com Baixa Automática:</strong>
                <p>
                  No Dashboard, ao clicar em "Já tomei", a dose é registrada, o estoque é decrementado na hora e, se restar menos de 5 dias, o item é injetado automaticamente na <strong>Lista de Compras de Farmácia</strong>.
                </p>
              </div>

              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 space-y-1">
                <strong className="text-slate-900 block">4. Ajuste Pelo Galaxy Fit 3 em Tempo Real:</strong>
                <p>
                  O botão "Fit 3" no topo do celular permite alternar entre sono bom e sono ruim, reajustando na hora o treino e a suplementação para gastrite e colesterol.
                </p>
              </div>
            </div>
          </div>

          {/* Card 2: TypeScript Business Logic Snippet */}
          <div className="bg-slate-950 text-white rounded-xl border border-slate-800 p-5 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <span className="font-mono text-emerald-400 font-bold text-xs flex items-center gap-2">
                <Code className="w-4 h-4" />
                <span>medicationStockService.ts</span>
              </span>
              <span className="text-[10px] text-slate-400 font-mono">Lógica Pura</span>
            </div>

            <pre className="font-mono text-[11px] text-slate-300 overflow-x-auto max-h-56 leading-relaxed bg-slate-900/60 p-3 rounded">
{`// Taxa diária de consumo contínuo
export function calculateContinuousDailyRate(med) {
  const dosesPerDay = med.times.length;
  if (med.continuousFrequency === 'alternate_days') {
    return dosesPerDay / 2; // dia sim, dia não
  }
  return dosesPerDay;
}

// Dias restantes e projeção de esgotamento
const daysRemaining = Math.floor(med.currentStock / dailyRate);
const isLowStock = daysRemaining <= (med.minStockAlertDays ?? 5);

// Tratamento temporário com data final
const totalDosesNeeded = totalDays * (24 / med.intervalHours);
const insufficient = med.currentStock < (totalDosesNeeded - consumed);`}
            </pre>
          </div>

        </div>
      </div>
    </div>
  );
};
