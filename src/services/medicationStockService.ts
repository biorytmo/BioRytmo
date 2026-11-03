import {
  UserMedication,
  StockCalculationResult,
  ShoppingListItem
} from '../types/health';

/**
 * Calcula a taxa diária de consumo para medicamentos de uso contínuo
 */
export function calculateContinuousDailyRate(medication: UserMedication): number {
  const dosesPerIntakeDay = Math.max(1, medication.times.length);

  switch (medication.continuousFrequency) {
    case 'alternate_days':
      return dosesPerIntakeDay / 2; // consome dia sim, dia não (0.5x)
    case 'specific_weekdays':
      const daysCount = medication.specificDays?.length || 7;
      return (dosesPerIntakeDay * daysCount) / 7;
    case 'daily':
    default:
      return dosesPerIntakeDay;
  }
}

/**
 * Calcula o consumo diário para medicamentos de uso temporário (ex: antibióticos de 8 em 8h)
 */
export function calculateTemporaryDailyRate(medication: UserMedication): number {
  if (medication.intervalHours && medication.intervalHours > 0) {
    return 24 / medication.intervalHours; // ex: de 8 em 8h = 3 doses/dia
  }
  return Math.max(1, medication.times.length);
}

/**
 * Realiza o cálculo analítico completo do estoque de um medicamento
 */
export function calculateMedicationStock(
  medication: UserMedication,
  currentDateStr: string = new Date().toISOString().split('T')[0]
): StockCalculationResult {
  const isContinuous = medication.type === 'continuous';
  const alertThresholdDays = medication.minStockAlertDays ?? 5;

  if (isContinuous) {
    const dailyRate = calculateContinuousDailyRate(medication);
    const daysRemaining = dailyRate > 0 
      ? Math.floor(medication.currentStock / dailyRate) 
      : 999;

    const projectedDate = new Date();
    projectedDate.setDate(projectedDate.getDate() + daysRemaining);
    const projectedDateStr = projectedDate.toISOString().split('T')[0];

    const isLowStock = daysRemaining <= alertThresholdDays;
    let alertSeverity: 'none' | 'warning' | 'urgent' = 'none';
    let alertMessage = `Estoque seguro: ${daysRemaining} dias restantes.`;

    if (daysRemaining <= 0) {
      alertSeverity = 'urgent';
      alertMessage = 'Estoque esgotado! Necessária reposição imediata.';
    } else if (daysRemaining <= 2) {
      alertSeverity = 'urgent';
      alertMessage = `Atenção Crítica: Apenas ${daysRemaining} dias de medicação restante!`;
    } else if (isLowStock) {
      alertSeverity = 'warning';
      alertMessage = `Estoque baixo: ${daysRemaining} dias restantes. Incluído na Lista de Compras.`;
    }

    // Sugere compra para 30 dias de tratamento contínuo
    const suggestedPurchase = Math.ceil(dailyRate * 30);

    return {
      medicationId: medication.id,
      medicationName: medication.name,
      type: 'continuous',
      dailyConsumptionRate: Number(dailyRate.toFixed(2)),
      daysRemaining,
      projectedStockOutDate: projectedDateStr,
      isLowStock,
      isTemporaryFinished: false,
      temporaryProgressPercentage: 0,
      alertSeverity,
      alertMessage,
      suggestedPurchaseQuantity: suggestedPurchase
    };
  }

  // Tratamento Temporário (Infecções, Antibióticos, Anti-inflamatórios com data de término)
  const dailyRate = calculateTemporaryDailyRate(medication);
  const start = new Date(medication.startDate + 'T00:00:00');
  const end = medication.endDate ? new Date(medication.endDate + 'T23:59:59') : new Date();
  const now = new Date(currentDateStr + 'T12:00:00');

  const totalDurationMs = Math.max(1, end.getTime() - start.getTime());
  const totalDays = Math.max(1, Math.ceil(totalDurationMs / (1000 * 60 * 60 * 24)));
  const totalDosesNeeded = Math.ceil(totalDays * dailyRate);

  const elapsedMs = Math.max(0, now.getTime() - start.getTime());
  const daysPassed = Math.min(totalDays, Math.ceil(elapsedMs / (1000 * 60 * 60 * 24)));
  const progressPercent = Math.min(100, Math.round((daysPassed / totalDays) * 100));

  const isTemporaryFinished = now >= end || progressPercent >= 100;
  const dosesRemainingToFinish = Math.max(0, totalDosesNeeded - (daysPassed * dailyRate));
  const hasInsufficientStock = medication.currentStock < dosesRemainingToFinish;

  let alertSeverity: 'none' | 'warning' | 'urgent' = 'none';
  let alertMessage = '';

  if (isTemporaryFinished) {
    alertMessage = `Tratamento concluído com sucesso em ${medication.endDate}. Suspender uso.`;
  } else if (hasInsufficientStock) {
    alertSeverity = 'urgent';
    const missingDoses = Math.ceil(dosesRemainingToFinish - medication.currentStock);
    alertMessage = `Atenção: Seu estoque (${medication.currentStock} un) não é suficiente para concluir o ciclo até ${medication.endDate}! Faltam ${missingDoses} ${medication.unit}.`;
  } else {
    alertMessage = `Tratamento temporário em andamento (${progressPercent}% concluído). Término previsto: ${medication.endDate}.`;
  }

  const daysRemaining = dailyRate > 0 ? Math.floor(medication.currentStock / dailyRate) : 0;
  const projectedDate = new Date();
  projectedDate.setDate(projectedDate.getDate() + daysRemaining);

  return {
    medicationId: medication.id,
    medicationName: medication.name,
    type: 'temporary',
    dailyConsumptionRate: Number(dailyRate.toFixed(2)),
    daysRemaining,
    projectedStockOutDate: projectedDate.toISOString().split('T')[0],
    isLowStock: hasInsufficientStock && !isTemporaryFinished,
    isTemporaryFinished,
    temporaryProgressPercentage: progressPercent,
    alertSeverity,
    alertMessage,
    suggestedPurchaseQuantity: hasInsufficientStock ? Math.ceil(dosesRemainingToFinish - medication.currentStock) : 0
  };
}

