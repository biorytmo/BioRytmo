import {
  UserProfile,
  HealthCondition,
  WearableBiometrics,
  UserSubstitutionPreference,
  RecommendationEngineOutput
} from '../types/health';
import { PATHOLOGY_KNOWLEDGE_BASE } from '../data/knowledgeBaseData';

export function calculateAutonomicReadiness(
  wearable: WearableBiometrics,
  user: UserProfile
): { score: number; status: 'optimal' | 'moderate' | 'depleted'; rationale: string } {
  let score = 50; // base

  // Sleep Score Impact (Weight: 45%)
  const sleepContrib = (wearable.sleepScore / 100) * 45;
  score = sleepContrib;

  // Deep Sleep Ratio (target: at least 15-20% of total sleep)
  const deepSleepRatio = wearable.totalSleepMinutes > 0
    ? (wearable.deepSleepMinutes / wearable.totalSleepMinutes) * 100
    : 10;
  if (deepSleepRatio >= 18) score += 15;
  else if (deepSleepRatio >= 12) score += 10;
  else score += 4;

  // Resting Heart Rate vs Baseline (Weight: 25%)
  const hrDelta = wearable.restingHeartRateBpm - (user.baselineRestingHR || 65);
  if (hrDelta <= -2) {
    score += 25; // Excelente tônus parassimpático
  } else if (hrDelta <= 3) {
    score += 18; // Normal
  } else if (hrDelta <= 7) {
    score += 8; // Leve ativação simpática / fadiga
  } else {
    score += 2; // Estresse autonômico elevado ou má recuperação
  }

  // Stress Level (Weight: 15%)
  if (wearable.stressLevel === 'low') score += 15;
  else if (wearable.stressLevel === 'moderate') score += 8;
  else score += 2;

  // Final score clamping
  score = Math.min(100, Math.max(10, Math.round(score)));

  let status: 'optimal' | 'moderate' | 'depleted' = 'moderate';
  let rationale = '';

  if (score >= 78) {
    status = 'optimal';
    rationale = `Alta prontidão autonômica (Score ${score}/100). Sono profundo de ${wearable.deepSleepMinutes} min e FC de repouso alinhada ao baseline. Organismo receptivo a estímulos de sobrecarga adaptativa.`;
  } else if (score >= 60) {
    status = 'moderate';
    rationale = `Recuperação intermediária (Score ${score}/100). Fisiologia estável, recomendando-se manutenção do volume de treino programado sem exaustão do sistema nervoso central.`;
  } else {
    status = 'depleted';
    rationale = `Depleção de recuperação detectada pelo Galaxy Fit 3 (Score ${score}/100). FC de repouso elevada (+${hrDelta > 0 ? hrDelta : 0} bpm) ou déficit de sono profundo. O eixo HPA exige redução drástica de carga.`;
  }

  return { score, status, rationale };
}

