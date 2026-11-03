import React, { useState } from 'react';
import { FolderTree, Folder, File, Layers, Smartphone, Globe, Database, Terminal, Shield, Cpu } from 'lucide-react';

interface FileNode {
  name: string;
  type: 'folder' | 'file';
  desc: string;
  children?: FileNode[];
}

const MONOREPO_TREE: FileNode = {
  name: 'biorytmo-health-os',
  type: 'folder',
  desc: 'Monorepo Turborepo com compartilhamento de regras clínicas entre Web e Mobile',
  children: [
    {
      name: 'apps',
      type: 'folder',
      desc: 'Aplicações cliente',
      children: [
        {
          name: 'mobile (React Native / Expo)',
          type: 'folder',
          desc: 'App móvel nativo com ponte para Health Connect e Galaxy Fit 3',
          children: [
            { name: 'android/app/src/main/AndroidManifest.xml', type: 'file', desc: 'Permissões READ_SLEEP, READ_HEART_RATE' },
            { name: 'android/.../SamsungHealthWorker.kt', type: 'file', desc: 'CoroutineWorker em segundo plano para ingestão' },
            { name: 'src/screens/DailyRoutineScreen.tsx', type: 'file', desc: 'Tela principal com crononutrição e treino adaptado' },
            { name: 'src/screens/SubstitutionsScreen.tsx', type: 'file', desc: 'Painel de escolha de conduta (lactase vs corte)' },
            { name: 'src/screens/WearableSyncModal.tsx', type: 'file', desc: 'Status de pareamento com Galaxy Fit 3' },
            { name: 'src/hooks/useHealthConnectSync.ts', type: 'file', desc: 'Hook de escuta e sincronização periódica' },
            { name: 'app.json', type: 'file', desc: 'Configuração do Expo com plugins nativos de saúde' }
          ]
        },
        {
          name: 'web (Next.js App Router)',
          type: 'folder',
          desc: 'Portal web responsivo para o paciente e acompanhamento de exames',
          children: [
            { name: 'app/dashboard/page.tsx', type: 'file', desc: 'Visão executiva da rotina, sono e prontidão' },
            { name: 'app/labs/page.tsx', type: 'file', desc: 'Histórico de exames laboratoriais e alertas' },
            { name: 'app/knowledge-base/page.tsx', type: 'file', desc: 'Guia de patologias e protocolos naturais' },
            { name: 'components/ui/...', type: 'folder', desc: 'Componentes atômicos com Tailwind CSS' }
          ]
        }
      ]
    },
    {
      name: 'packages',
      type: 'folder',
      desc: 'Módulos compartilhados reutilizados em Web e Mobile',
      children: [
        {
          name: 'clinical-core',
          type: 'folder',
          desc: 'Motor agnóstico de recomendação fisiológica e crononutrição',
          children: [
            { name: 'src/recommendationEngine.ts', type: 'file', desc: 'Algoritmo decisório (Wearable + Patologias + Dieta)' },
            { name: 'src/circadianScheduler.ts', type: 'file', desc: 'Cálculo de janelas e horários de refeição' },
            { name: 'src/substitutionsResolver.ts', type: 'file', desc: 'Resolução lógica de opções de intolerância' },
            { name: 'src/pathologyRules.ts', type: 'file', desc: 'Catálogo de regras para colesterol, gastrite, etc.' }
          ]
        },
        {
          name: 'database',
          type: 'folder',
          desc: 'Clientes Supabase tipados e migrações',
          children: [
            { name: 'src/supabaseClient.ts', type: 'file', desc: 'Instância do cliente com RLS e Auth' },
            { name: 'src/types/database.types.ts', type: 'file', desc: 'Tipos gerados automaticamente pelo Supabase CLI' }
          ]
        }
      ]
    },
    {
      name: 'supabase',
      type: 'folder',
      desc: 'Infraestrutura de banco de dados e Edge Functions',
      children: [
        { name: 'migrations/20261103_init_schema.sql', type: 'file', desc: 'DDL completo com 10 tabelas e RLS' },
        { name: 'functions/ingest-wearable-metrics/index.ts', type: 'file', desc: 'Edge function Deno de ingestão do Fit 3' },
        { name: 'functions/recalculate-routine/index.ts', type: 'file', desc: 'Trigger de recálculo diário pós-sync' },
        { name: 'config.toml', type: 'file', desc: 'Configuração local do Supabase CLI' }
      ]
    }
  ]
};

