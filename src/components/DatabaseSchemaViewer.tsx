import React, { useState } from 'react';
import { Database, Table, Key, Shield, Copy, Check, FileCode, Layers, ArrowRight } from 'lucide-react';
import { SUPABASE_SCHEMA_SQL } from '../data/supabaseSchemaSql';

interface TableDefinition {
  name: string;
  category: 'core' | 'knowledge' | 'wearable' | 'clinical';
  description: string;
  columns: {
    name: string;
    type: string;
    isPrimary?: boolean;
    isForeign?: boolean;
    foreignTable?: string;
    isNullable?: boolean;
    description: string;
  }[];
  rlsPolicy: string;
}

const TABLES: TableDefinition[] = [
  {
    name: 'profiles',
    category: 'core',
    description: 'Usuários estendidos com flag de onboarding para controle de primeiro acesso e baseline biométrico.',
    columns: [
      { name: 'id', type: 'UUID', isPrimary: true, isForeign: true, foreignTable: 'auth.users(id)', description: 'Chave primária vinculada ao auth.users do Supabase' },
      { name: 'full_name', type: 'TEXT', description: 'Nome completo ou preferido do usuário' },
      { name: 'nickname', type: 'TEXT', isNullable: true, description: 'Apelido informal para saudações na interface mobile' },
      { name: 'birth_date', type: 'DATE', description: 'Data de nascimento para cálculo dinâmico de idade' },
      { name: 'gender', type: 'gender_type', description: 'Sexo biológico (male, female, other)' },
      { name: 'height_cm', type: 'NUMERIC(5,2)', description: 'Altura em centímetros (cálculo de IMC)' },
      { name: 'weight_kg', type: 'NUMERIC(5,2)', description: 'Peso atual em kg' },
      { name: 'onboarding_completed', type: 'BOOLEAN', description: 'Controle de redirecionamento obrigatório no 1º login' },
      { name: 'onboarding_step', type: 'INTEGER', description: 'Passo atual do Wizard (1 a 8)' },
      { name: 'baseline_resting_hr', type: 'INTEGER', description: 'FC basal de repouso calibrada (default: 65)' },
      { name: 'wake_time / bed_time', type: 'TIME', description: 'Horários para sincronização circadiana' }
    ],
    rlsPolicy: 'auth.uid() = id (Usuário apenas lê e altera seu próprio perfil)'
  },
  {
    name: 'condicoes_saude_usuario',
    category: 'core',
    description: 'Armazena todas as condições de saúde física, intestinal, mental e crônica cadastradas no Onboarding.',
    columns: [
      { name: 'id', type: 'UUID', isPrimary: true, description: 'Identificador único' },
      { name: 'user_id', type: 'UUID', isForeign: true, foreignTable: 'profiles(id)', description: 'Chave estrangeira do usuário' },
      { name: 'category', type: 'condition_type_category', description: 'Categoria: physical_gut, mental, chronic ou intolerance' },
      { name: 'condition_name', type: 'TEXT', description: 'Nome da patologia (ex: Gastrite, Refluxo, Ansiedade, Colesterol)' },
      { name: 'severity', type: 'TEXT', description: 'Grau de severidade (mild, moderate, severe)' },
      { name: 'is_active', type: 'BOOLEAN', description: 'Status de atividade clínica' }
    ],
    rlsPolicy: 'auth.uid() = user_id'
  },
  {
    name: 'medicamentos_usuario',
    category: 'clinical',
    description: 'Gestão completa de medicamentos contínuos e temporários, dosagens, horários e níveis de estoque.',
    columns: [
      { name: 'id', type: 'UUID', isPrimary: true, description: 'Identificador único do medicamento' },
      { name: 'user_id', type: 'UUID', isForeign: true, foreignTable: 'profiles(id)', description: 'Chave do usuário' },
      { name: 'name', type: 'TEXT', description: 'Nome comercial ou genérico (ex: Amoxicilina, Fitoesteróis)' },
      { name: 'dosage', type: 'TEXT', description: 'Dosagem (ex: 50mg, 1 comprimido, 5000 UI)' },
      { name: 'type', type: 'medication_treatment_type', description: 'Tipo de tratamento: continuous ou temporary' },
      { name: 'continuous_frequency', type: 'continuous_frequency_type', isNullable: true, description: 'Frequência de uso contínuo (daily, alternate_days)' },
      { name: 'interval_hours', type: 'INTEGER', isNullable: true, description: 'Intervalo de horas em uso temporário (ex: 8h = 3x/dia)' },
      { name: 'start_date / end_date', type: 'DATE', description: 'Janela de tratamento agudo para cálculo de término' },
      { name: 'scheduled_times', type: 'TIME[]', description: 'Horários do dia de cada dose' },
      { name: 'current_stock', type: 'NUMERIC(8,2)', description: 'Estoque físico em mãos (decrementado no "Já tomei")' },
      { name: 'min_stock_alert_days', type: 'INTEGER', description: 'Dias de antecedência para disparar lista de compras (default: 5)' }
    ],
    rlsPolicy: 'auth.uid() = user_id'
  },
  {
    name: 'registros_estoque_medicamentos',
    category: 'clinical',
    description: 'Histórico de auditoria de consumo ("Já tomei") e reabastecimentos com trigger automático.',
    columns: [
      { name: 'id', type: 'UUID', isPrimary: true, description: 'Identificador do registro' },
      { name: 'user_id', type: 'UUID', isForeign: true, foreignTable: 'profiles(id)', description: 'Chave do usuário' },
      { name: 'medicamento_id', type: 'UUID', isForeign: true, foreignTable: 'medicamentos_usuario(id)', description: 'Medicamento movimentado' },
      { name: 'movement_type', type: 'stock_movement_type', description: 'Tipo: dose_intake ("Já tomei"), refill_purchase (+30), etc.' },
      { name: 'quantity_changed', type: 'NUMERIC(6,2)', description: 'Variação (-1 para consumo, +30 para compra)' },
      { name: 'stock_after', type: 'NUMERIC(8,2)', description: 'Saldo de estoque resultante após movimentação' },
      { name: 'recorded_at', type: 'TIMESTAMPTZ', description: 'Timestamp exato da tomada ou compra' }
    ],
    rlsPolicy: 'auth.uid() = user_id'
  },
  {
    name: 'dados_wearables',
    category: 'wearable',
    description: 'Logs fisiológicos sincronizados do Samsung Galaxy Fit 3 com suporte a inserção/edição manual.',
    columns: [
      { name: 'id', type: 'UUID', isPrimary: true, description: 'Identificador do log' },
      { name: 'user_id', type: 'UUID', isForeign: true, foreignTable: 'profiles(id)', description: 'Chave do usuário' },
      { name: 'log_date', type: 'DATE', description: 'Data da medição diária (chave única diária)' },
      { name: 'device_model', type: 'TEXT', description: 'Modelo: Samsung Galaxy Fit 3' },
      { name: 'sleep_score', type: 'INTEGER', description: 'Pontuação de sono de 0 a 100' },
      { name: 'deep_sleep_minutes', type: 'INTEGER', description: 'Minutos em sono profundo reparador N3' },
      { name: 'resting_heart_rate', type: 'INTEGER', description: 'Frequência cardíaca basal de repouso (bpm)' },
      { name: 'stress_level', type: 'INTEGER', description: 'Score de estresse contínuo (0 a 100)' },
      { name: 'blood_pressure_systolic / diastolic', type: 'INTEGER', isNullable: true, description: 'Pressão arterial (sistólica/diastólica)' },
      { name: 'is_manual_entry', type: 'BOOLEAN', description: 'Flag indicando se o dado foi inserido manualmente pelo usuário' }
    ],
    rlsPolicy: 'auth.uid() = user_id'
  },
  {
    name: 'exames_usuario',
    category: 'clinical',
    description: 'Histórico de exames laboratoriais anexados (PDFs e fotos no Supabase Storage) com marcadores.',
    columns: [
      { name: 'id', type: 'UUID', isPrimary: true, description: 'Identificador do exame' },
      { name: 'user_id', type: 'UUID', isForeign: true, foreignTable: 'profiles(id)', description: 'Chave do usuário' },
      { name: 'title', type: 'TEXT', description: 'Nome do exame (ex: Perfil Lipídico, Endoscopia)' },
      { name: 'exam_date', type: 'DATE', description: 'Data da coleta laboratorial' },
      { name: 'file_url', type: 'TEXT', description: 'URL segura no bucket medical-records' },
      { name: 'file_type', type: 'TEXT', description: 'MIME type: application/pdf, image/jpeg, etc.' },
      { name: 'parsed_markers', type: 'JSONB', description: 'Marcadores extraídos (ex: { total_cholesterol: 400 })' },
      { name: 'next_due_date', type: 'DATE', isNullable: true, description: 'Data limite calculada para repetição' }
    ],
    rlsPolicy: 'auth.uid() = user_id'
  },
  {
    name: 'metas_usuario',
    category: 'core',
    description: 'Metas primárias de saúde selecionadas no Onboarding (colesterol, emagrecimento, sono, etc.).',
    columns: [
      { name: 'id', type: 'UUID', isPrimary: true, description: 'Identificador da meta' },
      { name: 'user_id', type: 'UUID', isForeign: true, foreignTable: 'profiles(id)', description: 'Chave do usuário' },
      { name: 'goal_key', type: 'TEXT', description: 'Chave: cholesterol_control, gut_health, sleep_optimization' },
      { name: 'goal_title', type: 'TEXT', description: 'Título amigável da meta' },
      { name: 'is_completed', type: 'BOOLEAN', description: 'Status de alcance da meta' }
    ],
    rlsPolicy: 'auth.uid() = user_id'
  },
  {
    name: 'knowledge_base_pathologies',
    category: 'knowledge',
    description: 'Catálogo médico central de patologias, causas fisiopatológicas, alimentos e suplementos naturais.',
    columns: [
      { name: 'id', type: 'TEXT', isPrimary: true, description: 'Slug identificador (ex: cholesterol_severe, gastritis_gerd)' },
      { name: 'name', type: 'TEXT', description: 'Nome clínico oficial' },
      { name: 'category', type: 'TEXT', description: 'Área médica' },
      { name: 'what_harms', type: 'JSONB', description: 'Alimentos nocivos, hábitos e mecanismos inflamatórios' },
      { name: 'what_helps', type: 'JSONB', description: 'Alimentos funcionais, protetores e fitoquímicos' },
      { name: 'natural_supplements', type: 'JSONB', description: 'Array de suplementos com dosagens, mecanismos e evidência' }
    ],
    rlsPolicy: 'Leitura pública autenticada (SELECT)'
  }
];

