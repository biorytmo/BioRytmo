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
  Activity
} from 'lucide-react';

interface MobileDashboardProps {
  onboardingData: OnboardingState;
  onOpenOnboarding?: () => void;
}

export const MobileDashboard: React.FC<MobileDashboardProps> = ({
  onboardingData,
  onOpenOnboarding
}) => {
  const [medications, setMedications] = useState<UserMedication[]>(onboardingData.medications);
  const [simulatedSleepScore, setSimulatedSleepScore] = useState<number>(54);
  const [simulatedRestingHr, setSimulatedRestingHr] = useState<number>(74);
  const [simulatedDeepSleep, setSimulatedDeepSleep] = useState<number>(35);
  const [simulatedStress, setSimulatedStress] = useState<'low' | 'moderate' | 'high'>('high');
  const [activeTab, setActiveTab] = useState<'home' | 'meds' | 'shopping' | 'wearable'>('home');
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

  // Confirm dose taken handler with toast feedback
  const handleTakeDose = (medId: string) => {
    const { updatedMedications, updatedMed } = recordDoseTaken(medications, medId);
    setMedications(updatedMedications);
    setDoseToast(`Dose de ${updatedMed.name} confirmada! Estoque atualizado para ${updatedMed.currentStock} un.`);
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
    } else {
      setSimulatedSleepScore(88);
      setSimulatedRestingHr(62);
      setSimulatedDeepSleep(90);
      setSimulatedStress('low');
    }
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

  return (
    <div className="w-full max-w-md mx-auto bg-slate-100 rounded-3xl border border-slate-300/80 shadow-xl overflow-hidden flex flex-col min-h-[720px] text-slate-900 font-sans">
      
      {/* Mobile Top App Bar */}
      <div className="bg-slate-900 text-white px-5 pt-6 pb-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center font-bold text-emerald-400 text-xs">
              {onboardingData.personal.name.substring(0, 2).toUpperCase()}
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block uppercase tracking-wider font-semibold">
                BioRytmo Health OS
              </span>
              <h1 className="text-sm font-bold text-white">
                Olá, {onboardingData.personal.name.split(' ')[0]}!
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setWearablePreset(simulatedSleepScore < 60 ? 'great' : 'poor')}
              className="text-[10px] font-mono px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-emerald-400 border border-slate-700 transition-colors cursor-pointer"
              title="Clique para alternar simulação de sono bom/ruim do Galaxy Fit 3"
            >
              Fit 3: {wearableData.sleepScore} pts
            </button>
            <button
              onClick={onOpenOnboarding}
              className="text-[10px] text-slate-300 bg-slate-800 hover:bg-slate-700 px-2 py-1 rounded transition-colors"
            >
              Editar Perfil
            </button>
          </div>
        </div>

        {/* Biometric Bar Tracker */}
        <div className="grid grid-cols-3 gap-2 pt-1 text-[11px]">
          <div className="bg-slate-800/80 p-2 rounded-xl border border-slate-700/60">
            <span className="text-[10px] text-slate-400 block">Sono (Fit 3)</span>
            <span className="font-bold text-white font-mono">
              {Math.floor(wearableData.totalSleepMinutes / 60)}h {wearableData.totalSleepMinutes % 60}m
            </span>
          </div>

          <div className="bg-slate-800/80 p-2 rounded-xl border border-slate-700/60">
            <span className="text-[10px] text-slate-400 block">FC Repouso</span>
            <span className="font-bold text-white font-mono">
              {wearableData.restingHeartRateBpm} bpm
            </span>
          </div>

          <div className="bg-slate-800/80 p-2 rounded-xl border border-slate-700/60">
            <span className="text-[10px] text-slate-400 block">Recuperação</span>
            <span className={`font-bold font-mono text-[10px] ${
              wearableData.recoveryStatus === 'optimal' ? 'text-emerald-400' : 'text-rose-400'
            }`}>
              {wearableData.recoveryStatus === 'optimal' ? 'Alta (Ótima)' : 'Depleção (Baixa)'}
            </span>
          </div>
        </div>
      </div>

      {/* Real-time Dose Taken Toast */}
      {doseToast && (
        <div className="bg-emerald-600 text-white text-xs px-4 py-2 font-medium flex items-center justify-between shadow-md transition-all">
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-200" />
            <span>{doseToast}</span>
          </div>
        </div>
      )}

      {/* Main Scrollable Body - Conditional by activeTab */}
      <div className="p-4 flex-1 overflow-y-auto space-y-4">
        
        {/* ========================================================= */}
        {/* TAB 1: INÍCIO (DAILY SUMMARY, TODAY'S ADAPTATIONS) */}
        {/* ========================================================= */}
        {activeTab === 'home' && (
          <>
            {/* Wearable Autonomic Alert Card */}
            <div className={`p-3.5 rounded-2xl border text-xs space-y-1.5 ${
              wearableData.recoveryStatus === 'depleted'
                ? 'bg-rose-50 border-rose-200 text-rose-950'
                : 'bg-emerald-50 border-emerald-200 text-emerald-950'
            }`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 font-bold">
                  <Watch className="w-4 h-4 text-emerald-700" />
                  <span>Ajuste da Rotina Pelo Galaxy Fit 3</span>
                </div>
                <span className="font-mono text-[10px] font-semibold bg-white/80 px-2 py-0.5 rounded">
                  Score: {recommendation.autonomicReadinessScore}/100
                </span>
              </div>
              <p className="text-[11px] leading-relaxed opacity-90">
                {recommendation.dailyWorkoutPrescription.wearableTriggerRationale}
              </p>
              <div className="pt-1 flex items-center justify-between font-semibold text-[11px]">
                <span>Treino Hoje:</span>
                <span className="text-right">{recommendation.dailyWorkoutPrescription.adjustedType.split('[')[0]}</span>
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
                  onClick={() => setActiveTab('meds')}
                  className="text-[10px] text-emerald-700 font-semibold hover:underline"
                >
                  Ver todos ({medications.length})
                </button>
              </div>

              <div className="space-y-2">
                {medications.slice(0, 3).map((med) => {
                  const stockData = calculateMedicationStock(med);
                  const isTaken = (med.takenTodayCount || 0) > 0;

                  return (
                    <div
                      key={med.id}
                      className="p-3 rounded-xl border border-slate-200 bg-slate-50/70 text-xs flex items-center justify-between gap-3"
                    >
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-slate-900">{med.name}</span>
                          <span className="font-mono text-[10px] bg-slate-200 text-slate-700 px-1.5 py-0.5 rounded">
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
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shrink-0 ${
                          isTaken
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                            : 'bg-slate-900 text-white hover:bg-slate-800'
                        }`}
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>{isTaken ? `Tomado (${med.lastTakenAt})` : 'Já tomei'}</span>
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
                className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-300 flex items-center justify-between gap-3 cursor-pointer hover:bg-amber-500/15 transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <ShoppingCart className="w-5 h-5 text-amber-600 shrink-0" />
                  <div>
                    <span className="font-bold text-xs text-amber-950 block">
                      {autoShoppingList.length} medicamento(s) com estoque baixo!
                    </span>
                    <span className="text-[10px] text-amber-800">
                      Toque para abrir a Lista de Compras de Farmácia.
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
                  Colesterol 400 + Gastrite
                </span>
              </div>

              <div className="p-2.5 rounded-xl bg-indigo-50/60 border border-indigo-200 text-[11px] text-indigo-950">
                <strong className="block font-bold">Conduta de Lactose Ativa:</strong>
                Consumo permitido com <strong>1 cápsula de Lactase 10.000 FCC</strong> antes da refeição.
              </div>

              <div className="space-y-1.5">
                <div className="p-2 rounded-lg bg-slate-50 border border-slate-200 flex justify-between items-center text-[11px]">
                  <span>Café da Manhã: Mingau com <strong>3g de Beta-glucana</strong></span>
                  <span className="text-[10px] text-slate-400">07:30</span>
                </div>
                <div className="p-2 rounded-lg bg-slate-50 border border-slate-200 flex justify-between items-center text-[11px]">
                  <span>Almoço: <strong>Fitoesteróis (1g)</strong> + <strong>Berberina (500mg)</strong></span>
                  <span className="text-[10px] text-slate-400">12:30</span>
                </div>
                <div className="p-2 rounded-lg bg-slate-50 border border-slate-200 flex justify-between items-center text-[11px]">
                  <span>Jantar: <strong>Fitoesteróis (1g)</strong> + <strong>Red Yeast Rice c/ CoQ10</strong></span>
                  <span className="text-[10px] text-slate-400">19:30</span>
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
                  Gerenciador de Medicamentos & Suplementos
                </h2>
                <p className="text-[10px] text-slate-500">
                  Controle contínuo e tratamentos agudos com estoque
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowAddMedModal(!showAddMedModal)}
                className="px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
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
                    className="p-2 rounded border border-slate-200 text-xs"
                  />
                  <input
                    type="text"
                    required
                    value={newMedDosage}
                    onChange={(e) => setNewMedDosage(e.target.value)}
                    placeholder="Dose (ex: 1000mg)"
                    className="p-2 rounded border border-slate-200 text-xs"
                  />
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <select
                    value={newMedType}
                    onChange={(e) => setNewMedType(e.target.value as any)}
                    className="p-2 rounded border border-slate-200 text-xs bg-white"
                  >
                    <option value="continuous">Contínuo</option>
                    <option value="temporary">Temporário</option>
                  </select>

                  <input
                    type="number"
                    value={newMedStock}
                    onChange={(e) => setNewMedStock(Number(e.target.value))}
                    placeholder="Estoque"
                    className="p-2 rounded border border-slate-200 text-xs font-mono"
                  />

                  <input
                    type="text"
                    value={newMedTimes}
                    onChange={(e) => setNewMedTimes(e.target.value)}
                    placeholder="Horário (ex: 08:00)"
                    className="p-2 rounded border border-slate-200 text-xs"
                  />
                </div>

                <div className="flex gap-2">
                  <button
                    type="submit"
                    className="flex-1 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded font-semibold text-xs"
                  >
                    Salvar
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAddMedModal(false)}
                    className="px-3 py-1.5 border rounded text-xs text-slate-600"
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
                          <span className="font-mono text-[10px] bg-slate-200 text-slate-700 px-1.5 py-0.5 rounded">
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
                    <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
                      <div className="flex justify-between text-[11px]">
                        <span>Estoque em Mãos: <strong className="font-mono text-slate-900">{med.currentStock} {med.unit}</strong></span>
                        <span className={`font-mono font-bold ${stockData.isLowStock ? 'text-rose-600' : 'text-emerald-700'}`}>
                          {stockData.isLowStock ? `⚠️ Acaba em ${stockData.daysRemaining} dias` : `~${stockData.daysRemaining} dias`}
                        </span>
                      </div>
                      <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${stockData.isLowStock ? 'bg-rose-500' : 'bg-emerald-500'}`}
                          style={{ width: `${Math.min(100, (med.currentStock / 60) * 100)}%` }}
                        />
                      </div>
                    </div>

                    {/* Actions: Já Tomei vs Reabastecer */}
                    <div className="flex items-center justify-between pt-1">
                      <button
                        type="button"
                        onClick={() => handleRestock(med.id, 30)}
                        className="text-[11px] font-semibold text-indigo-700 hover:text-indigo-900 flex items-center gap-1 cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Comprei +30</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleTakeDose(med.id)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                          isTaken
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                            : 'bg-slate-900 text-white hover:bg-slate-800'
                        }`}
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
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
                  Lista de Compras Inteligente para Farmácia
                </h2>
                <p className="text-[10px] text-slate-500">
                  Disparada automaticamente pelo cálculo de dias de estoque
                </p>
              </div>
              <span className="text-xs font-mono font-bold bg-amber-100 text-amber-800 px-2 py-0.5 rounded">
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
                        <span className="font-mono text-[10px] bg-slate-200 text-slate-700 px-1.5 py-0.5 rounded">
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
                      className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-1 cursor-pointer shrink-0"
                    >
                      <Plus className="w-3.5 h-3.5" />
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
                  placeholder="Ex: Protetor solar, fita micropore, colírio..."
                  className="flex-1 text-xs p-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
                <button
                  type="submit"
                  className="px-3 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold cursor-pointer"
                >
                  Adicionar
                </button>
              </form>

              {extraShoppingItems.length > 0 && (
                <div className="space-y-1.5 pt-2 border-t border-slate-100">
                  {extraShoppingItems.map((item) => (
                    <div key={item.id} className="p-2 rounded-lg bg-slate-50 border border-slate-200 text-xs flex items-center justify-between">
                      <span className={item.checked ? 'line-through text-slate-400' : 'text-slate-800 font-medium'}>
                        {item.name}
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          setExtraShoppingItems(extraShoppingItems.filter(x => x.id !== item.id));
                        }}
                        className="text-slate-400 hover:text-rose-600 text-xs"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 4: GALAXY FIT 3 (DETAILED WEARABLE TELEMETRY & CONTROLS) */}
        {/* ========================================================= */}
        {activeTab === 'wearable' && (
          <div className="space-y-4 text-xs">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold text-slate-900">
                  Samsung Galaxy Fit 3
                </h2>
                <p className="text-[10px] text-slate-500">
                  Sincronizado via Health Connect & Samsung Health
                </p>
              </div>
              <span className="text-[10px] font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-bold">
                Conectado (BLE 5.3)
              </span>
            </div>

            {/* Live Controller Sliders */}
            <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs space-y-4">
              <span className="font-bold text-slate-900 block text-xs">
                Simulador de Biometria do Relógio:
              </span>

              {/* Slider 1: Sleep Score */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="font-medium text-slate-700">Galaxy Sleep Score:</span>
                  <span className="font-mono font-bold text-slate-900">{simulatedSleepScore} / 100</span>
                </div>
                <input
                  type="range"
                  min="30"
                  max="100"
                  value={simulatedSleepScore}
                  onChange={(e) => setSimulatedSleepScore(Number(e.target.value))}
                  className="w-full accent-emerald-600 cursor-pointer"
                />
              </div>

              {/* Slider 2: Deep Sleep */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="font-medium text-slate-700">Sono Profundo (Estágio N3):</span>
                  <span className="font-mono font-bold text-slate-900">{simulatedDeepSleep} min</span>
                </div>
                <input
                  type="range"
                  min="15"
                  max="120"
                  value={simulatedDeepSleep}
                  onChange={(e) => setSimulatedDeepSleep(Number(e.target.value))}
                  className="w-full accent-emerald-600 cursor-pointer"
                />
              </div>

              {/* Slider 3: Resting HR */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="font-medium text-slate-700">FC de Repouso ao Despertar:</span>
                  <span className="font-mono font-bold text-slate-900">{simulatedRestingHr} bpm</span>
                </div>
                <input
                  type="range"
                  min="55"
                  max="90"
                  value={simulatedRestingHr}
                  onChange={(e) => setSimulatedRestingHr(Number(e.target.value))}
                  className="w-full accent-emerald-600 cursor-pointer"
                />
                <span className="text-[10px] text-slate-500 block">Baseline calibrado: 65 bpm</span>
              </div>
            </div>

            {/* Physiological Feedback */}
            <div className="p-4 rounded-2xl bg-slate-900 text-white space-y-2">
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

      </div>

      {/* Bottom Navigation Bar */}
      <div className="bg-white border-t border-slate-200 px-6 py-2.5 flex items-center justify-between text-xs text-slate-500">
        <button
          onClick={() => setActiveTab('home')}
          className={`flex flex-col items-center gap-0.5 cursor-pointer ${
            activeTab === 'home' ? 'text-emerald-600 font-bold' : 'hover:text-slate-900'
          }`}
        >
          <HeartPulse className="w-4 h-4" />
          <span className="text-[10px]">Início</span>
        </button>

        <button
          onClick={() => setActiveTab('meds')}
          className={`flex flex-col items-center gap-0.5 cursor-pointer ${
            activeTab === 'meds' ? 'text-emerald-600 font-bold' : 'hover:text-slate-900'
          }`}
        >
          <Pill className="w-4 h-4" />
          <span className="text-[10px]">Remédios</span>
        </button>

        <button
          onClick={() => setActiveTab('shopping')}
          className={`flex flex-col items-center gap-0.5 cursor-pointer relative ${
            activeTab === 'shopping' ? 'text-emerald-600 font-bold' : 'hover:text-slate-900'
          }`}
        >
          <ShoppingCart className="w-4 h-4" />
          <span className="text-[10px]">Farmácia</span>
          {autoShoppingList.length > 0 && (
            <span className="w-2 h-2 rounded-full bg-rose-500 absolute -top-0.5 right-2" />
          )}
        </button>

        <button
          onClick={() => setActiveTab('wearable')}
          className={`flex flex-col items-center gap-0.5 cursor-pointer ${
            activeTab === 'wearable' ? 'text-emerald-600 font-bold' : 'hover:text-slate-900'
          }`}
        >
          <Watch className="w-4 h-4" />
          <span className="text-[10px]">Galaxy Fit</span>
        </button>
      </div>

    </div>
  );
};
