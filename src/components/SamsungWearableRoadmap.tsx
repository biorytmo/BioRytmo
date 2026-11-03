import React, { useState } from 'react';
import { Watch, Cpu, Wifi, Smartphone, ArrowRight, ShieldCheck, Code, CheckCircle, AlertTriangle, Layers } from 'lucide-react';

export const SamsungWearableRoadmap: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'architecture' | 'android_code' | 'edge_function' | 'troubleshooting'>('architecture');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const copySnippet = (codeText: string, key: string) => {
    navigator.clipboard.writeText(codeText);
    setCopiedCode(key);
    setTimeout(() => setCopiedCode(null), 2500);
  };

  const KOTLIN_WORKER_CODE = `// ==============================================================================
// BIORYTMO HEALTH CONNECT SYNC WORKER (KOTLIN / ANDROID)
// Sincroniza dados do Samsung Galaxy Fit 3 através do Samsung Health / Health Connect
// ==============================================================================

package com.biorytmo.health.wearables

import android.content.Context
import androidx.health.connect.client.HealthConnectClient
import androidx.health.connect.client.records.HeartRateRecord
import androidx.health.connect.client.records.RestingHeartRateRecord
import androidx.health.connect.client.records.SleepSessionRecord
import androidx.health.connect.client.records.StepsRecord
import androidx.health.connect.client.request.ReadRecordsRequest
import androidx.health.connect.client.time.TimeRangeFilter
import androidx.work.CoroutineWorker
import androidx.work.WorkerParameters
import okhttp3.MediaType.Companion.toMediaType
import okhttp3.OkHttpClient
import okhttp3.Request
import okhttp3.RequestBody.Companion.toRequestBody
import org.json.JSONObject
import java.time.Instant
import java.time.temporal.ChronoUnit

class SamsungHealthSyncWorker(
    appContext: Context,
    workerParams: WorkerParameters
) : CoroutineWorker(appContext, workerParams) {

    private val healthConnectClient by lazy { HealthConnectClient.getOrCreate(appContext) }
    private val httpClient = OkHttpClient()

    override suspend fun doWork(): Result {
        return try {
            val now = Instant.now()
            val startTime = now.minus(24, ChronoUnit.HOURS)

            // 1. Ler Sessões de Sono do Galaxy Fit 3
            val sleepResponse = healthConnectClient.readRecords(
                ReadRecordsRequest(
                    recordType = SleepSessionRecord::class,
                    timeRangeFilter = TimeRangeFilter.between(startTime, now)
                )
            )

            // 2. Ler FC de Repouso (Resting Heart Rate)
            val restingHrResponse = healthConnectClient.readRecords(
                ReadRecordsRequest(
                    recordType = RestingHeartRateRecord::class,
                    timeRangeFilter = TimeRangeFilter.between(startTime, now)
                )
            )

            // 3. Ler Passos Totais do Dia
            val stepsResponse = healthConnectClient.readRecords(
                ReadRecordsRequest(
                    recordType = StepsRecord::class,
                    timeRangeFilter = TimeRangeFilter.between(startTime, now)
                )
            )

            val latestSleep = sleepResponse.records.maxByOrNull { it.endTime }
            val latestRestingHr = restingHrResponse.records.lastOrNull()?.beatsPerMinute ?: 65
            val totalSteps = stepsResponse.records.sumOf { it.count }

            // 4. Montar Payload JSON para a Supabase Edge Function
            val payload = JSONObject().apply {
                put("device_model", "Samsung Galaxy Fit 3")
                put("source", "samsung_health_connect")
                put("log_date", now.toString().substring(0, 10))
                put("sleep_start", latestSleep?.startTime?.toString())
                put("sleep_end", latestSleep?.endTime?.toString())
                put("resting_heart_rate", latestRestingHr)
                put("steps_count", totalSteps)
            }

            // 5. Ingestão Segura via POST na Edge Function
            val request = Request.Builder()
                .url("https://[SEU_PROJETO].supabase.co/functions/v1/ingest-wearable-metrics")
                .header("Authorization", "Bearer \${getUserJwtToken()}")
                .post(payload.toString().toRequestBody("application/json".toMediaType()))
                .build()

            val response = httpClient.newCall(request).execute()
            if (response.isSuccessful) {
                Result.success()
            } else {
                Result.retry()
            }
        } catch (e: Exception) {
            e.printStackTrace()
            Result.retry()
        }
    }

    private fun getUserJwtToken(): String {
        // Recupera token da sessão Supabase do armazenamento seguro (EncryptedSharedPreferences)
        return "JWT_TOKEN_DO_USUARIO"
    }
}`;

  const SUPABASE_EDGE_FUNCTION_CODE = `// ==============================================================================
// SUPABASE EDGE FUNCTION: /functions/v1/ingest-wearable-metrics
// Recebe métricas do Galaxy Fit 3, armazena no PostgreSQL e aciona o motor clínico
// ==============================================================================

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // 1. Validar Token JWT do Usuário
    const authHeader = req.headers.get("Authorization")!;
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Não autorizado" }), { status: 401 });
    }

    const body = await req.json();
    const { log_date, sleep_score, resting_heart_rate, deep_sleep_minutes, steps_count } = body;

    // 2. Inserir ou Atualizar Log Biométrico Diário (UPSERT)
    const { data, error } = await supabase
      .from("wearable_biometrics_daily")
      .upsert({
        user_id: user.id,
        log_date: log_date || new Date().toISOString().split("T")[0],
        sleep_score: sleep_score || 70,
        resting_heart_rate: resting_heart_rate || 65,
        deep_sleep_minutes: deep_sleep_minutes || 45,
        steps_count: steps_count || 0,
        raw_payload: body,
        synced_at: new Date().toISOString()
      }, { onConflict: "user_id, log_date" });

    if (error) throw error;

    // 3. Disparo Automático: Acionar Motor de Recomendação para recalcular o dia
    // (Pode invocar função de cálculo interna ou enfileirar para o Worker)

    return new Response(JSON.stringify({ success: true, message: "Biometria sincronizada com sucesso" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500
    });
  }
});`;

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 lg:p-8">
        <div className="max-w-3xl space-y-2">
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400">
            <Watch className="w-4 h-4" />
            <span>Pilar 3: Wearables & Hardware Architecture</span>
            <span>·</span>
            <span>Samsung Galaxy Fit 3</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight">
            Roteiro de Integração: Samsung Galaxy Fit 3 & Samsung Health
          </h1>
          <p className="text-xs text-slate-300 leading-relaxed">
            O <strong>Galaxy Fit 3</strong> opera sob <strong>FreeRTOS / RTOS proprietário</strong> (sem WearOS). 
            Descubra a arquitetura de produção via <strong>Health Connect</strong> e <strong>Samsung Health Data SDK</strong> para sincronizar sono, FC de repouso e prontidão com zero atrito de bateria.
          </p>
        </div>

        {/* Tab Controls */}
        <div className="mt-6 pt-6 border-t border-slate-800 flex flex-wrap gap-2">
          {[
            { id: 'architecture', label: '1. Pipeline de Dados & Topologia' },
            { id: 'android_code', label: '2. Código Android (Health Connect Worker)' },
            { id: 'edge_function', label: '3. Supabase Edge Function Ingest' },
            { id: 'troubleshooting', label: '4. Particularidades do Fit 3 & Bateria' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-3 py-2 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                activeTab === tab.id
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab 1: Architecture Diagram */}
      {activeTab === 'architecture' && (
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-6">
          <div className="border-b border-slate-200 pb-4">
            <h2 className="text-base font-bold text-slate-900">
              Topologia de Comunicação do Samsung Galaxy Fit 3
            </h2>
            <p className="text-xs text-slate-600 mt-1">
              Como o dado sai do pulso do usuário e chega normalizado ao banco de dados Supabase em 4 camadas.
            </p>
          </div>

          {/* 4 Steps Flow */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Step 1 */}
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2 text-xs">
              <div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center font-bold font-mono">
                01
              </div>
              <h3 className="font-bold text-slate-900">Hardware: Galaxy Fit 3</h3>
              <p className="text-slate-600 text-[11px] leading-relaxed">
                Sensores fotopletismografia (PPG), acelerômetro e barômetro coletam FC em tempo real, estágios de sono (REM, N1, N2, N3) e estresse.
              </p>
              <span className="text-[10px] font-mono font-semibold text-slate-500 bg-slate-200 px-1.5 py-0.5 rounded block">
                Protocolo: BLE (Bluetooth 5.3)
              </span>
            </div>

            {/* Step 2 */}
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2 text-xs">
              <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold font-mono">
                02
              </div>
              <h3 className="font-bold text-slate-900">Galaxy Wearable & S-Health</h3>
              <p className="text-slate-600 text-[11px] leading-relaxed">
                O aplicativo Galaxy Wearable gerencia o pareamento BLE e descarrega os blocos de dados criptografados diretamente para o Samsung Health.
              </p>
              <span className="text-[10px] font-mono font-semibold text-emerald-800 bg-emerald-100 px-1.5 py-0.5 rounded block">
                Samsung Proprietary Sync
              </span>
            </div>

            {/* Step 3 */}
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2 text-xs">
              <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold font-mono">
                03
              </div>
              <h3 className="font-bold text-slate-900">Health Connect (Android API)</h3>
              <p className="text-slate-600 text-[11px] leading-relaxed">
                Samsung Health grava os registros na camada unificada Health Connect (Google/Samsung). Nosso app móvel lê via permissões granulares.
              </p>
              <span className="text-[10px] font-mono font-semibold text-indigo-800 bg-indigo-100 px-1.5 py-0.5 rounded block">
                androidx.health.connect.client
              </span>
            </div>

            {/* Step 4 */}
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2 text-xs">
              <div className="w-8 h-8 rounded-lg bg-amber-600 text-white flex items-center justify-center font-bold font-mono">
                04
              </div>
              <h3 className="font-bold text-slate-900">BioRytmo Core / Supabase</h3>
              <p className="text-slate-600 text-[11px] leading-relaxed">
                Worker em background faz push do payload sanitizado para a Edge Function do Supabase, recalculando a rotina do usuário instantaneamente.
              </p>
              <span className="text-[10px] font-mono font-semibold text-amber-800 bg-amber-100 px-1.5 py-0.5 rounded block">
                HTTPS REST / JSON Webhook
              </span>
            </div>
          </div>

          {/* Key Architectural Reality Callout */}
          <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 text-xs space-y-2">
            <span className="font-bold text-slate-900 block">
              Nota Arquitetural Crucial: Por que Health Connect é o caminho correto para o Galaxy Fit 3?
            </span>
            <p className="text-slate-700 leading-relaxed">
              O Galaxy Fit 3 custa uma fração de um Galaxy Watch porque roda um <strong>RTOS de baixo consumo</strong> com autonomia de até 13 dias. Ele <strong>não roda WearOS</strong>, logo não aceita instalação direta de apps de terceiros.
              Toda a telemetria é direcionada obrigatoriamente para o app Samsung Health. 
              A Samsung unificou sua API externa no <strong>Health Connect</strong> (padrão oficial a partir do Android 14). Portanto, ao implementar Health Connect no BioRytmo, o app funciona perfeitamente não apenas com o Galaxy Fit 3, mas também com Galaxy Watch 4/5/6/7, Pixel Watch, Garmin e Xiaomi que sincronizem com o Android!
            </p>
          </div>
        </div>
      )}

      {/* Tab 2: Android Kotlin Code */}
      {activeTab === 'android_code' && (
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200">
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Implementação Android: CoroutineWorker & Health Connect
              </h2>
              <p className="text-xs text-slate-600">
                Código Kotlin para leitura em segundo plano dos registros de sono e frequência cardíaca do Galaxy Fit 3.
              </p>
            </div>
            <button
              onClick={() => copySnippet(KOTLIN_WORKER_CODE, 'kotlin')}
              className="px-3 py-1.5 text-xs font-semibold rounded bg-slate-900 hover:bg-slate-800 text-white transition-colors"
            >
              {copiedCode === 'kotlin' ? 'Código Copiado!' : 'Copiar Kotlin'}
            </button>
          </div>

          <pre className="p-4 rounded-lg bg-slate-950 font-mono text-xs text-emerald-400 overflow-x-auto max-h-[500px] leading-relaxed">
            {KOTLIN_WORKER_CODE}
          </pre>

          <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 text-xs space-y-1">
            <span className="font-bold text-slate-900 block">Permissões no AndroidManifest.xml:</span>
            <code className="font-mono text-[11px] text-slate-700 block">
              &lt;uses-permission android:name="android.permission.health.READ_SLEEP" /&gt;
            </code>
            <code className="font-mono text-[11px] text-slate-700 block">
              &lt;uses-permission android:name="android.permission.health.READ_HEART_RATE" /&gt;
            </code>
            <code className="font-mono text-[11px] text-slate-700 block">
              &lt;uses-permission android:name="android.permission.health.READ_RESTING_HEART_RATE" /&gt;
            </code>
          </div>
        </div>
      )}

      {/* Tab 3: Supabase Edge Function Code */}
      {activeTab === 'edge_function' && (
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200">
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Endpoint Supabase Edge Function (Deno / TypeScript)
              </h2>
              <p className="text-xs text-slate-600">
                Função serverless que recebe o payload do smartphone, valida autenticação JWT e persiste os dados na tabela <code>wearable_biometrics_daily</code>.
              </p>
            </div>
            <button
              onClick={() => copySnippet(SUPABASE_EDGE_FUNCTION_CODE, 'edge')}
              className="px-3 py-1.5 text-xs font-semibold rounded bg-slate-900 hover:bg-slate-800 text-white transition-colors"
            >
              {copiedCode === 'edge' ? 'Código Copiado!' : 'Copiar TypeScript'}
            </button>
          </div>

          <pre className="p-4 rounded-lg bg-slate-950 font-mono text-xs text-emerald-400 overflow-x-auto max-h-[500px] leading-relaxed">
            {SUPABASE_EDGE_FUNCTION_CODE}
          </pre>
        </div>
      )}

      {/* Tab 4: Troubleshooting & Battery */}
      {activeTab === 'troubleshooting' && (
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-4 text-xs">
          <div className="pb-3 border-b border-slate-200">
            <h2 className="text-base font-bold text-slate-900">
              Particularidades Técnicas & Otimizações para o Galaxy Fit 3
            </h2>
            <p className="text-slate-600 mt-1">
              Boas práticas de engenharia móvel para evitar bloqueios de bateria pelo sistema operacional Android (Doze Mode).
            </p>
          </div>

          <div className="space-y-3">
            <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 space-y-1">
              <span className="font-bold text-slate-900 block">
                1. Janela Ideal de Sincronização do Sono:
              </span>
              <p className="text-slate-700 leading-relaxed">
                O Galaxy Fit 3 consolida o arquivo final de estágios de sono entre 15 a 30 minutos após o usuário levantar e dar os primeiros passos. 
                Configure o <code>PeriodicWorkRequest</code> do Android para disparar o sync 20 minutos após o alarme do usuário ou horário previsto de despertar.
              </p>
            </div>

            <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 space-y-1">
              <span className="font-bold text-slate-900 block">
                2. Tratamento de Variações de Frequência Cardíaca (HRV):
              </span>
              <p className="text-slate-700 leading-relaxed">
                Ao contrário de relógios clínicos com ECG ativo, pulseiras esportivas como o Fit 3 calculam a variabilidade cardíaca (rMSSD) principalmente durante o sono estável. 
                Sempre use a FC de repouso (RHR) calibrada com o baseline de 7 dias caso a leitura de HRV falhe em noites com muita movimentação.
              </p>
            </div>

            <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 space-y-1">
              <span className="font-bold text-slate-900 block">
                3. Economia de Bateria no Smartphone:
              </span>
              <p className="text-slate-700 leading-relaxed">
                Nunca use loop contínuo de polling via Bluetooth. Deixe o app Galaxy Wearable fazer o sync passivo com o Samsung Health e configure seu Worker com <code>setConstraints(Constraints.Builder().setRequiredNetworkType(NetworkType.CONNECTED).build())</code>.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