export const DatabaseSchemaViewer: React.FC = () => {
  const [selectedTable, setSelectedTable] = useState<TableDefinition>(TABLES[0]);
  const [viewMode, setViewMode] = useState<'visual' | 'sql'>('visual');
  const [copied, setCopied] = useState<boolean>(false);

  const handleCopySql = () => {
    navigator.clipboard.writeText(SUPABASE_SCHEMA_SQL);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 lg:p-8">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-2 max-w-3xl">
            <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400">
              <Database className="w-4 h-4" />
              <span>Modelagem Relacional PostgreSQL</span>
              <span>·</span>
              <span>Supabase Architecture</span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight">
              Arquitetura de Dados Supabase (10 Tabelas Relacionais)
            </h1>
            <p className="text-xs text-slate-300 leading-relaxed">
              Estrutura normalizada com RLS (Row Level Security), triggers de auditoria, tipos ENUM, campos JSONB para flexibilidade de protocolos e índices otimizados para séries temporais do Galaxy Fit 3.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setViewMode(viewMode === 'visual' ? 'sql' : 'visual')}
              className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-lg bg-slate-800 text-slate-200 hover:bg-slate-700 transition-colors border border-slate-700"
            >
              <FileCode className="w-4 h-4 text-emerald-400" />
              <span>{viewMode === 'visual' ? 'Ver DDL SQL Completo' : 'Ver Diagrama & Colunas'}</span>
            </button>
            <button
              onClick={handleCopySql}
              className="flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white transition-colors shadow-sm"
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'SQL Copiado!' : 'Copiar DDL Supabase'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Supabase Connected Project Banner */}
      <div className="p-4 rounded-xl border border-emerald-300 bg-emerald-50/50 flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <strong className="text-emerald-950 font-bold">Instância Supabase Conectada:</strong>
            <code className="font-mono text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">
              dghygagvamygvxudvwtn.supabase.co
            </code>
          </div>
          <p className="text-slate-600 text-[11px] leading-relaxed">
            Para inicializar as tabelas no seu projeto Supabase, copie o SQL abaixo, abra o <strong>SQL Editor</strong> no painel do Supabase e clique em <strong>Run</strong>.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleCopySql}
            className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer"
          >
            {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'SQL Copiado!' : 'Copiar DDL Completo'}</span>
          </button>
        </div>
      </div>

      {viewMode === 'visual' ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Table List (4 Cols) */}
          <div className="lg:col-span-4 bg-white rounded-xl border border-slate-200 p-4 shadow-xs space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Tabelas do Sistema ({TABLES.length})
              </span>
              <span className="text-[11px] text-slate-500 font-mono">public schema</span>
            </div>

            <div className="space-y-1.5">
              {TABLES.map((t) => {
                const isSelected = selectedTable.name === t.name;
                return (
                  <button
                    key={t.name}
                    type="button"
                    onClick={() => setSelectedTable(t)}
                    className={`w-full text-left p-3 rounded-lg text-xs transition-all flex items-center justify-between cursor-pointer ${
                      isSelected
                        ? 'bg-slate-900 text-white shadow-xs'
                        : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200/60'
                    }`}
                  >
                    <div>
                      <span className="font-mono font-bold block">{t.name}</span>
                      <span className={`text-[10px] block line-clamp-1 ${isSelected ? 'text-slate-300' : 'text-slate-500'}`}>
                        {t.description}
                      </span>
                    </div>
                    <ArrowRight className={`w-3.5 h-3.5 shrink-0 ${isSelected ? 'text-emerald-400' : 'text-slate-400'}`} />
                  </button>
                );
              })}
            </div>
          </div>

          {/* Selected Table Detail (8 Cols) */}
          <div className="lg:col-span-8 bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-200">
              <div>
                <div className="flex items-center gap-2">
                  <Table className="w-5 h-5 text-emerald-600" />
                  <h2 className="text-lg font-bold font-mono text-slate-900">
                    public.{selectedTable.name}
                  </h2>
                </div>
                <p className="text-xs text-slate-600 mt-1">
                  {selectedTable.description}
                </p>
              </div>
              <span className="text-[11px] font-mono font-semibold px-2.5 py-1 rounded bg-slate-100 text-slate-700 self-start sm:self-auto">
                Categoria: {selectedTable.category}
              </span>
            </div>

            {/* RLS Badge */}
            <div className="p-3.5 rounded-lg bg-emerald-50/60 border border-emerald-200 text-xs flex items-start gap-3">
              <Shield className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-emerald-950 block">Política de Segurança RLS (Row Level Security):</span>
                <code className="font-mono text-[11px] text-emerald-800 block mt-0.5">
                  {selectedTable.rlsPolicy}
                </code>
              </div>
            </div>

            {/* Columns Table */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-slate-900 uppercase tracking-wider block">
                Colunas & Tipos de Dados ({selectedTable.columns.length})
              </span>

              <div className="overflow-x-auto border border-slate-200 rounded-lg">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 font-semibold">
                    <tr>
                      <th className="py-2.5 px-3">Coluna</th>
                      <th className="py-2.5 px-3">Tipo PostgreSQL</th>
                      <th className="py-2.5 px-3">Chaves</th>
                      <th className="py-2.5 px-3">Descrição Clínica / Propósito</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {selectedTable.columns.map((col, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-2.5 px-3 font-mono font-bold text-slate-900 whitespace-nowrap">
                          {col.name}
                        </td>
                        <td className="py-2.5 px-3 font-mono text-slate-600 whitespace-nowrap">
                          {col.type}
                        </td>
                        <td className="py-2.5 px-3 whitespace-nowrap">
                          {col.isPrimary && (
                            <span className="text-[10px] font-bold text-amber-800 bg-amber-100 px-1.5 py-0.5 rounded font-mono mr-1">
                              PK
                            </span>
                          )}
                          {col.isForeign && (
                            <span className="text-[10px] font-bold text-indigo-800 bg-indigo-100 px-1.5 py-0.5 rounded font-mono" title={col.foreignTable}>
                              FK → {col.foreignTable}
                            </span>
                          )}
                          {!col.isPrimary && !col.isForeign && (
                            <span className="text-slate-400 text-[10px]">—</span>
                          )}
                        </td>
                        <td className="py-2.5 px-3 text-slate-600 text-[11px] leading-relaxed">
                          {col.description}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Relational Mapping Guide */}
            <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 space-y-2">
              <span className="text-xs font-bold text-slate-900 block">
                Relacionamentos & Integridade Referencial:
              </span>
              <p className="text-xs text-slate-600 leading-relaxed">
                Toda exclusão em cascata (<code>ON DELETE CASCADE</code>) é protegida a partir de <code>auth.users</code>. 
                Se o usuário deletar sua conta em cumprimento à LGPD/GDPR, todos os seus dados biométricos, condições de saúde e históricos de exames são expurgados atomicamente.
              </p>
            </div>
          </div>
        </div>
      ) : (
        /* SQL DDL View */
        <div className="bg-slate-950 rounded-xl border border-slate-800 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2 text-slate-200">
              <FileCode className="w-5 h-5 text-emerald-400" />
              <span className="text-sm font-bold font-mono">supabase_schema_biorytmo.sql</span>
            </div>
            <button
              onClick={handleCopySql}
              className="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded bg-emerald-600 hover:bg-emerald-500 text-white transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copiado!' : 'Copiar Todo o Código'}</span>
            </button>
          </div>
          <pre className="font-mono text-xs text-emerald-300 overflow-x-auto max-h-[600px] leading-relaxed p-4 bg-slate-900/80 rounded-lg">
            {SUPABASE_SCHEMA_SQL}
          </pre>
        </div>
      )}
    </div>
  );
};