export function generatePersonalizedRecommendation(
  user: UserProfile,
  conditions: HealthCondition[],
  wearable: WearableBiometrics,
  substitutions: UserSubstitutionPreference[]
): RecommendationEngineOutput {
  const readiness = calculateAutonomicReadiness(wearable, user);

  // Check conditions
  const hasGastritis = conditions.some(c => c.id.includes('gastritis') || c.name.toLowerCase().includes('gastrite'));
  const hasCholesterol = conditions.some(c => c.id.includes('cholesterol') || c.name.toLowerCase().includes('colesterol'));
  const hasLactose = conditions.some(c => c.id.includes('lactose') || c.name.toLowerCase().includes('lactose'));
  const hasSibo = conditions.some(c => c.id.includes('sibo') || c.name.toLowerCase().includes('sibo'));

  // Get lactose substitution mode
  const lactosePref = substitutions.find(s => s.intoleranceCode === 'lactose')?.preferredMode || 'alternative_certified';

  // 1. WORKOUT PRESCRIPTION
  let originalWorkout = 'Treino de Força Hipertrófico (Pernas + Core) e 15min HIIT';
  let adjustedWorkout = originalWorkout;
  let workoutIntensity: 'restorative' | 'moderate' | 'high' = 'high';
  let workoutDuration = 55;
  let workoutRationale = 'Carga normal mantida conforme prontidão fisiológica.';

  if (readiness.status === 'depleted') {
    adjustedWorkout = 'Caminhada Regenerativa em Zona 2 (60-65% FCM) + Mobilidade e Liberação Miofascial';
    workoutIntensity = 'restorative';
    workoutDuration = 35;
    workoutRationale = `Ajuste Automático Wearable: Sono curto (${Math.round(wearable.totalSleepMinutes / 60)}h) e tônus vagal reduzido. Evitar picos de cortisol que aumentam o LDL e pioram a permeabilidade gástrica.`;
  } else if (readiness.status === 'moderate') {
    adjustedWorkout = 'Treino Resistido Moderado (RPE 7/10) + 20min Cardio Contínuo Estável';
    workoutIntensity = 'moderate';
    workoutDuration = 45;
    workoutRationale = 'Volume ajustado para evitar sobretreinamento enquanto o sistema lipídico e digestivo se recuperam.';
  } else {
    adjustedWorkout = 'Musculação com Sobrecarga Progressiva + 15min HIIT em Bicicleta (baixo impacto gástrico)';
    workoutIntensity = 'high';
    workoutDuration = 55;
    workoutRationale = 'Prontidão autonômica no ápice. Momento ideal para treinos de alta densidade mitocondrial.';
  }

  // Adjust for gastritis in exercise
  if (hasGastritis) {
    adjustedWorkout += ' [Nota Clínica: Exercícios estritamente sem manobra de Valsalva ou posturas invertidas].';
  }

  // 2. CIRCADIAN NUTRITION PLAN
  const wakeParts = user.wakeTime.split(':').map(Number);
  const bedParts = user.bedTime.split(':').map(Number);

  const formatHour = (hour: number, minute: number) => {
    const h = (hour + 24) % 24;
    return `${String(h).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
  };

  const breakfastTime = formatHour(wakeParts[0] + 1, wakeParts[1]);
  const lunchTime = formatHour(wakeParts[0] + 5, wakeParts[1]);
  const snackTime = formatHour(wakeParts[0] + 9, wakeParts[1]);
  const dinnerTime = hasGastritis 
    ? formatHour(bedParts[0] - 3, bedParts[1]) // Gastrite exige jantar 3h antes de dormir
    : formatHour(bedParts[0] - 2, bedParts[1]);

  // Breakfast formulation
  const breakfastItems: string[] = [];
  if (hasGastritis) {
    breakfastItems.push('Shot Protetor: 150ml de água morna com extrato aquoso de Espinheira-Santa ou suco fresco de batata-doce/couve coado.');
    breakfastItems.push('Mingau quente de aveia (Beta-glucana 3g) cozido em leite vegetal com canela em pó (sem café em jejum).');
  } else {
    breakfastItems.push('Mingau funcional de aveia e sementes de chia (3g de beta-glucana para clearance de colesterol).');
  }

  // Handle Lactose in breakfast
  if (hasLactose) {
    if (lactosePref === 'enzymatic_supplement') {
      breakfastItems.push('Iogurte natural tradicional de ovelha ou vaca + 1 CÁPSULA DE LACTASE 10.000 FCC antes da primeira colherada.');
    } else if (lactosePref === 'alternative_certified') {
      breakfastItems.push('Iogurte vegetal de coco fortificado ou queijo tipo minas artesanal SEM LACTOSE certificado.');
    } else {
      breakfastItems.push('Ovos mexidos com azeite extravirgem e creme de abacate hass com sementes de abóbora (100% livre de derivados lácteos).');
    }
  } else {
    breakfastItems.push('Ovos caipiras mexidos com ervas e 1 fatia de pão de fermentação natural de centeio.');
  }

  // Lunch formulation
  const lunchItems: string[] = [
    'Salada rica em fitoesteróis: rúcula, brotos, pepino e 1 colher de sopa de sementes de abóbora cruas tostadas.',
    'Proteína magra antiaterogênica: filé de salmão selvagem grelhado ou peito de frango orgânico com alecrim.',
    'Carboidrato funcional de baixo índice glicêmico: batata-doce cozida no vapor ou arroz integral com lentilhas.',
    'Azeite de oliva extravirgem prensado a frio (acidez < 0,2%) cru como finalizador polifenólico.'
  ];
  if (hasGastritis) {
    lunchItems.push('Volume controlado: máximo 400g/ml. Evitar beber líquidos durante a refeição.');
  }

  // Afternoon Snack
  const snackItems: string[] = [
    'Mix de oleaginosas com alto teor de esteróis vegetais (nozes e castanhas-do-pará) + frutas vermelhas ricas em antocianinas.',
    'Chá de camomila ou hortelã morno.'
  ];

  // Dinner formulation
  const dinnerItems: string[] = [
    'Creme leve de abóbora cabotiá com gengibre e cúrcuma (digestão rápida para não impactar sono).',
    'Filé de tilápia ou tofu orgânico grelhado com legumes cozidos no vapor (cenoura e abobrinha).',
    hasGastritis ? 'Encerrar rigorosamente até as ' + dinnerTime + ' para garantir esvaziamento gástrico antes de deitar.' : 'Refeição noturna leve para favorecer pico fisiológico de melatonina.'
  ];

  // 3. SUPPLEMENTATION SCHEDULE (Tailored to conditions)
  const activeSupplements: RecommendationEngineOutput['activeSupplementsSchedule'] = [];

  if (hasCholesterol) {
    activeSupplements.push({
      supplement: 'Fitoesteróis Livres Padronizados',
      dosage: '1.000 mg',
      timeSlot: 'com_almoco',
      reason: 'Competição imediata contra o colesterol alimentar no transportador NPC1L1 intestinal.'
    });
    activeSupplements.push({
      supplement: 'Fitoesteróis Livres Padronizados',
      dosage: '1.000 mg',
      timeSlot: 'com_jantar',
      reason: 'Segunda dose para redução diária cumulativa de até 40% na reabsorção micelar de colesterol.'
    });
    activeSupplements.push({
      supplement: 'Berberina Fitossomada',
      dosage: '500 mg',
      timeSlot: 'com_almoco',
      reason: 'Estabilização do mRNA do receptor hepático LDLR e inibição da degradação mediada por PCSK9.'
    });
    activeSupplements.push({
      supplement: 'Red Yeast Rice (Monacolina K 5mg) + Ubiquinol CoQ10 (100mg)',
      dosage: '1 dose combinada',
      timeSlot: 'com_jantar',
      reason: 'Inibição noturna da enzima HMG-CoA redutase com resguardo mitocondrial muscular.'
    });
  }

  if (hasGastritis) {
    activeSupplements.push({
      supplement: 'Zinco L-Carnosina (Polaprezinc)',
      dosage: '75 mg',
      timeSlot: 'com_refeicao_manha',
      reason: 'Fixação eletrostática na mucosa gástrica e indução de choque térmico (HSP70) reparador.'
    });
    activeSupplements.push({
      supplement: 'Zinco L-Carnosina (Polaprezinc)',
      dosage: '75 mg',
      timeSlot: 'antes_dormir',
      reason: 'Segunda dose noturna para cicatrização das erosões gástricas durante o jejum sono.'
    });
  }

  // 4. SUBSTITUTIONS LOG
  const activeSubstitutions: RecommendationEngineOutput['activeSubstitutionsApplied'] = [];
  if (hasLactose) {
    let actionDesc = '';
    if (lactosePref === 'enzymatic_supplement') {
      actionDesc = 'Protocolo Enzimático: Liberado consumo de iogurte/derivados com pré-ingestão de enzima Lactase 10.000 FCC ALU.';
    } else if (lactosePref === 'alternative_certified') {
      actionDesc = 'Protocolo Zero Lactose: Substituição automática por queijos maturados > 6 meses (Parmesão) e leites vegetais fortificados.';
    } else {
      actionDesc = 'Protocolo de Corte Estrito: Remoção completa de lácteos e compensação de cálcio via Lithothamnium e sementes de gergelim preto.';
    }

    activeSubstitutions.push({
      trigger: 'Intolerância à Lactose',
      chosenMode: lactosePref,
      practicalAction: actionDesc
    });
  }

  // 5. CRITICAL LAB ALERTS
  const criticalLabAlerts: RecommendationEngineOutput['criticalLabAlerts'] = [];
  if (hasCholesterol) {
    criticalLabAlerts.push({
      testName: 'Perfil Lipídico + ApoB (Apolipoproteína B)',
      status: 'due_soon',
      dueDate: 'Em 45 dias',
      rationale: 'Monitorar a taxa de depuração de LDL e partículas aterogênicas sob protocolo de fitoesteróis e berberina.'
    });
    criticalLabAlerts.push({
      testName: 'Transaminases Hepáticas (TGO e TGP)',
      status: 'due_soon',
      dueDate: 'Em 45 dias',
      rationale: 'Painel de segurança hepática para acompanhamento do Red Yeast Rice natural.'
    });
  }

  if (hasGastritis) {
    criticalLabAlerts.push({
      testName: 'Endoscopia Digestiva Alta de Controle',
      status: 'up_to_date',
      dueDate: 'Em 6 meses',
      rationale: 'Avaliação de cicatrização da mucosa erosiva e erradicação de H. pylori.'
    });
  }

  return {
    date: new Date().toISOString().split('T')[0],
    autonomicReadinessScore: readiness.score,
    recoveryStatus: readiness.status,
    dailyWorkoutPrescription: {
      sessionName: 'Treino Diário Adaptado BioRytmo',
      originalType: originalWorkout,
      adjustedType: adjustedWorkout,
      intensity: workoutIntensity,
      durationMinutes: workoutDuration,
      wearableTriggerRationale: readiness.rationale
    },
    circadianNutritionPlan: {
      breakfast: {
        time: breakfastTime,
        items: breakfastItems,
        notes: hasGastritis ? 'Coma sem pressa e evite mastigar mexendo no smartphone para estimular a fase cefálica parassimpática da digestão.' : 'Refeição rica em fibras solúveis.'
      },
      lunch: {
        time: lunchTime,
        items: lunchItems,
        notes: 'Refeição principal do dia para sincronização dos relógios periféricos hepáticos.'
      },
      afternoonSnack: {
        time: snackTime,
        items: snackItems,
        notes: 'Aporte de gorduras boas e polifenóis.'
      },
      dinner: {
        time: dinnerTime,
        items: dinnerItems,
        notes: hasGastritis ? 'Jantar antecipado fundamental: impede refluxo ácido durante o sono profundo.' : 'Leveza digestiva para otimização da fase REM do sono.'
      },
      fastingWindow: hasGastritis ? '12 horas (ex: 19:30 às 07:30)' : '14 horas (ex: 20:00 às 10:00)',
      hydrationTargetMl: Math.round(user.weightKg * 35)
    },
    activeSupplementsSchedule: activeSupplements,
    activeSubstitutionsApplied: activeSubstitutions,
    criticalLabAlerts: criticalLabAlerts
  };
}
