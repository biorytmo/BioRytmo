import React, { useState } from 'react';
import { AuthScreen } from './AuthScreen';
import { MobileOnboardingWizard } from './MobileOnboardingWizard';
import { MobileDashboard } from './MobileDashboard';
import { OnboardingState } from '../../types/health';
import {
  Smartphone,
  Check,
  Sparkles,
  Layers,
  Code,
  Pill,
  ShoppingCart,
  Maximize2,
  Minimize2,
  LayoutGrid
} from 'lucide-react';

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
      currentStock: 4, // Alerta baixo (< 5 dias) para ativar lista de compras
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
  const [activeScreen, setActiveScreen] = useState<'dashboard' | 'wizard' | 'auth'>('dashboard');
  const [onboardingData, setOnboardingData] = useState<OnboardingState>(DEFAULT_ONBOARDING_DATA);
  const [viewStyle, setViewStyle] = useState<'app_focus' | 'studio'>('app_focus');

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
      {/* App Mode Control Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-3.5 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-xs font-bold text-slate-900">Aplicativo BioRytmo Mobile</span>
          <span className="text-slate-300">·</span>
          <span className="text-[11px] font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-medium">
            Supabase: dghygagvamygvxudvwtn
          </span>
        </div>

        {/* Screen Switcher */}
        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl">
          <button
            type="button"
            onClick={() => setActiveScreen('dashboard')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
              activeScreen === 'dashboard'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Dashboard
          </button>
          <button
            type="button"
            onClick={() => setActiveScreen('wizard')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
              activeScreen === 'wizard'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Onboarding (8 Passos)
          </button>
          <button
            type="button"
            onClick={() => setActiveScreen('auth')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
              activeScreen === 'auth'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Login Supabase
          </button>

          <span className="w-px h-4 bg-slate-300 mx-1" />

          {/* Toggle View Style: Focused vs Studio */}
          <button
            type="button"
            onClick={() => setViewStyle(viewStyle === 'app_focus' ? 'studio' : 'app_focus')}
            className="p-1.5 text-slate-600 hover:text-slate-900 rounded-lg transition-colors cursor-pointer"
            title={viewStyle === 'app_focus' ? 'Exibir especificações técnicas ao lado' : 'Modo Foco no App'}
          >
            {viewStyle === 'app_focus' ? (
              <LayoutGrid className="w-4 h-4 text-slate-600" />
            ) : (
              <Maximize2 className="w-4 h-4 text-emerald-600" />
            )}
          </button>
        </div>
      </div>

      {/* Main Viewport Container */}
      {viewStyle === 'app_focus' ? (
        /* FOCUSED APP VIEW: Centered, clean, native feel */
        <div className="flex justify-center py-2">
          <div className="w-full max-w-[430px] bg-slate-950 p-3 sm:p-4 rounded-[44px] shadow-2xl border-4 border-slate-800">
            {/* Phone Notch */}
            <div className="w-full flex items-center justify-between px-6 pt-2 pb-1 text-white text-[11px] font-mono select-none">
              <span>09:45</span>
              <div className="w-24 h-4 bg-black rounded-full mx-auto" />
              <div className="flex items-center gap-1.5">
                <span className="text-[10px]">5G</span>
                <span>100%</span>
              </div>
            </div>

            {/* Screen Content Viewport */}
            <div className="bg-slate-100 rounded-[34px] overflow-hidden min-h-[700px] max-h-[820px] overflow-y-auto">
              {activeScreen === 'dashboard' && (
                <MobileDashboard
                  onboardingData={onboardingData}
                  onOpenOnboarding={() => setActiveScreen('wizard')}
                />
              )}
              {activeScreen === 'wizard' && (
                <MobileOnboardingWizard
                  onComplete={handleWizardComplete}
                  initialData={onboardingData}
                />
              )}
              {activeScreen === 'auth' && (
                <AuthScreen onLoginSuccess={handleLoginSuccess} />
              )}
            </div>

            {/* Home Indicator Bar */}
            <div className="w-32 h-1 bg-slate-700 rounded-full mx-auto mt-3 mb-1" />
          </div>
        </div>
      ) : (
        /* STUDIO VIEW: Side-by-side with documentation and code specs */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Phone Mockup */}
          <div className="lg:col-span-6 flex justify-center">
            <div className="w-full max-w-[420px] bg-slate-950 p-3 rounded-[44px] shadow-2xl border-4 border-slate-800">
              <div className="w-full flex items-center justify-between px-6 pt-2 pb-1 text-white text-[11px] font-mono">
                <span>09:45</span>
                <div className="w-20 h-4 bg-black rounded-full mx-auto" />
                <div className="flex items-center gap-1">
                  <span>5G</span>
                  <span>100%</span>
                </div>
              </div>

              <div className="bg-slate-100 rounded-[34px] overflow-hidden min-h-[680px] max-h-[750px] overflow-y-auto">
                {activeScreen === 'dashboard' && (
                  <MobileDashboard
                    onboardingData={onboardingData}
                    onOpenOnboarding={() => setActiveScreen('wizard')}
                  />
                )}
                {activeScreen === 'wizard' && (
                  <MobileOnboardingWizard
                    onComplete={handleWizardComplete}
                    initialData={onboardingData}
                  />
                )}
                {activeScreen === 'auth' && (
                  <AuthScreen onLoginSuccess={handleLoginSuccess} />
                )}
              </div>

              <div className="w-32 h-1 bg-slate-700 rounded-full mx-auto mt-2.5 mb-1" />
            </div>
          </div>

          {/* Right Column: Technical Explanations */}
          <div className="lg:col-span-6 space-y-4 text-xs">
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-600" />
                <span>Interações em Tempo Real do App</span>
              </h3>

              <div className="space-y-2.5 text-slate-600 leading-relaxed">
                <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 space-y-1">
                  <strong className="text-slate-900 block">Botão "Já Tomei" & Baixa de Estoque:</strong>
                  <p>
                    Clique em "Já tomei" em qualquer medicação no Dashboard. O estoque decrementa no ato e se atingir $\le 5$ dias restantes, dispara a <strong>Lista de Compras de Farmácia</strong> automaticamente.
                  </p>
                </div>

                <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 space-y-1">
                  <strong className="text-slate-900 block">Abas Inferiores do Smartphone:</strong>
                  <p>
                    Toque em <strong>Remédios</strong> para adicionar novos medicamentos, <strong>Farmácia</strong> para a lista de reposição com botão "Comprei +30", e <strong>Galaxy Fit</strong> para simular alterações de sono e FC de repouso.
                  </p>
                </div>

                <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 space-y-1">
                  <strong className="text-slate-900 block">Integração Supabase:</strong>
                  <p>
                    Conectado ao seu projeto <code>dghygagvamygvxudvwtn.supabase.co</code> via <code>@supabase/supabase-js</code>.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
