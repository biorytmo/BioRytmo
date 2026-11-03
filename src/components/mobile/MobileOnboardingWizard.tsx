import React, { useState, useMemo } from 'react';
import {
  OnboardingState,
  UserMedication,
  MedicationType,
  ContinuousFrequency,
  Gender
} from '../../types/health';
import {
  calculateMedicationStock
} from '../../services/medicationStockService';
import {
  ChevronRight,
  ChevronLeft,
  Check,
  Search,
  Plus,
  Trash2,
  Watch,
  FileUp,
  FileText,
  Pill,
  Sparkles,
  AlertTriangle,
  Heart,
  Smile,
  ShieldCheck,
  Calendar,
  Clock,
  Target
} from 'lucide-react';

const INITIAL_GUT_TAGS = [
  'Gastrite', 'Esofagite', 'Refluxo / DRGE', 'Rinite Alérgica',
  'Síndrome do Intestino Irritável (SII)', 'Intolerância à Lactose',
  'Sensibilidade ao Glúten Não-Celíaca', 'Doença Celíaca',
  'Supercrescimento Bacteriano (SIBO)', 'Disbiose Intestinal',
  'Constipação Crônica', 'Distensão Abdominal Frequente'
];

const INITIAL_MENTAL_TAGS = [
  'Ansiedade', 'Depressão', 'TDAH (Déficit de Atenção)',
  'Insônia Crônica', 'Estresse Crônico', 'Síndrome de Burnout',
  'Fadiga Mental / Brain Fog', 'Bruxismo Noturno'
];

const INITIAL_CHRONIC_TAGS = [
  'Hipercolesterolemia (Colesterol Alto)', 'Hipertensão Arterial',
  'Diabetes Tipo 1', 'Diabetes Tipo 2', 'Resistência à Insulina',
  'Hipotireoidismo (Hashimoto)', 'Esteatose Hepática (Gordura no Fígado)',
  'Hiperuricemia / Gota', 'Artrite / Inflamação Articular'
];

const INITIAL_GOALS = [
  { id: 'cholesterol', title: 'Reduzir Colesterol & Risco Cardíaco', desc: 'Depuração de LDL e ApoB de forma natural e sem estatinas' },
  { id: 'gut', title: 'Cicatrização Gástrica & Saúde Intestinal', desc: 'Reparação de mucosa, alívio de refluxo e eubiose da microbiota' },
  { id: 'sleep', title: 'Otimizar Sono & Recuperação (Galaxy Fit 3)', desc: 'Mais sono profundo N3, tônus vagal e energia ao despertar' },
  { id: 'weight', title: 'Emagrecimento & Sensibilidade Insulínica', desc: 'Composição corporal saudável através de crononutrição' },
  { id: 'mental', title: 'Controle de Ansiedade & Cortisol', desc: 'Modulação do eixo HPA com rotina adaptada e fitoquímicos' }
];

interface MobileOnboardingWizardProps {
  onComplete: (data: OnboardingState) => void;
  initialData?: Partial<OnboardingState>;
}

