import React from 'react';
import {
  Download,
  Smartphone,
  Share,
  PlusSquare,
  CheckCircle2,
  X,
  Sparkles,
  HeartPulse,
  BellRing,
  ShoppingCart,
  Watch
} from 'lucide-react';

interface PWAInstallPromptModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInstall: () => Promise<boolean>;
  hasNativePrompt: boolean;
  isIOS: boolean;
  isInstalled: boolean;
}

export const PWAInstallPromptModal: React.FC<PWAInstallPromptModalProps> = ({
  isOpen,
  onClose,
  onInstall,
  hasNativePrompt,
  isIOS,
  isInstalled
}) => {
  if (!isOpen || isInstalled) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-950/75 backdrop-blur-sm p-0 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-md rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden border border-slate-200 flex flex-col animate-in slide-in-from-bottom-8 duration-300">
        
        {/* Header Ribbon */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-950 text-white p-5 relative">
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-slate-300 hover:text-white transition-colors cursor-pointer"
            aria-label="Fechar"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-3.5">
            <div className="w-14 h-14 rounded-2xl bg-slate-900 border-2 border-emerald-400/60 p-2 shadow-lg flex items-center justify-center relative">
              <HeartPulse className="w-8 h-8 text-emerald-400 animate-pulse" />
              <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-slate-900" />
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold uppercase tracking-wider">
                <Sparkles className="w-3 h-3" />
                <span>Aplicativo Oficial</span>
              </div>
              <h2 className="text-base font-bold text-white mt-0.5">
                Instalar o BioRytmo no Celular
              </h2>
              <p className="text-[11px] text-slate-300">
                Acesse direto da sua tela de início como um app nativo
              </p>
            </div>
          </div>
        </div>

        {/* Benefits list */}
        <div className="p-5 space-y-4 bg-slate-50">
          <div className="space-y-2.5">
            <div className="flex items-start gap-3 p-2.5 rounded-xl bg-white border border-slate-200 shadow-2xs">
              <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
                <BellRing className="w-4 h-4" />
              </div>
              <div className="text-xs">
                <strong className="text-slate-900 block font-semibold">Cronograma de Doses na Palma da Mão</strong>
                <span className="text-slate-500 text-[11px]">Confirme "Já tomei" em 1 toque com baixa em tempo real.</span>
              </div>
            </div>

            <div className="flex items-start gap-3 p-2.5 rounded-xl bg-white border border-slate-200 shadow-2xs">
              <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center shrink-0 mt-0.5">
                <ShoppingCart className="w-4 h-4" />
              </div>
              <div className="text-xs">
                <strong className="text-slate-900 block font-semibold">Lista de Compras Automática de Farmácia</strong>
                <span className="text-slate-500 text-[11px]">Alerta quando o estoque de remédios atingir 5 dias de autonomia.</span>
              </div>
            </div>

            <div className="flex items-start gap-3 p-2.5 rounded-xl bg-white border border-slate-200 shadow-2xs">
              <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center shrink-0 mt-0.5">
                <Watch className="w-4 h-4" />
              </div>
              <div className="text-xs">
                <strong className="text-slate-900 block font-semibold">Telemetria Samsung Galaxy Fit 3</strong>
                <span className="text-slate-500 text-[11px]">Adaptação diária de treino e rotina de acordo com seu sono.</span>
              </div>
            </div>
          </div>

          {/* Action Trigger / Guides */}
          {isIOS ? (
            <div className="p-3.5 rounded-2xl bg-indigo-50 border border-indigo-200 space-y-2 text-xs text-indigo-950">
              <span className="font-bold flex items-center gap-1.5 text-xs text-indigo-900">
                <Smartphone className="w-4 h-4 text-indigo-600" />
                Como instalar no iPhone / iPad (Safari):
              </span>
              <ol className="list-decimal list-inside space-y-1.5 text-[11px] text-slate-700 font-medium">
                <li className="flex items-center gap-2">
                  <span>1. Toque no botão de <strong>Compartilhar</strong></span>
                  <span className="inline-flex items-center px-1.5 py-0.5 rounded bg-white border border-slate-300 font-mono text-[10px]">
                    <Share className="w-3 h-3 text-indigo-600 mr-1" /> Compartilhar
                  </span>
                </li>
                <li className="flex items-center gap-2">
                  <span>2. Role para baixo e selecione</span>
                  <span className="inline-flex items-center px-1.5 py-0.5 rounded bg-white border border-slate-300 font-mono text-[10px]">
                    <PlusSquare className="w-3 h-3 text-emerald-600 mr-1" /> Adicionar à Tela de Início
                  </span>
                </li>
              </ol>
            </div>
          ) : (
            <div className="space-y-2 pt-1">
              <button
                type="button"
                onClick={async () => {
                  const success = await onInstall();
                  if (!success && !hasNativePrompt) {
                    alert('Para instalar, abra o menu do navegador (três pontinhos ⋮) e toque em "Instalar aplicativo" ou "Adicionar à tela inicial".');
                  }
                }}
                className="w-full min-h-[48px] py-3 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-500 active:scale-98 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Instalar Aplicativo Agora</span>
              </button>
            </div>
          )}

          {/* Dismiss button */}
          <button
            type="button"
            onClick={onClose}
            className="w-full py-2.5 text-xs text-slate-500 hover:text-slate-800 font-semibold text-center cursor-pointer transition-colors"
          >
            Continuar pelo navegador por enquanto
          </button>
        </div>

      </div>
    </div>
  );
};
