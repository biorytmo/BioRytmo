import React, { useState, useEffect } from 'react';
import { AuthScreen } from './components/mobile/AuthScreen';
import { MobileOnboardingWizard } from './components/mobile/MobileOnboardingWizard';
import { MobileDashboard } from './components/mobile/MobileDashboard';
import { DeveloperHubModal } from './components/mobile/DeveloperHubModal';
import { PWAInstallPromptModal } from './components/mobile/PWAInstallPromptModal';
import { usePWAInstall } from './hooks/usePWAInstall';
import { OnboardingState } from './types/health';

const INITIAL_USER_DATA: OnboardingState = {
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
      name: 'Fitoesteróis Livres Padronizados',
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

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<'dashboard' | 'wizard' | 'auth'>(() => {
    try {
      if (typeof window !== 'undefined') {
        const saved = localStorage.getItem('biorytmo_current_user');
        if (saved) return 'dashboard';
      }
    } catch {
      // fallback
    }
    return 'auth';
  });
  const [userData, setUserData] = useState<OnboardingState>(INITIAL_USER_DATA);
  const [showDevSheet, setShowDevSheet] = useState<boolean>(false);

  // PWA Installation Hook (A2HS & Standalone detection)
  const {
    isInstallable,
    hasNativePrompt,
    isInstalled,
    isIOS,
    showAutoPrompt,
    install,
    dismissPrompt,
    openPromptManually,
  } = usePWAInstall();

  const [installModalOpen, setInstallModalOpen] = useState<boolean>(false);

  // Automatically trigger install modal as soon as opened for the first time via link
  useEffect(() => {
    if (showAutoPrompt && !isInstalled) {
      setInstallModalOpen(true);
    }
  }, [showAutoPrompt, isInstalled]);

  const handleOpenInstall = () => {
    openPromptManually();
    setInstallModalOpen(true);
  };

  const handleCloseInstall = () => {
    dismissPrompt();
    setInstallModalOpen(false);
  };

  const handleLoginSuccess = (isFirstLogin: boolean, userEmail?: string) => {
    if (userEmail && userEmail.includes('@')) {
      const detectedName = userEmail.split('@')[0];
      setUserData(prev => ({
        ...prev,
        personal: {
          ...prev.personal,
          name: detectedName.charAt(0).toUpperCase() + detectedName.slice(1)
        }
      }));
    }
    if (isFirstLogin) {
      setCurrentScreen('wizard');
    } else {
      setCurrentScreen('dashboard');
    }
  };

  const handleWizardComplete = (newData: OnboardingState) => {
    setUserData(newData);
    setCurrentScreen('dashboard');
  };

  return (
    <div className="min-h-screen w-full bg-slate-900/5 sm:bg-slate-900/10 flex justify-center items-start text-slate-900 font-sans selection:bg-emerald-100 selection:text-emerald-900">
      {/* Smartphone Viewport Container */}
      <div className="w-full max-w-md min-h-screen bg-slate-50 flex flex-col shadow-2xl relative border-x border-slate-200/60 overflow-x-hidden">
        
        {currentScreen === 'dashboard' && (
          <MobileDashboard
            onboardingData={userData}
            onOpenOnboarding={() => setCurrentScreen('wizard')}
            onOpenDevSheet={() => setShowDevSheet(true)}
            onLogout={() => {
              try {
                localStorage.removeItem('biorytmo_current_user');
              } catch {}
              setCurrentScreen('auth');
            }}
            onOpenInstallModal={handleOpenInstall}
            isInstallable={isInstallable && !isInstalled}
          />
        )}

        {currentScreen === 'wizard' && (
          <MobileOnboardingWizard
            onComplete={handleWizardComplete}
            initialData={userData}
          />
        )}

        {currentScreen === 'auth' && (
          <AuthScreen
            onLoginSuccess={handleLoginSuccess}
            onOpenInstallModal={handleOpenInstall}
            isInstallable={isInstallable && !isInstalled}
          />
        )}

      </div>

      {/* First-visit & On-Demand PWA Installation Prompt Modal */}
      <PWAInstallPromptModal
        isOpen={installModalOpen}
        onClose={handleCloseInstall}
        onInstall={install}
        hasNativePrompt={hasNativePrompt}
        isIOS={isIOS}
        isInstalled={isInstalled}
      />

      {/* Developer & Architecture Hub Modal (Accessible via in-app top icon or profile tab) */}
      <DeveloperHubModal
        isOpen={showDevSheet}
        onClose={() => setShowDevSheet(false)}
      />
    </div>
  );
}