export const MobileOnboardingWizard: React.FC<MobileOnboardingWizardProps> = ({
  onComplete,
  initialData
}) => {
  const [currentStep, setCurrentStep] = useState<number>(1);

  // Step 1: Personal
  const [name, setName] = useState<string>(initialData?.personal?.name || 'Carlos Mendes');
  const [birthDate, setBirthDate] = useState<string>(initialData?.personal?.birthDate || '1988-06-14');
  const [gender, setGender] = useState<Gender>(initialData?.personal?.gender || 'male');
  const [heightCm, setHeightCm] = useState<number>(initialData?.personal?.heightCm || 177);
  const [weightKg, setWeightKg] = useState<number>(initialData?.personal?.weightKg || 78.5);

  // Step 2, 3, 4: Conditions & Tags
  const [gutSearch, setGutSearch] = useState<string>('');
  const [customGutTag, setCustomGutTag] = useState<string>('');
  const [selectedGut, setSelectedGut] = useState<string[]>(initialData?.gutHealth || ['Gastrite', 'Refluxo / DRGE', 'Intolerância à Lactose']);

  const [selectedMental, setSelectedMental] = useState<string[]>(initialData?.mentalHealth || ['Ansiedade', 'Insônia Crônica']);
  const [selectedChronic, setSelectedChronic] = useState<string[]>(initialData?.chronicConditions || ['Hipercolesterolemia (Colesterol Alto)']);

  // Step 5: Medications
  const [medications, setMedications] = useState<UserMedication[]>(initialData?.medications || [
    {
      id: 'med_1',
      name: 'Fitoesteróis Livres Padronizados',
      dosage: '1.000 mg',
      type: 'continuous',
      continuousFrequency: 'daily',
      startDate: '2026-11-01',
      times: ['12:30', '19:30'],
      currentStock: 50,
      minStockAlertDays: 5,
      unit: 'cápsulas',
      instructions: '15 min antes das refeições principais'
    },
    {
      id: 'med_2',
      name: 'Amoxicilina + Clavulanato (Tratamento)',
      dosage: '875mg',
      type: 'temporary',
      intervalHours: 12,
      startDate: '2026-11-01',
      endDate: '2026-11-08',
      times: ['08:00', '20:00'],
      currentStock: 14,
      unit: 'comprimidos',
      instructions: 'Tomar no início das refeições para evitar enjoo'
    }
  ]);

  // Medication form state for new item
  const [newMedName, setNewMedName] = useState<string>('');
  const [newMedDosage, setNewMedDosage] = useState<string>('');
  const [newMedType, setNewMedType] = useState<MedicationType>('continuous');
  const [newMedFrequency, setNewMedFrequency] = useState<ContinuousFrequency>('daily');
  const [newMedIntervalHours, setNewMedIntervalHours] = useState<number>(8);
  const [newMedStock, setNewMedStock] = useState<number>(30);
  const [newMedUnit, setNewMedUnit] = useState<string>('comprimidos');
  const [newMedStartDate, setNewMedStartDate] = useState<string>('2026-11-03');
  const [newMedEndDate, setNewMedEndDate] = useState<string>('2026-11-10');
  const [newMedTimes, setNewMedTimes] = useState<string>('08:00, 20:00');
  const [newMedInstructions, setNewMedInstructions] = useState<string>('Com alimentos');
  const [showMedForm, setShowMedForm] = useState<boolean>(false);

  // Step 6: Wearables
  const [deviceModel, setDeviceModel] = useState<string>(initialData?.wearables?.deviceModel || 'Samsung Galaxy Fit 3');
  const [trackedMetrics, setTrackedMetrics] = useState<string[]>(initialData?.wearables?.trackedMetrics || ['sono', 'frequencia_cardiaca', 'estresse']);
  const [manualOverride, setManualOverride] = useState<boolean>(initialData?.wearables?.manualOverride ?? true);

  // Step 7: Lab Files
  const [labFiles, setLabFiles] = useState<{ id: string; name: string; size: string; date: string; type: string }[]>(
    initialData?.labFiles || [
      { id: 'f1', name: 'Perfil_Lipidico_ApoB_Outubro2026.pdf', size: '1.4 MB', date: '2026-10-24', type: 'application/pdf' },
      { id: 'f2', name: 'Laudo_Endoscopia_Digestiva_Alta.jpg', size: '2.8 MB', date: '2026-08-15', type: 'image/jpeg' }
    ]
  );

  // Step 8: Goals
  const [selectedGoals, setSelectedGoals] = useState<string[]>(initialData?.goals || ['cholesterol', 'gut', 'sleep']);

  // Calculated BMI
  const imc = useMemo(() => {
    if (!heightCm || !weightKg) return 0;
    const heightM = heightCm / 100;
    return Number((weightKg / (heightM * heightM)).toFixed(1));
  }, [heightCm, weightKg]);

  // Handlers for tag selection
  const toggleTag = (list: string[], setList: React.Dispatch<React.SetStateAction<string[]>>, item: string) => {
    if (list.includes(item)) {
      setList(list.filter(x => x !== item));
    } else {
      setList([...list, item]);
    }
  };

  const handleAddCustomGut = () => {
    if (customGutTag.trim() && !selectedGut.includes(customGutTag.trim())) {
      setSelectedGut([...selectedGut, customGutTag.trim()]);
      setCustomGutTag('');
    }
  };

  // Add Medication
  const handleAddMedication = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMedName.trim() || !newMedDosage.trim()) return;

    const timesArray = newMedTimes.split(',').map(t => t.trim()).filter(Boolean);

    const newMed: UserMedication = {
      id: `med_${Date.now()}`,
      name: newMedName.trim(),
      dosage: newMedDosage.trim(),
      type: newMedType,
      continuousFrequency: newMedType === 'continuous' ? newMedFrequency : undefined,
      intervalHours: newMedType === 'temporary' ? Number(newMedIntervalHours) : undefined,
      startDate: newMedStartDate,
      endDate: newMedType === 'temporary' ? newMedEndDate : undefined,
      times: timesArray.length > 0 ? timesArray : ['08:00'],
      currentStock: Number(newMedStock),
      unit: newMedUnit,
      instructions: newMedInstructions.trim(),
      minStockAlertDays: 5
    };

    setMedications([...medications, newMed]);
    setNewMedName('');
    setNewMedDosage('');
    setShowMedForm(false);
  };

  const removeMedication = (id: string) => {
    setMedications(medications.filter(m => m.id !== id));
  };

  // Lab file upload mock
  const handleMockUpload = () => {
    const newFile = {
      id: `file_${Date.now()}`,
      name: `Exame_Sangue_Recente_${new Date().toISOString().substring(0, 10)}.pdf`,
      size: '1.2 MB',
      date: new Date().toISOString().substring(0, 10),
      type: 'application/pdf'
    };
    setLabFiles([...labFiles, newFile]);
  };

  const handleFinish = () => {
    const finalData: OnboardingState = {
      currentStep: 8,
      personal: { name, birthDate, gender, heightCm, weightKg },
      gutHealth: selectedGut,
      mentalHealth: selectedMental,
      chronicConditions: selectedChronic,
      medications,
      wearables: { deviceModel, trackedMetrics, manualOverride },
      labFiles,
      goals: selectedGoals
    };
    onComplete(finalData);
  };

  return (
    <div className="w-full max-w-md mx-auto min-h-screen bg-slate-50 flex flex-col text-slate-900 pb-6">
      
      {/* Top Header & Progress */}
      <div className="bg-slate-900 text-white p-5 space-y-3">
        <div className="flex items-center justify-between text-xs">
          <span className="font-semibold text-emerald-400 uppercase tracking-wider text-[10px]">
            BioRytmo Onboarding Wizard
          </span>
          <span className="font-mono text-slate-300 font-bold">
            Passo {currentStep} de 8
          </span>
        </div>

        {/* 8-segment Progress Bar */}
        <div className="grid grid-cols-8 gap-1">
          {Array.from({ length: 8 }).map((_, idx) => (
            <div
              key={idx}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                idx + 1 <= currentStep ? 'bg-emerald-500' : 'bg-slate-800'
              }`}
            />
          ))}
        </div>

        <div className="pt-1">
          <h2 className="text-base font-bold text-white">
            {currentStep === 1 && 'Passo 1: Seus Dados Pessoais'}
            {currentStep === 2 && 'Passo 2: Saúde Física & Intestinal'}
            {currentStep === 3 && 'Passo 3: Saúde Mental & Sono'}
            {currentStep === 4 && 'Passo 4: Doenças de Controle & Crônicas'}
            {currentStep === 5 && 'Passo 5: Gestão de Remédios & Suplementos'}
            {currentStep === 6 && 'Passo 6: Wearables (Galaxy Fit 3)'}
            {currentStep === 7 && 'Passo 7: Histórico & Upload de Exames'}
            {currentStep === 8 && 'Passo 8: Seus Objetivos Primários'}
          </h2>
          <p className="text-[11px] text-slate-300 line-clamp-1">
            {currentStep === 1 && 'Base antropométrica para cálculo de TMB e IMC'}
            {currentStep === 2 && 'Mapeamento de gatilhos inflamatórios e digestivos'}
            {currentStep === 3 && 'Avaliação de estresse e modulação do eixo HPA'}
            {currentStep === 4 && 'Parâmetros de lipídios, glicose e endotélio'}
            {currentStep === 5 && 'Controle rigoroso de dosagens, estoques e término'}
            {currentStep === 6 && 'Conexão via Health Connect / Samsung Health'}
            {currentStep === 7 && 'Armazenamento seguro de laudos laboratoriais'}
            {currentStep === 8 && 'Customização do seu Dashboard hiper-personalizado'}
          </p>
        </div>
      </div>

      {/* Dynamic Step Content */}
      <div className="p-5 flex-1 overflow-y-auto space-y-4">
        
        {/* PASSO 1: DADOS PESSOAIS */}
        {currentStep === 1 && (
          <div className="space-y-4 text-xs">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Nome ou Apelido</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full text-xs p-2.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                placeholder="Como prefere ser chamado?"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Data de Nascimento</label>
                <input
                  type="date"
                  value={birthDate}
                  onChange={(e) => setBirthDate(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Sexo Biológico</label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value as Gender)}
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-white"
                >
                  <option value="male">Masculino</option>
                  <option value="female">Feminino</option>
                  <option value="other">Outro</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Altura (cm)</label>
                <input
                  type="number"
                  value={heightCm}
                  onChange={(e) => setHeightCm(Number(e.target.value))}
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:outline-none font-mono"
                  placeholder="Ex: 177"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Peso Atual (kg)</label>
                <input
                  type="number"
                  step="0.1"
                  value={weightKg}
                  onChange={(e) => setWeightKg(Number(e.target.value))}
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:outline-none font-mono"
                  placeholder="Ex: 78.5"
                />
              </div>
            </div>

            {/* Live IMC Feedback */}
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
              <div>
                <span className="text-[11px] text-slate-500 block">Índice de Massa Corporal (IMC):</span>
                <span className="font-mono text-sm font-bold text-slate-900">{imc} kg/m²</span>
              </div>
              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                imc < 18.5 ? 'bg-amber-100 text-amber-800' : imc <= 24.9 ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
              }`}>
                {imc < 18.5 ? 'Abaixo do peso' : imc <= 24.9 ? 'Peso Eutrófico (Ideal)' : 'Sobrepeso Leve'}
              </span>
            </div>
          </div>
        )}

        {/* PASSO 2: SAÚDE FÍSICA E INTESTINAL */}
        {currentStep === 2 && (
          <div className="space-y-3 text-xs">
            {/* Search Input */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={gutSearch}
                onChange={(e) => setGutSearch(e.target.value)}
                placeholder="Buscar condição (ex: gastrite, lactose, refluxo)..."
                className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            {/* Tag Cloud */}
            <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
              <span className="text-[11px] font-semibold text-slate-500 block">Selecione todas que se aplicam:</span>
              <div className="flex flex-wrap gap-1.5">
                {INITIAL_GUT_TAGS
                  .filter(tag => tag.toLowerCase().includes(gutSearch.toLowerCase()))
                  .map((tag) => {
                    const isSelected = selectedGut.includes(tag);
                    return (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => toggleTag(selectedGut, setSelectedGut, tag)}
                        className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors cursor-pointer ${
                          isSelected
                            ? 'bg-slate-900 text-white shadow-xs'
                            : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                        }`}
                      >
                        {isSelected ? '✓ ' : ''}{tag}
                      </button>
                    );
                  })}
              </div>
            </div>

            {/* Add Custom Tag */}
            <div className="pt-2 border-t border-slate-100 flex gap-2">
              <input
                type="text"
                value={customGutTag}
                onChange={(e) => setCustomGutTag(e.target.value)}
                placeholder="Outra condição física/intestinal..."
                className="flex-1 text-xs px-3 py-1.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <button
                type="button"
                onClick={handleAddCustomGut}
                className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-500"
              >
                Adicionar
              </button>
            </div>
          </div>
        )}

        {/* PASSO 3: SAÚDE MENTAL */}
        {currentStep === 3 && (
          <div className="space-y-3 text-xs">
            <p className="text-slate-500 text-[11px]">
              O BioRytmo cruza esses dados com a frequência cardíaca do Galaxy Fit 3 para detectar sobrecarga de cortisol.
            </p>

            <div className="flex flex-wrap gap-2 pt-1">
              {INITIAL_MENTAL_TAGS.map((tag) => {
                const isSelected = selectedMental.includes(tag);
                return (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => toggleTag(selectedMental, setSelectedMental, tag)}
                    className={`px-3 py-2 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                      isSelected
                        ? 'bg-slate-900 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    {isSelected ? '✓ ' : ''}{tag}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* PASSO 4: DOENÇAS CRÔNICAS E DE CONTROLE */}
        {currentStep === 4 && (
          <div className="space-y-3 text-xs">
            <p className="text-slate-500 text-[11px]">
              Essas condições determinam os protocolos de fitoterápicos, exames obrigatórios e janelas de repetição:
            </p>

            <div className="flex flex-wrap gap-2 pt-1">
              {INITIAL_CHRONIC_TAGS.map((tag) => {
                const isSelected = selectedChronic.includes(tag);
                return (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => toggleTag(selectedChronic, setSelectedChronic, tag)}
                    className={`px-3 py-2 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                      isSelected
                        ? 'bg-slate-900 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    {isSelected ? '✓ ' : ''}{tag}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* PASSO 5: MEDICAMENTOS E SUPLEMENTOS */}
        {currentStep === 5 && (
          <div className="space-y-4 text-xs">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <span className="font-bold text-slate-900 text-xs">
                Seus Medicamentos & Suplementos ({medications.length})
              </span>
              <button
                type="button"
                onClick={() => setShowMedForm(!showMedForm)}
                className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded hover:bg-emerald-100 transition-colors flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{showMedForm ? 'Fechar Formulário' : 'Novo Remédio / Suplemento'}</span>
              </button>
            </div>

            {/* List of Registered Meds with Stock Calculation */}
            <div className="space-y-2">
              {medications.map((med) => {
                const stockData = calculateMedicationStock(med);
                return (
                  <div key={med.id} className="p-3 rounded-xl border border-slate-200 bg-slate-50/70 space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900">{med.name}</span>
                          <span className="font-mono text-[10px] bg-slate-200 text-slate-700 px-1.5 py-0.5 rounded">
                            {med.dosage}
                          </span>
                        </div>
                        <span className="text-[10px] text-slate-500 block mt-0.5">
                          {med.type === 'continuous' ? 'Uso Contínuo' : `Tratamento Temporário (até ${med.endDate})`} · {med.times.join(', ')}
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={() => removeMedication(med.id)}
                        className="text-slate-400 hover:text-rose-600 transition-colors p-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Stock Alert Badge */}
                    <div className="flex items-center justify-between text-[11px] pt-1.5 border-t border-slate-200/60">
                      <span className="text-slate-600">
                        Estoque: <strong className="font-mono text-slate-900">{med.currentStock} {med.unit}</strong>
                      </span>
                      <span className={`font-semibold px-2 py-0.5 rounded text-[10px] ${
                        stockData.isLowStock 
                          ? 'bg-rose-100 text-rose-800' 
                          : 'bg-emerald-100 text-emerald-800'
                      }`}>
                        {stockData.isLowStock 
                          ? `⚠️ Restam ${stockData.daysRemaining} dias!` 
                          : `✓ Suficiente (${stockData.daysRemaining} dias)`}
                      </span>
                    </div>

                    {med.type === 'temporary' && (
                      <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                        <div
                          className="bg-indigo-600 h-full rounded-full"
                          style={{ width: `${stockData.temporaryProgressPercentage}%` }}
                        />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Add Medication Form Modal / Accordion */}
            {showMedForm && (
              <form onSubmit={handleAddMedication} className="p-3.5 rounded-xl border border-emerald-300 bg-emerald-50/30 space-y-3">
                <span className="font-bold text-slate-900 block text-xs">
                  Cadastrar Medicamento / Suplemento
                </span>

                {/* Type Switcher: Continuous vs Temporary */}
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setNewMedType('continuous')}
                    className={`py-1.5 text-xs font-semibold rounded-lg border transition-colors ${
                      newMedType === 'continuous'
                        ? 'bg-slate-900 text-white border-slate-900'
                        : 'bg-white text-slate-700 border-slate-200'
                    }`}
                  >
                    Uso Contínuo
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewMedType('temporary')}
                    className={`py-1.5 text-xs font-semibold rounded-lg border transition-colors ${
                      newMedType === 'temporary'
                        ? 'bg-slate-900 text-white border-slate-900'
                        : 'bg-white text-slate-700 border-slate-200'
                    }`}
                  >
                    Uso Temporário
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] font-semibold text-slate-700 block mb-0.5">Nome do Remédio</label>
                    <input
                      type="text"
                      required
                      value={newMedName}
                      onChange={(e) => setNewMedName(e.target.value)}
                      placeholder="Ex: Berberina ou Amoxicilina"
                      className="w-full text-xs p-2 rounded border border-slate-200 bg-white"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-semibold text-slate-700 block mb-0.5">Dosagem / Qtd</label>
                    <input
                      type="text"
                      required
                      value={newMedDosage}
                      onChange={(e) => setNewMedDosage(e.target.value)}
                      placeholder="Ex: 500mg ou 1 comp"
                      className="w-full text-xs p-2 rounded border border-slate-200 bg-white"
                    />
                  </div>
                </div>

                {newMedType === 'temporary' ? (
                  <div className="space-y-2 p-2 rounded bg-white border border-slate-200">
                    <span className="text-[10px] font-bold text-indigo-900 block uppercase">
                      Parâmetros do Tratamento Agudo (Cálculo Automático)
                    </span>
                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <label className="text-[10px] text-slate-600 block">Intervalo (Horas)</label>
                        <select
                          value={newMedIntervalHours}
                          onChange={(e) => setNewMedIntervalHours(Number(e.target.value))}
                          className="w-full text-xs p-1.5 border rounded"
                        >
                          <option value={6}>De 6 em 6h (4x)</option>
                          <option value={8}>De 8 em 8h (3x)</option>
                          <option value={12}>De 12 em 12h (2x)</option>
                          <option value={24}>A cada 24h (1x)</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-[10px] text-slate-600 block">Data Inicial</label>
                        <input
                          type="date"
                          value={newMedStartDate}
                          onChange={(e) => setNewMedStartDate(e.target.value)}
                          className="w-full text-xs p-1 border rounded"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-slate-600 block">Data Término</label>
                        <input
                          type="date"
                          value={newMedEndDate}
                          onChange={(e) => setNewMedEndDate(e.target.value)}
                          className="w-full text-xs p-1 border rounded"
                        />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div>
                    <label className="text-[10px] font-semibold text-slate-700 block mb-0.5">Frequência</label>
                    <select
                      value={newMedFrequency}
                      onChange={(e) => setNewMedFrequency(e.target.value as ContinuousFrequency)}
                      className="w-full text-xs p-2 rounded border border-slate-200 bg-white"
                    >
                      <option value="daily">Todos os dias</option>
                      <option value="alternate_days">Dias intercalados (Dia sim, dia não)</option>
                    </select>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] font-semibold text-slate-700 block mb-0.5">Estoque Atual em Mãos</label>
                    <input
                      type="number"
                      value={newMedStock}
                      onChange={(e) => setNewMedStock(Number(e.target.value))}
                      className="w-full text-xs p-2 rounded border border-slate-200 bg-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-semibold text-slate-700 block mb-0.5">Unidade</label>
                    <select
                      value={newMedUnit}
                      onChange={(e) => setNewMedUnit(e.target.value)}
                      className="w-full text-xs p-2 rounded border border-slate-200 bg-white"
                    >
                      <option value="comprimidos">comprimidos</option>
                      <option value="cápsulas">cápsulas</option>
                      <option value="gotas">gotas</option>
                      <option value="sachês">sachês</option>
                    </select>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-semibold text-xs transition-colors cursor-pointer"
                >
                  Salvar Remédio & Calcular Estoque
                </button>
              </form>
            )}
          </div>
        )}

        {/* PASSO 6: WEARABLES E SENSORES */}
        {currentStep === 6 && (
          <div className="space-y-4 text-xs">
            <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Watch className="w-6 h-6 text-emerald-600" />
                <div>
                  <h4 className="font-bold text-slate-900">{deviceModel}</h4>
                  <span className="text-[10px] text-emerald-700 font-semibold">
                    Health Connect & Samsung Health Ativo
                  </span>
                </div>
              </div>
              <span className="text-[10px] font-mono text-slate-500 bg-slate-200 px-2 py-0.5 rounded">
                Bluetooth 5.3
              </span>
            </div>

            <div className="space-y-2">
              <span className="font-semibold text-slate-900 block">Métricas Selecionadas para Rastreio:</span>
              {[
                { id: 'sono', label: 'Monitoramento de Sono (Estágios REM e Profundo N3)' },
                { id: 'frequencia_cardiaca', label: 'Frequência Cardíaca de Repouso e Tônus Vagal' },
                { id: 'estresse', label: 'Nível de Estresse Contínuo (Variabilidade HRV)' },
                { id: 'pressao', label: 'Pressão Arterial Estimada' },
                { id: 'glicemia', label: 'Glicemia (Integração manual ou sensor contínuo)' }
              ].map((metric) => {
                const isChecked = trackedMetrics.includes(metric.id);
                return (
                  <label
                    key={metric.id}
                    className="flex items-center gap-2.5 p-2.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => toggleTag(trackedMetrics, setTrackedMetrics, metric.id)}
                      className="accent-emerald-600"
                    />
                    <span className="text-slate-800 text-xs font-medium">{metric.label}</span>
                  </label>
                );
              })}
            </div>

            <div className="p-3 rounded-lg bg-emerald-50/50 border border-emerald-200 flex items-center justify-between">
              <div>
                <span className="font-bold text-slate-900 block text-[11px]">Permitir Entrada Manual?</span>
                <span className="text-[10px] text-slate-600">Se você esquecer o relógio, pode inserir o sono manualmente.</span>
              </div>
              <input
                type="checkbox"
                checked={manualOverride}
                onChange={(e) => setManualOverride(e.target.checked)}
                className="accent-emerald-600 w-4 h-4 cursor-pointer"
              />
            </div>
          </div>
        )}

        {/* PASSO 7: UPLOAD DE EXAMES */}
        {currentStep === 7 && (
          <div className="space-y-4 text-xs">
            <p className="text-slate-500 text-[11px]">
              Anexe PDFs ou fotos dos seus exames de sangue recentes para alimentar o comparador de resultados e alertas de reteste.
            </p>

            {/* Dropzone mock */}
            <div
              onClick={handleMockUpload}
              className="border-2 border-dashed border-slate-300 hover:border-emerald-500 rounded-2xl p-6 text-center cursor-pointer transition-colors bg-slate-50/50"
            >
              <FileUp className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
              <span className="font-bold text-slate-900 block">Clique para Anexar Exames</span>
              <span className="text-[10px] text-slate-500">PDFs, Imagens JPG ou PNG de laudos laboratoriais</span>
            </div>

            {/* Attached Files List */}
            <div className="space-y-2">
              <span className="font-semibold text-slate-700 block text-[11px]">Arquivos Anexados ({labFiles.length}):</span>
              {labFiles.map((file) => (
                <div key={file.id} className="p-2.5 rounded-lg border border-slate-200 bg-white flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-indigo-600 shrink-0" />
                    <div>
                      <span className="font-medium text-slate-900 block line-clamp-1">{file.name}</span>
                      <span className="text-[10px] text-slate-400 font-mono">{file.size} · {file.date}</span>
                    </div>
                  </div>
                  <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-mono font-bold">
                    Pronto
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* PASSO 8: OBJETIVOS PRIMÁRIOS */}
        {currentStep === 8 && (
          <div className="space-y-3 text-xs">
            <p className="text-slate-500 text-[11px]">
              Selecione as prioridades que guiarão os algoritmos de crononutrição e treino do seu dashboard:
            </p>

            <div className="space-y-2">
              {INITIAL_GOALS.map((goal) => {
                const isSelected = selectedGoals.includes(goal.id);
                return (
                  <button
                    key={goal.id}
                    type="button"
                    onClick={() => toggleTag(selectedGoals, setSelectedGoals, goal.id)}
                    className={`w-full text-left p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                      isSelected
                        ? 'border-emerald-600 bg-emerald-50/40 text-slate-900 shadow-xs'
                        : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <div>
                      <span className="font-bold block text-xs">{goal.title}</span>
                      <span className="text-[10px] text-slate-500 block mt-0.5">{goal.desc}</span>
                    </div>
                    {isSelected && <Check className="w-4 h-4 text-emerald-600 shrink-0 ml-2" />}
                  </button>
                );
              })}
            </div>
          </div>
        )}

      </div>

      {/* Sticky Bottom Navigation Buttons */}
      <div className="sticky bottom-0 z-30 p-4 border-t border-slate-200 bg-white/95 backdrop-blur-md flex items-center justify-between gap-3 shadow-lg">
        {currentStep > 1 ? (
          <button
            type="button"
            onClick={() => setCurrentStep(currentStep - 1)}
            className="min-h-[44px] px-4 py-2.5 text-xs font-semibold text-slate-700 hover:text-slate-900 rounded-xl border border-slate-300 transition-colors flex items-center gap-1.5 cursor-pointer active:scale-95"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Voltar</span>
          </button>
        ) : (
          <span />
        )}

        {currentStep < 8 ? (
          <button
            type="button"
            onClick={() => setCurrentStep(currentStep + 1)}
            className="min-h-[44px] px-5 py-2.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-sm ml-auto active:scale-95"
          >
            <span>Avançar</span>
            <ChevronRight className="w-4 h-4 text-emerald-400" />
          </button>
        ) : (
          <button
            type="button"
            onClick={handleFinish}
            className="min-h-[44px] px-5 py-2.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl transition-all flex items-center gap-2 cursor-pointer shadow-sm ml-auto active:scale-95"
          >
            <Sparkles className="w-4 h-4 text-amber-200" />
            <span>Concluir & Gerar Dashboard</span>
          </button>
        )}
      </div>

    </div>
  );
};