export const ArchitectureDirectoryViewer: React.FC = () => {
  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 lg:p-8">
        <div className="max-w-3xl space-y-2">
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400">
            <FolderTree className="w-4 h-4" />
            <span>Pilar Estrutural: Arquitetura de Software Monorepo</span>
            <span>·</span>
            <span>Web + Mobile</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight">
            Estrutura de Pastas & Módulos para Produção
          </h1>
          <p className="text-xs text-slate-300 leading-relaxed">
            Estrutura recomendada para desenvolvimento escalável. O motor de recomendação (<strong>@biorytmo/clinical-core</strong>) é 100% agnóstico e compartilhado entre o aplicativo móvel (<strong>React Native</strong>) e a web (<strong>Next.js</strong>).
          </p>
        </div>
      </div>

      {/* Highlights Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-2 text-xs shadow-xs">
          <div className="flex items-center gap-2 text-indigo-700 font-bold">
            <Smartphone className="w-4 h-4" />
            <span>Mobile (Expo / React Native)</span>
          </div>
          <p className="text-slate-600 leading-relaxed">
            Contém o módulo nativo Android que conversa com o <strong>Health Connect</strong> para receber os dados do Samsung Galaxy Fit 3 em segundo plano.
          </p>
        </div>

        <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-2 text-xs shadow-xs">
          <div className="flex items-center gap-2 text-emerald-700 font-bold">
            <Cpu className="w-4 h-4" />
            <span>@biorytmo/clinical-core</span>
          </div>
          <p className="text-slate-600 leading-relaxed">
            Biblioteca TypeScript pura contendo o motor de decisão, cruzamento fisiológico e validação de contraindicações sem dependência de UI.
          </p>
        </div>

        <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-2 text-xs shadow-xs">
          <div className="flex items-center gap-2 text-amber-700 font-bold">
            <Database className="w-4 h-4" />
            <span>Supabase Edge Functions</span>
          </div>
          <p className="text-slate-600 leading-relaxed">
            Funções serverless em Deno para ingestão de biometria e orquestração de recálculo da rotina imediatamente após o usuário acordar.
          </p>
        </div>
      </div>

      {/* Interactive Monorepo Tree */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-200">
          <h2 className="text-base font-bold text-slate-900">
            Árvore de Diretórios do Projeto
          </h2>
          <span className="text-xs font-mono text-slate-500">Turborepo Workspace</span>
        </div>

        <div className="font-mono text-xs bg-slate-50 p-4 rounded-lg border border-slate-200 overflow-x-auto space-y-2 leading-relaxed">
          <RenderNode node={MONOREPO_TREE} depth={0} />
        </div>
      </div>
    </div>
  );
};

const RenderNode: React.FC<{ node: FileNode; depth: number }> = ({ node, depth }) => {
  const isFolder = node.type === 'folder';

  return (
    <div style={{ paddingLeft: `${depth * 18}px` }} className="space-y-1">
      <div className="flex items-center gap-2 py-0.5 hover:bg-slate-200/50 rounded px-1.5 transition-colors">
        {isFolder ? (
          <Folder className="w-3.5 h-3.5 text-amber-500 shrink-0" />
        ) : (
          <File className="w-3.5 h-3.5 text-slate-500 shrink-0" />
        )}
        <span className={`font-semibold ${isFolder ? 'text-slate-900' : 'text-slate-700'}`}>
          {node.name}
        </span>
        <span className="text-[10px] text-slate-400 font-sans tracking-tight ml-2">
          — {node.desc}
        </span>
      </div>
      {node.children && node.children.map((child, i) => (
        <RenderNode key={i} node={child} depth={depth + 1} />
      ))}
    </div>
  );
};