/**
 * Gera a lista de compras automática de farmácia com base nos medicamentos em alerta de estoque
 */
export function generateSmartPharmacyShoppingList(
  medications: UserMedication[]
): ShoppingListItem[] {
  const items: ShoppingListItem[] = [];

  medications.forEach((med) => {
    const analysis = calculateMedicationStock(med);

    if (analysis.isLowStock || analysis.daysRemaining <= (med.minStockAlertDays ?? 5)) {
      items.push({
        id: `shop_${med.id}`,
        medicationId: med.id,
        name: med.name,
        dosage: med.dosage,
        currentStock: med.currentStock,
        daysRemaining: analysis.daysRemaining,
        suggestedQuantity: analysis.suggestedPurchaseQuantity,
        urgency: analysis.alertSeverity === 'urgent' ? 'urgent' : 'warning',
        checked: false
      });
    }
  });

  return items.sort((a, b) => a.daysRemaining - b.daysRemaining);
}

/**
 * Confirma que uma dose foi tomada: decrementa o estoque e registra o horário
 */
export function recordDoseTaken(
  medications: UserMedication[],
  medicationId: string
): { updatedMedications: UserMedication[]; updatedMed: UserMedication } {
  let updatedMed: UserMedication | null = null;

  const updatedMedications = medications.map((med) => {
    if (med.id === medicationId) {
      const newStock = Math.max(0, med.currentStock - 1);
      const newTakenCount = (med.takenTodayCount || 0) + 1;
      updatedMed = {
        ...med,
        currentStock: newStock,
        takenTodayCount: newTakenCount,
        lastTakenAt: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
      };
      return updatedMed;
    }
    return med;
  });

  return { updatedMedications, updatedMed: updatedMed! };
}
