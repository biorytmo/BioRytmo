import React, { useState, useMemo } from 'react';
import {
  OnboardingState,
  UserMedication,
  WearableBiometrics
} from '../../types/health';
import {
  calculateMedicationStock,
  generateSmartPharmacyShoppingList,
  recordDoseTaken
} from '../../services/medicationStockService';
import { generatePersonalizedRecommendation } from '../../services/recommendationEngine';
import {
  HeartPulse,
  Watch,
  Pill,
  ShoppingCart,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Utensils,
  Dumbbell,
  ShieldCheck,
  ChevronRight,
  Flame,
  Moon,
  Sparkles,
  RefreshCw,
  Plus,
  Trash2,
  Calendar,
  Check,
  Activity,
  User,
  Settings,
  FileText,
  LogOut,
  SlidersHorizontal,
  FileUp,
  Info,
  CheckCheck,
  Download
} from 'lucide-react';

interface MobileDashboardProps {
  onboardingData: OnboardingState;
  onOpenOnboarding?: () => void;
  onOpenDevSheet?: () => void;
  onLogout?: () => void;
  onOpenInstallModal?: () => void;
  isInstallable?: boolean;
}

export const MobileDashboard: React.FC<MobileDashboardProps> = ({
  onboardingData,
  onOpenOnboarding,
  onOpenDevSheet,
  onLogout,
  onOpenInstallModal,
  isInstallable
}) => {
  const [medications, setMedications] = useState<UserMedication[]>(onboardingData.medications);
  const [simulatedSleepScore, setSimulatedSleepScore] = useState<number>(54);
  const [simulatedRestingHr, setSimulatedRestingHr] = useState<number>(74);
  const [simulatedDeepSleep, setSimulatedDeepSleep] = useState<number>(35);
  const [simulatedStress, setSimulatedStress] = useState<'low' | 'moderate' | 'high'>('high');
  const [activeTab, setActiveTab] = useState<'home' | 'meds' | 'shopping' | 'wearable' | 'profile'>('home');
  const [doseToast, setDoseToast] = useState<string | null>(null);

  // New medication form inside 'meds' tab
  const [showAddMedModal, setShowAddMedModal] = useState<boolean>(false);
  const [newMedName, setNewMedName] = useState<string>('');
  const [newMedDosage, setNewMedDosage] = useState<string>('');
  const [newMedType, setNewMedType] = useState<'continuous' | 'temporary'>('continuous');
  const [newMedStock, setNewMedStock] = useState<number>(30);
  const [newMedTimes, setNewMedTimes] = useState<string>('08:00');

  // Custom item in shopping list
  const [customShopItem, setCustomShopItem] = useState<string>('');
  const [extraShoppingItems, setExtraShoppingItems] = useState<{ id: string; name: string; checked: boolean }[]>([]);

  // Wearable simulated live state
  const wearableData: WearableBiometrics = useMemo(() => ({
    deviceId: 'samsung_galaxy_fit3',
    deviceModel: 'Samsung Galaxy Fit 3',
    timestamp: new Date().toISOString(),
    sleepScore: simulatedSleepScore,
    totalSleepMinutes: 345, // ~5.7h
    deepSleepMinutes: simulatedDeepSleep,
    remSleepMinutes: 65,
    lightSleepMinutes: Math.max(0, 345 - simulatedDeepSleep - 65),
    restingHeartRateBpm: simulatedRestingHr,
    baselineRestingHeartRateBpm: 65,
    hrvRmssdMs: simulatedRestingHr > 70 ? 28 : 55,
    stressLevel: simulatedStress,
    stepsCount: 6420,
    activeCalories: 310,
    recoveryStatus: simulatedSleepScore < 60 || simulatedRestingHr >= 73 ? 'depleted' : simulatedSleepScore >= 80 ? 'optimal' : 'moderate'
  }), [simulatedSleepScore, simulatedDeepSleep, simulatedRestingHr, simulatedStress]);

  // Daily recommendation based on profile + conditions + wearable
  const recommendation = useMemo(() => {
    return generatePersonalizedRecommendation(
      {
        id: 'usr_carlos',
        name: onboardingData.personal.name,
        age: 38,
        gender: onboardingData.personal.gender,
        heightCm: onboardingData.personal.heightCm,
        weightKg: onboardingData.personal.weightKg,
        activityLevel: 'moderate',
        primaryGoal: 'cholesterol_control',
        wakeTime: '06:30',
        bedTime: '22:30',
        baselineRestingHR: 65
      },
      [
        { id: 'cholesterol_severe', code: 'E78.0', name: 'Hipercolesterolemia Severa', category: 'cardiovascular', severity: 'severe' },
        { id: 'gastritis_gerd', code: 'K29.0', name: 'Gastrite Erosiva Antral', category: 'gastrointestinal', severity: 'moderate' },
        { id: 'lactose_intolerance', code: 'E73.0', name: 'Intolerância à Lactose', category: 'intolerance', severity: 'moderate' }
      ],
      wearableData,
      [{ intoleranceCode: 'lactose', preferredMode: 'enzymatic_supplement' }]
    );
  }, [onboardingData, wearableData]);

  // Shopping list generated dynamically
  const autoShoppingList = useMemo(() => {
    return generateSmartPharmacyShoppingList(medications);
  }, [medications]);

  // Calculate BMI
  const heightM = onboardingData.personal.heightCm / 100;
  const bmi = (onboardingData.personal.weightKg / (heightM * heightM)).toFixed(1);

  // Confirm dose taken handler with toast feedback
  const handleTakeDose = (medId: string) => {
    const { updatedMedications, updatedMed } = recordDoseTaken(medications, medId);
    setMedications(updatedMedications);
    setDoseToast(`Dose de ${updatedMed.name} confirmada! Estoque restante: ${updatedMed.currentStock} un.`);
    setTimeout(() => setDoseToast(null), 3000);
  };

  // Restock handler
  const handleRestock = (medId: string, quantityToAdd: number = 30) => {
    setMedications(medications.map(m => {
      if (m.id === medId) {
        return { ...m, currentStock: m.currentStock + quantityToAdd };
      }
      return m;
    }));
    setDoseToast(`Estoque reabastecido (+${quantityToAdd} doses) com sucesso!`);
    setTimeout(() => setDoseToast(null), 3000);
  };

  // Quick preset toggle for wearable
  const setWearablePreset = (type: 'poor' | 'great') => {
    if (type === 'poor') {
      setSimulatedSleepScore(48);
      setSimulatedRestingHr(76);
      setSimulatedDeepSleep(25);
      setSimulatedStress('high');
      setDoseToast('Simulado: Noite mal dormida (depleção) detectada!');
    } else {
      setSimulatedSleepScore(88);
      setSimulatedRestingHr(62);
      setSimulatedDeepSleep(90);
      setSimulatedStress('low');
      setDoseToast('Simulado: Sono reparador e recuperação ótima!');
    }
    setTimeout(() => setDoseToast(null), 3000);
  };

  // Add medication from 'meds' tab
  const handleAddMedicationSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMedName.trim() || !newMedDosage.trim()) return;

    const newMed: UserMedication = {
      id: `med_${Date.now()}`,
      name: newMedName.trim(),
      dosage: newMedDosage.trim(),
      type: newMedType,
      continuousFrequency: 'daily',
      startDate: new Date().toISOString().substring(0, 10),
      endDate: newMedType === 'temporary' ? '2026-11-15' : undefined,
      times: [newMedTimes],
      currentStock: Number(newMedStock),
      unit: 'comprimidos',
      instructions: 'Tomar com água',
      minStockAlertDays: 5
    };

    setMedications([...medications, newMed]);
    setNewMedName('');
    setNewMedDosage('');
    setShowAddMedModal(false);
    setDoseToast(`${newMed.name} cadastrado com sucesso!`);
    setTimeout(() => setDoseToast(null), 3000);
  };

  // Add custom shopping item
  const handleAddCustomShopItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customShopItem.trim()) return;
    setExtraShoppingItems([...extraShoppingItems, {
      id: `custom_${Date.now()}`,
      name: customShopItem.trim(),
      checked: false
    }]);
    setCustomShopItem('');
  };

  const toggleCustomShopItem = (id: string) => {
    setExtraShoppingItems(extraShoppingItems.map(item =>
      item.id === id ? { ...item, checked: !item.checked } : item
    ));
  };

  return (
    <div className="w-full min-h-screen bg-slate-100 flex flex-col text-slate-900 font-sans pb-24">
      
      {/* Mobile Top App Bar */}
      <header className="sticky top-0 z-30 bg-slate-900 text-white px-4 pt-4 pb-3 shadow-md">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center font-bold text-emerald-400 text-xs">
              {onboardingData.personal.name.substring(0, 2).toUpperCase()}
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block uppercase tracking-wider font-semibold">
                BioRytmo Health OS
              </span>
              <h1 className="text-sm font-bold text-white truncate max-w-[170px]">
                Olá, {onboardingData.personal.name.split(' ')[0]}!
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {/* PWA Install Button */}
            {onOpenInstallModal && isInstallable && (
              <button
                type="button"
                onClick={onOpenInstallModal}
                className="flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white shadow-xs transition-all cursor-pointer active:scale-95 animate-pulse"
                title="Instalar BioRytmo no Celular"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Instalar</span>
              </button>
            )}

            {/* Live Galaxy Fit 3 sync indicator */}
            <button
              type="button"
              onClick={() => setActiveTab('wearable')}
              className="flex items-center gap-1 text-[11px] font-mono px-2 py-1 rounded-full bg-slate-800 hover:bg-slate-700 text-emerald-400 border border-slate-700 transition-colors cursor-pointer"
              title="Samsung Galaxy Fit 3 sincronizado via Health Connect"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>Fit 3 · {wearableData.sleepScore}pts</span>
            </button>

            {/* Developer/Architecture Drawer Button */}
            {onOpenDevSheet && (
              <button
                type="button"
                onClick={onOpenDevSheet}
                className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
                title="Abrir Central Técnica & Supabase DDL SQL"
                aria-label="Central Técnica"
              >
                <Settings className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Biometric Mini Ribbon */}
        <div className="grid grid-cols-3 gap-2 pt-2.5 text-[11px]">
          <div 
            onClick={() => setActiveTab('wearable')}
            className="bg-slate-800/80 p-2 rounded-xl border border-slate-700/60 cursor-pointer hover:bg-slate-800 transition-colors"
          >
            <span className="text-[10px] text-slate-400 block">Sono (Fit 3)</span>
            <span className="font-bold text-white font-mono">
              {Math.floor(wearableData.totalSleepMinutes / 60)}h {wearableData.totalSleepMinutes % 60}m
            </span>
          </div>

          <div 
            onClick={() => setActiveTab('wearable')}
            className="bg-slate-800/80 p-2 rounded-xl border border-slate-700/60 cursor-pointer hover:bg-slate-800 transition-colors"
          >
            <span className="text-[10px] text-slate-400 block">FC Repouso</span>
            <span className="font-bold text-white font-mono">
              {wearableData.restingHeartRateBpm} bpm
            </span>
          </div>

          <div 
            onClick={() => setActiveTab('wearable')}
            className="bg-slate-800/80 p-2 rounded-xl border border-slate-700/60 cursor-pointer hover:bg-slate-800 transition-colors"
          >
            <span className="text-[10px] text-slate-400 block">Recuperação</span>
            <span className={`font-bold font-mono text-[10px] ${
              wearableData.recoveryStatus === 'optimal' ? 'text-emerald-400' : 'text-rose-400'
            }`}>
              {wearableData.recoveryStatus === 'optimal' ? 'Alta (Ótima)' : 'Depleção (Baixa)'}
            </span>
          </div>
        </div>
      </header>

      {/* Real-time Dose Taken Toast */}
      {doseToast && (
        <div className="sticky top-[104px] z-20 bg-emerald-600 text-white text-xs px-4 py-2 font-medium flex items-center justify-between shadow-md transition-all">
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-200" />
            <span>{doseToast}</span>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="p-4 flex-1 space-y-4 max-w-md w-full mx-auto">
        
        {/* ========================================================= */}
        {/* TAB 1: INÍCIO (DAILY SUMMARY, TODAY'S ADAPTATIONS) */}
        {/* ========================================================= */}
        {activeTab === 'home' && (
          <>
            {/* Wearable Autonomic Alert Card */}
            <div className={`p-4 rounded-2xl border text-xs space-y-2 ${
              wearableData.recoveryStatus === 'depleted'
                ? 'bg-rose-50 border-rose-200 text-rose-950 shadow-xs'
                : 'bg-emerald-50 border-emerald-200 text-emerald-950 shadow-xs'
            }`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 font-bold">
                  <Watch className="w-4 h-4 text-emerald-700" />
                  <span>Ajuste da Rotina Pelo Galaxy Fit 3</span>
                </div>
                <span className="font-mono text-[10px] font-semibold bg-white/90 px-2 py-0.5 rounded shadow-xs">
                  Score: {recommendation.autonomicReadinessScore}/100
                </span>
              </div>
              <p className="text-[11px] leading-relaxed opacity-90">
                {recommendation.dailyWorkoutPrescription.wearableTriggerRationale}
              </p>
              <div className="pt-1 flex items-center justify-between font-semibold text-[11px] border-t border-black/5">
                <span>Treino Adaptado:</span>
                <span className="text-right font-medium">{recommendation.dailyWorkoutPrescription.adjustedType.split('[')[0]}</span>
              </div>
            </div>

            {/* Quick Dose Timeline Today */}
            <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Pill className="w-4 h-4 text-indigo-600" />
                  <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wide">
                    Próximas Doses do Dia
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveTab('meds')}
                  className="text-[11px] text-emerald-700 font-semibold hover:underline cursor-pointer"
                >
                  Ver todos ({medications.length})
                </button>
              </div>

              <div className="space-y-2.5">
                {medications.slice(0, 3).map((med) => {
                  const stockData = calculateMedicationStock(med);
                  const isTaken = (med.takenTodayCount || 0) > 0;

                  return (
                    <div
                      key={med.id}
                      className="p-3 rounded-xl border border-slate-200 bg-slate-50/70 text-xs flex items-center justify-between gap-3"
                    >
                      <div className="space-y-0.5 min-w-0">
                        <div className="flex items-center gap-1.5 truncate">
                          <span className="font-bold text-slate-900 truncate">{med.name}</span>
                          <span className="font-mono text-[10px] bg-slate-200 text-slate-700 px-1.5 py-0.5 rounded shrink-0">
                            {med.dosage}
                          </span>
                        </div>
                        <span className="text-[10px] text-slate-500 block">
                          Horários: {med.times.join(' · ')} · Estoque: {med.currentStock} {med.unit}
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleTakeDose(med.id)}
                        className={`min-h-[44px] px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shrink-0 active:scale-95 ${
                          isTaken
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                            : 'bg-slate-900 text-white hover:bg-slate-800 shadow-xs'
                        }`}
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>{isTaken ? `Tomado` : 'Já tomei'}</span>
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Quick Pharmacy Alert Banner if any stock is low */}
            {autoShoppingList.length > 0 && (
              <div 
                onClick={() => setActiveTab('shopping')}
                className="p-3.5 rounded-2xl bg-amber-500/15 border border-amber-300 flex items-center justify-between gap-3 cursor-pointer hover:bg-amber-500/20 transition-colors shadow-xs"
              >
                <div className="flex items-center gap-2.5">
                  <ShoppingCart className="w-5 h-5 text-amber-700 shrink-0" />
                  <div>
                    <span className="font-bold text-xs text-amber-950 block">
                      {autoShoppingList.length} medicamento(s) com estoque baixo!
                    </span>
                    <span className="text-[10px] text-amber-800">
                      Toque para abrir a Lista de Compras para Farmácia.
                    </span>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-amber-700 shrink-0" />
              </div>
            )}

            {/* Nutrition & Supplements Section */}
            <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs space-y-3 text-xs">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <Utensils className="w-4 h-4 text-emerald-600" />
                  <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wide">
                    Nutrição Flexível do Dia
                  </h2>
                </div>
                <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                  Colesterol + Gastrite
                </span>
              </div>

              <div className="p-3 rounded-xl bg-indigo-50/70 border border-indigo-200 text-[11px] text-indigo-950 space-y-1">
                <strong className="block font-bold">Conduta de Lactose Ativa:</strong>
                <p>Consumo liberado associando <strong>1 cápsula de Lactase 10.000 FCC</strong> imediatamente antes da refeição com lácteos.</p>
              </div>

              <div className="space-y-2">
                <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 flex justify-between items-center text-[11px]">
                  <span>Café da Manhã: Mingau com <strong>3g de Beta-glucana</strong></span>
                  <span className="text-[10px] text-slate-400 font-mono">07:30</span>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 flex justify-between items-center text-[11px]">
                  <span>Almoço: <strong>Fitoesteróis (1g)</strong> + <strong>Berberina (500mg)</strong></span>
                  <span className="text-[10px] text-slate-400 font-mono">12:30</span>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 flex justify-between items-center text-[11px]">
                  <span>Jantar: <strong>Fitoesteróis (1g)</strong> + <strong>Ômega-3 EPA/DHA</strong></span>
                  <span className="text-[10px] text-slate-400 font-mono">19:30</span>
                </div>
              </div>
            </div>
          </>
        )}

        {/* ========================================================= */}
        {/* TAB 2: REMÉDIOS (ALL MEDICATIONS & INVENTORY CONTROLLER) */}
        {/* ========================================================= */}
        {activeTab === 'meds' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold text-slate-900">
                  Medicamentos & Suplementos
                </h2>
                <p className="text-[10px] text-slate-500">
                  Uso contínuo e tratamentos agudos com controle de estoque
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowAddMedModal(!showAddMedModal)}
                className="min-h-[40px] px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs flex items-center gap-1.5 cursor-pointer shadow-xs active:scale-95 transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>Adicionar</span>
              </button>
            </div>

            {/* Quick Add Form Modal */}
            {showAddMedModal && (
              <form onSubmit={handleAddMedicationSubmit} className="p-4 rounded-2xl bg-white border border-emerald-300 shadow-sm space-y-3 text-xs">
                <span className="font-bold text-slate-900 block">Novo Medicamento / Suplemento</span>
                
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    required
                    value={newMedName}
                    onChange={(e) => setNewMedName(e.target.value)}
                    placeholder="Nome (ex: Ômega-3)"
                    className="p-2.5 rounded-lg border border-slate-200 text-xs focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                  <input
                    type="text"
                    required
                    value={newMedDosage}
                    onChange={(e) => setNewMedDosage(e.target.value)}
                    placeholder="Dose (ex: 1000mg)"
                    className="p-2.5 rounded-lg border border-slate-200 text-xs focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <select
                    value={newMedType}
                    onChange={(e) => setNewMedType(e.target.value as any)}
                    className="p-2.5 rounded-lg border border-slate-200 text-xs bg-white focus:ring-2 focus:ring-emerald-500 outline-none"
                  >
                    <option value="continuous">Contínuo</option>
                    <option value="temporary">Temporário</option>
                  </select>

                  <input
                    type="number"
                    value={newMedStock}
                    onChange={(e) => setNewMedStock(Number(e.target.value))}
                    placeholder="Estoque"
                    className="p-2.5 rounded-lg border border-slate-200 text-xs font-mono focus:ring-2 focus:ring-emerald-500 outline-none"
                  />

                  <input
                    type="text"
                    value={newMedTimes}
                    onChange={(e) => setNewMedTimes(e.target.value)}
                    placeholder="Horário (ex: 08:00)"
                    className="p-2.5 rounded-lg border border-slate-200 text-xs focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>

                <div className="flex gap-2 pt-1">
                  <button
                    type="submit"
                    className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-semibold text-xs active:scale-95 transition-all cursor-pointer"
                  >
                    Salvar Medicamento
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAddMedModal(false)}
                    className="px-3 py-2 border border-slate-200 rounded-xl text-xs text-slate-600 hover:bg-slate-50 cursor-pointer"
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            )}

            {/* Medications Full List */}
            <div className="space-y-3">
              {medications.map((med) => {
                const stockData = calculateMedicationStock(med);
                const isTaken = (med.takenTodayCount || 0) > 0;

                return (
                  <div key={med.id} className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3 text-xs">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900 text-sm">{med.name}</span>
                          <span className="font-mono text-[10px] bg-slate-200 text-slate-700 px-1.5 py-0.5 rounded font-medium">
                            {med.dosage}
                          </span>
                        </div>
                        <span className="text-[10px] text-slate-500 block mt-0.5">
                          {med.type === 'continuous' ? 'Uso Contínuo' : `Uso Temporário até ${med.endDate}`} · {med.times.join(', ')}
                        </span>
                      </div>

                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        med.type === 'continuous' ? 'bg-slate-100 text-slate-700' : 'bg-indigo-100 text-indigo-800'
                      }`}>
                        {med.type === 'continuous' ? 'Contínuo' : 'Temporário'}
                      </span>
                    </div>

                    {/* Stock Meter */}
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
                      <div className="flex justify-between text-[11px]">
                        <span>Estoque em Mãos: <strong className="font-mono text-slate-900">{med.currentStock} {med.unit}</strong></span>
                        <span className={`font-mono font-bold ${stockData.isLowStock ? 'text-rose-600' : 'text-emerald-700'}`}>
                          {stockData.isLowStock ? `⚠️ Acaba em ${stockData.daysRemaining} dias` : `~${stockData.daysRemaining} dias restantes`}
                        </span>
                      </div>
                      <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-300 ${stockData.isLowStock ? 'bg-rose-500' : 'bg-emerald-500'}`}
                          style={{ width: `${Math.min(100, (med.currentStock / 60) * 100)}%` }}
                        />
                      </div>
                    </div>

                    {/* Actions: Já Tomei vs Reabastecer */}
                    <div className="flex items-center justify-between pt-1">
                      <button
                        type="button"
                        onClick={() => handleRestock(med.id, 30)}
                        className="min-h-[40px] px-2 text-[11px] font-semibold text-indigo-700 hover:text-indigo-900 flex items-center gap-1 cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Comprei +30 un</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleTakeDose(med.id)}
                        className={`min-h-[44px] px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer active:scale-95 ${
                          isTaken
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                            : 'bg-slate-900 text-white hover:bg-slate-800 shadow-xs'
                        }`}
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>{isTaken ? `Dose tomada (${med.lastTakenAt})` : 'Já tomei agora'}</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 3: FARMÁCIA (SMART PHARMACY SHOPPING LIST) */}
        {/* ========================================================= */}
        {activeTab === 'shopping' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold text-slate-900">
                  Lista de Compras de Farmácia
                </h2>
                <p className="text-[10px] text-slate-500">
                  Disparada automaticamente quando o estoque está ≤ 5 dias
                </p>
              </div>
              <span className="text-xs font-mono font-bold bg-amber-100 text-amber-800 px-2.5 py-1 rounded-full">
                {autoShoppingList.length + extraShoppingItems.length} itens
              </span>
            </div>

            {/* Auto Stock Replenishment Items */}
            {autoShoppingList.length > 0 ? (
              <div className="space-y-2.5">
                <span className="text-[11px] font-bold text-amber-900 block uppercase tracking-wide">
                  Medicamentos em Alerta de Estoque:
                </span>
                {autoShoppingList.map((item) => (
                  <div key={item.id} className="p-3.5 rounded-2xl bg-white border border-amber-300 text-xs flex items-center justify-between gap-3 shadow-xs">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-slate-900 text-sm">{item.name}</span>
                        <span className="font-mono text-[10px] bg-slate-200 text-slate-700 px-1.5 py-0.5 rounded font-medium">
                          {item.dosage}
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-600 block mt-0.5">
                        Estoque atual: <strong>{item.currentStock} un</strong> · Restam apenas <strong className="text-rose-600 font-mono">{item.daysRemaining} dias</strong>
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleRestock(item.medicationId, item.suggestedQuantity)}
                      className="min-h-[44px] px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer shrink-0 active:scale-95 transition-all"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Comprei (+{item.suggestedQuantity})</span>
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-6 rounded-2xl bg-emerald-50 border border-emerald-200 text-center space-y-1">
                <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
                <span className="font-bold text-emerald-950 text-xs block">Todos os estoques estão seguros!</span>
                <span className="text-[11px] text-emerald-800">Nenhum medicamento com autonomia abaixo de 5 dias.</span>
              </div>
            )}

            {/* Custom Shopping Items */}
            <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs space-y-3">
              <span className="font-bold text-slate-900 block text-xs">Adicionar Outros Itens de Farmácia:</span>
              <form onSubmit={handleAddCustomShopItem} className="flex gap-2">
                <input
                  type="text"
                  value={customShopItem}
                  onChange={(e) => setCustomShopItem(e.target.value)}
                  placeholder="Ex: Protetor solar, colírio, gaze..."
                  className="flex-1 text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
                <button
                  type="submit"
                  className="min-h-[44px] px-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold cursor-pointer active:scale-95"
                >
                  Adicionar
                </button>
              </form>

              {extraShoppingItems.length > 0 && (
                <div className="space-y-1.5 pt-2 border-t border-slate-100">
                  {extraShoppingItems.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => toggleCustomShopItem(item.id)}
                      className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs cursor-pointer hover:bg-slate-100 transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <div className={`w-4 h-4 rounded border flex items-center justify-center ${
                          item.checked ? 'bg-emerald-600 border-emerald-600 text-white' : 'border-slate-300'
                        }`}>
                          {item.checked && <Check className="w-3 h-3" />}
                        </div>
                        <span className={item.checked ? 'line-through text-slate-400' : 'text-slate-800'}>
                          {item.name}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 4: GALAXY FIT 3 (REAL-TIME BIOMETRICS & SYNC HUB) */}
        {/* ========================================================= */}
        {activeTab === 'wearable' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold text-slate-900">
                  Samsung Galaxy Fit 3 · Telemetria
                </h2>
                <p className="text-[10px] text-slate-500">
                  Sincronização contínua via Samsung Health Connect SDK
                </p>
              </div>
              <span className="flex items-center gap-1.5 text-[11px] font-mono text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full font-medium">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                Conectado
              </span>
            </div>

            {/* Quick Interactive Simulation Toggles */}
            <div className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-2">
              <span className="text-xs font-bold text-slate-900 block">
                Simulador de Estado Biométrico do Smartwatch:
              </span>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setWearablePreset('poor')}
                  className={`min-h-[44px] p-2.5 rounded-xl border text-left text-xs transition-all cursor-pointer active:scale-95 ${
                    simulatedSleepScore < 60
                      ? 'bg-rose-50 border-rose-300 text-rose-950 font-semibold ring-2 ring-rose-400'
                      : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <span className="block font-bold">⚠️ Noite Ruim (54 pts)</span>
                  <span className="text-[10px] text-slate-500">FC 74 bpm · Estresse Alto</span>
                </button>

                <button
                  type="button"
                  onClick={() => setWearablePreset('great')}
                  className={`min-h-[44px] p-2.5 rounded-xl border text-left text-xs transition-all cursor-pointer active:scale-95 ${
                    simulatedSleepScore >= 80
                      ? 'bg-emerald-50 border-emerald-300 text-emerald-950 font-semibold ring-2 ring-emerald-400'
                      : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <span className="block font-bold">✨ Sono Reparador (88 pts)</span>
                  <span className="text-[10px] text-slate-500">FC 62 bpm · Recuperação Alta</span>
                </button>
              </div>
            </div>

            {/* Biometric Metric Cards */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
                <div className="flex items-center gap-1.5 text-slate-500 text-[11px]">
                  <Moon className="w-3.5 h-3.5 text-indigo-500" />
                  <span>Estágio N3 Profundo</span>
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-lg font-bold font-mono text-slate-900">{wearableData.deepSleepMinutes}</span>
                  <span className="text-xs text-slate-500">min</span>
                </div>
                <span className="text-[10px] text-slate-400 block">Meta diária: &gt; 60 min</span>
              </div>

              <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
                <div className="flex items-center gap-1.5 text-slate-500 text-[11px]">
                  <HeartPulse className="w-3.5 h-3.5 text-rose-500" />
                  <span>VFC (HRV RMSSD)</span>
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-lg font-bold font-mono text-slate-900">{wearableData.hrvRmssdMs}</span>
                  <span className="text-xs text-slate-500">ms</span>
                </div>
                <span className="text-[10px] text-slate-400 block">Tônus vagal parassimpático</span>
              </div>
            </div>

            {/* Physiological Feedback */}
            <div className="p-4 rounded-2xl bg-slate-900 text-white space-y-2 shadow-sm">
              <div className="flex items-center justify-between text-xs font-semibold">
                <span>Diagnóstico do Eixo HPA:</span>
                <span className={wearableData.recoveryStatus === 'optimal' ? 'text-emerald-400' : 'text-rose-400'}>
                  {wearableData.recoveryStatus === 'optimal' ? 'Recuperação Ótima' : 'Depleção Autonômica'}
                </span>
              </div>
              <p className="text-[11px] text-slate-300 leading-relaxed">
                {recommendation.dailyWorkoutPrescription.wearableTriggerRationale}
              </p>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 5: PERFIL & SAÚDE (PROFILE, PROTOCOLS & DEV HUB) */}
        {/* ========================================================= */}
        {activeTab === 'profile' && (
          <div className="space-y-4">
            
            {/* User Profile Card */}
            <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-slate-900 text-white flex items-center justify-center font-bold text-base shadow-sm">
                  {onboardingData.personal.name.substring(0, 2).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className="text-sm font-bold text-slate-900 truncate">
                    {onboardingData.personal.name}
                  </h2>
                  <span className="text-[11px] text-slate-500 block">
                    {onboardingData.personal.gender === 'male' ? 'Masculino' : 'Feminino'} · 38 anos
                  </span>
                </div>
              </div>

              {/* Physical Biometrics */}
              <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-100 text-[11px] text-center">
                <div className="p-2 bg-slate-50 rounded-xl">
                  <span className="text-[10px] text-slate-400 block">Altura</span>
                  <strong className="font-mono text-slate-900">{onboardingData.personal.heightCm} cm</strong>
                </div>
                <div className="p-2 bg-slate-50 rounded-xl">
                  <span className="text-[10px] text-slate-400 block">Peso</span>
                  <strong className="font-mono text-slate-900">{onboardingData.personal.weightKg} kg</strong>
                </div>
                <div className="p-2 bg-slate-50 rounded-xl">
                  <span className="text-[10px] text-slate-400 block">IMC</span>
                  <strong className="font-mono text-slate-900">{bmi}</strong>
                </div>
              </div>
            </div>

            {/* Mapped Health Conditions */}
            <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs space-y-3 text-xs">
              <span className="font-bold text-slate-900 block text-xs">
                Condições & Patologias Mapeadas:
              </span>

              <div className="space-y-2">
                <div>
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                    Saúde Intestinal & Digestiva:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {onboardingData.gutHealth.map((g) => (
                      <span key={g} className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 text-[11px] font-medium">
                        {g}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                    Saúde Mental & Eixo HPA:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {onboardingData.mentalHealth.map((m) => (
                      <span key={m} className="px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-800 border border-indigo-200 text-[11px] font-medium">
                        {m}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                    Doenças Crônicas de Controle:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {onboardingData.chronicConditions.map((c) => (
                      <span key={c} className="px-2.5 py-1 rounded-lg bg-rose-50 text-rose-800 border border-rose-200 text-[11px] font-medium">
                        {c}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Natural Functional Protocols */}
            <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs space-y-3 text-xs">
              <span className="font-bold text-slate-900 block text-xs">
                Protocolos Naturais Ativos:
              </span>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                <div className="flex items-center justify-between font-semibold text-slate-900">
                  <span>Intolerância à Lactose:</span>
                  <span className="text-emerald-700 font-mono text-[10px]">Suplementação Enzimática</span>
                </div>
                <p className="text-[11px] text-slate-600">
                  Lactose não banida: ingestão permitida associando 1 cápsula de Lactase 10.000 FCC antes da refeição láctea.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                <div className="flex items-center justify-between font-semibold text-slate-900">
                  <span>Colesterol Severo (400 mg/dL):</span>
                  <span className="text-emerald-700 font-mono text-[10px]">Protocolo Natural</span>
                </div>
                <p className="text-[11px] text-slate-600">
                  Fitoesteróis (2g/dia) bloqueando absorção de micelas + Berberina Fitossomada (1g/dia) ativando AMPK + Beta-glucana (3g/dia).
                </p>
              </div>
            </div>

            {/* Uploaded Lab Exams */}
            <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs space-y-3 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900 block text-xs">
                  Exames Laboratoriais ({onboardingData.labFiles.length}):
                </span>
                <span className="text-[10px] text-emerald-700 font-semibold">Analisados</span>
              </div>

              <div className="space-y-1.5">
                {onboardingData.labFiles.map((file) => (
                  <div key={file.id} className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-slate-500" />
                      <div>
                        <span className="font-medium text-slate-900 block text-[11px]">{file.name}</span>
                        <span className="text-[10px] text-slate-400">{file.size} · {file.date}</span>
                      </div>
                    </div>
                    <span className="text-[10px] bg-slate-200 text-slate-700 px-2 py-0.5 rounded font-mono">OK</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Actions: Install, Redo Onboarding & Dev Hub */}
            <div className="space-y-2 pt-2">
              {onOpenInstallModal && isInstallable && (
                <button
                  type="button"
                  onClick={onOpenInstallModal}
                  className="w-full min-h-[46px] p-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-700 text-white font-semibold text-xs flex items-center justify-between shadow-md transition-all cursor-pointer active:scale-98"
                >
                  <div className="flex items-center gap-2">
                    <Download className="w-4 h-4 text-emerald-200" />
                    <span>Instalar o BioRytmo no Celular (App Nativo)</span>
                  </div>
                  <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded font-bold uppercase">Instalar</span>
                </button>
              )}

              <button
                type="button"
                onClick={onOpenOnboarding}
                className="w-full min-h-[46px] p-3 rounded-2xl bg-white border border-slate-200 hover:border-slate-300 text-slate-900 font-semibold text-xs flex items-center justify-between shadow-xs transition-all cursor-pointer active:scale-98"
              >
                <div className="flex items-center gap-2">
                  <SlidersHorizontal className="w-4 h-4 text-slate-600" />
                  <span>Refazer Questionário de Onboarding (8 Passos)</span>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </button>

              {onOpenDevSheet && (
                <button
                  type="button"
                  onClick={onOpenDevSheet}
                  className="w-full min-h-[46px] p-3 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs flex items-center justify-between shadow-sm transition-all cursor-pointer active:scale-98"
                >
                  <div className="flex items-center gap-2">
                    <Settings className="w-4 h-4 text-emerald-400" />
                    <span>Painel Técnico & Supabase SQL (DDL, Kotlin, IA)</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </button>
              )}

              {onLogout && (
                <button
                  type="button"
                  onClick={onLogout}
                  className="w-full min-h-[44px] p-2.5 rounded-2xl text-rose-600 hover:bg-rose-50 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Trocar de Conta / Sair</span>
                </button>
              )}
            </div>

          </div>
        )}

      </main>

      {/* Sticky Mobile Bottom Navigation Bar (5 Tabs) */}
      <nav 
        className="fixed bottom-0 left-0 right-0 max-w-md mx-auto z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 px-2 py-2 flex items-center justify-around shadow-lg"
        aria-label="Navegação Principal"
      >
        <button
          type="button"
          onClick={() => setActiveTab('home')}
          className={`min-h-[44px] min-w-[56px] flex flex-col items-center justify-center gap-0.5 cursor-pointer rounded-xl transition-all ${
            activeTab === 'home' ? 'text-emerald-600 font-bold' : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <HeartPulse className="w-5 h-5" />
          <span className="text-[10px]">Hoje</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('meds')}
          className={`min-h-[44px] min-w-[56px] flex flex-col items-center justify-center gap-0.5 cursor-pointer rounded-xl transition-all ${
            activeTab === 'meds' ? 'text-emerald-600 font-bold' : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <Pill className="w-5 h-5" />
          <span className="text-[10px]">Remédios</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('shopping')}
          className={`min-h-[44px] min-w-[56px] flex flex-col items-center justify-center gap-0.5 cursor-pointer rounded-xl relative transition-all ${
            activeTab === 'shopping' ? 'text-emerald-600 font-bold' : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <ShoppingCart className="w-5 h-5" />
          <span className="text-[10px]">Farmácia</span>
          {autoShoppingList.length > 0 && (
            <span className="w-2 h-2 rounded-full bg-rose-500 absolute top-1 right-3" />
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('wearable')}
          className={`min-h-[44px] min-w-[56px] flex flex-col items-center justify-center gap-0.5 cursor-pointer rounded-xl transition-all ${
            activeTab === 'wearable' ? 'text-emerald-600 font-bold' : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <Watch className="w-5 h-5" />
          <span className="text-[10px]">Galaxy Fit</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('profile')}
          className={`min-h-[44px] min-w-[56px] flex flex-col items-center justify-center gap-0.5 cursor-pointer rounded-xl transition-all ${
            activeTab === 'profile' ? 'text-emerald-600 font-bold' : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <User className="w-5 h-5" />
          <span className="text-[10px]">Perfil</span>
        </button>
      </nav>

    </div>
  );
};
