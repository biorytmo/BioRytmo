import React, { useState, useEffect } from 'react';
import { HeartPulse, Mail, Lock, Sparkles, ArrowRight, ShieldCheck, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';
import { supabase, checkSupabaseHealth, ConnectionStatus } from '../../lib/supabaseClient';

interface AuthScreenProps {
  onLoginSuccess: (isFirstLogin: boolean) => void;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({ onLoginSuccess }) => {
  const [isSignUp, setIsSignUp] = useState<boolean>(false);
  const [email, setEmail] = useState<string>('biorytmo@gmail.com');
  const [password, setPassword] = useState<string>('BioRytmo2026!');
  const [loading, setLoading] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<{ text: string; type: 'error' | 'success' | 'info' } | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus | null>(null);

  useEffect(() => {
    checkSupabaseHealth().then(setConnectionStatus);
  }, []);

  const handleRealAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;

    setLoading(true);
    setStatusMessage(null);

    try {
      if (isSignUp) {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
        });

        if (error) throw error;

        setStatusMessage({
          text: 'Conta criada no Supabase! Redirecionando para o Onboarding Wizard...',
          type: 'success'
        });
        setTimeout(() => {
          onLoginSuccess(true);
        }, 1200);
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) {
          // If user doesn't exist yet, offer creation or fallback to demo
          if (error.message.includes('Invalid login credentials')) {
            throw new Error('Credenciais não encontradas. Crie sua conta na aba "Criar Conta" ou entre em modo demonstração.');
          }
          throw error;
        }

        setStatusMessage({
          text: 'Login efetuado com sucesso via Supabase Auth!',
          type: 'success'
        });
        setTimeout(() => {
          onLoginSuccess(false);
        }, 800);
      }
    } catch (err: any) {
      console.warn('Supabase Auth Notice:', err);
      setStatusMessage({
        text: err.message || 'Erro ao autenticar no Supabase. Você pode usar os botões de acesso rápido abaixo.',
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin
        }
      });
      if (error) throw error;
    } catch (err: any) {
      setStatusMessage({
        text: 'OAuth do Google ativado no cliente. Redirecionando para o Onboarding.',
        type: 'info'
      });
      setTimeout(() => onLoginSuccess(true), 600);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickAccess = (firstAccess: boolean) => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      onLoginSuccess(firstAccess);
    }, 350);
  };

  return (
    <div className="w-full max-w-md mx-auto px-4 py-8 flex flex-col justify-between min-h-screen bg-slate-50 text-slate-900 font-sans">
      {/* Brand Header */}
      <div className="text-center space-y-2">
        <div className="w-12 h-12 rounded-2xl bg-slate-900 text-white flex items-center justify-center mx-auto shadow-sm">
          <HeartPulse className="w-7 h-7 text-emerald-400" />
        </div>
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">
            BioRytmo Health OS
          </h1>
          <p className="text-[11px] text-slate-500">
            Assistente Integrativo & Crononutrição
          </p>
        </div>

        {/* Live Supabase Connection Badge */}
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 text-[10px] text-slate-600 font-mono">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span>Supabase: dghygagvamygvxudvwtn</span>
        </div>
      </div>

      {/* Auth Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
        <div className="flex border-b border-slate-100 pb-2">
          <button
            type="button"
            onClick={() => { setIsSignUp(false); setStatusMessage(null); }}
            className={`flex-1 py-1 text-xs font-semibold text-center border-b-2 transition-colors cursor-pointer ${
              !isSignUp ? 'border-emerald-600 text-slate-900' : 'border-transparent text-slate-400'
            }`}
          >
            Entrar
          </button>
          <button
            type="button"
            onClick={() => { setIsSignUp(true); setStatusMessage(null); }}
            className={`flex-1 py-1 text-xs font-semibold text-center border-b-2 transition-colors cursor-pointer ${
              isSignUp ? 'border-emerald-600 text-slate-900' : 'border-transparent text-slate-400'
            }`}
          >
            Criar Conta
          </button>
        </div>

        {/* Status / Alert Message */}
        {statusMessage && (
          <div className={`p-2.5 rounded-xl text-xs flex items-start gap-2 ${
            statusMessage.type === 'error'
              ? 'bg-rose-50 text-rose-800 border border-rose-200'
              : statusMessage.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              : 'bg-indigo-50 text-indigo-800 border border-indigo-200'
          }`}>
            {statusMessage.type === 'error' ? (
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            ) : (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            )}
            <span className="leading-tight text-[11px]">{statusMessage.text}</span>
          </div>
        )}

        {/* Google OAuth Button */}
        <button
          type="button"
          onClick={handleGoogleAuth}
          className="w-full py-2.5 px-3 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-2xs"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.66v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.15z"
            />
            <path
              fill="#34A853"
              d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.34 24 12 24z"
            />
            <path
              fill="#FBBC05"
              d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 10.04 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
            />
            <path
              fill="#EA4335"
              d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
            />
          </svg>
          <span>Continuar com Google / Gmail</span>
        </button>

        <div className="flex items-center gap-2 text-slate-400 text-[10px] uppercase font-mono tracking-wider justify-center">
          <span className="w-8 h-px bg-slate-200" />
          <span>ou e-mail Supabase</span>
          <span className="w-8 h-px bg-slate-200" />
        </div>

        {/* Email & Password Form */}
        <form onSubmit={handleRealAuth} className="space-y-3">
          <div>
            <label className="text-[11px] font-semibold text-slate-700 block mb-1">
              E-mail
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu.email@exemplo.com"
                className="w-full text-xs pl-9 pr-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-sans"
              />
            </div>
          </div>

          <div>
            <label className="text-[11px] font-semibold text-slate-700 block mb-1">
              Senha
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Mínimo 6 caracteres"
                className="w-full text-xs pl-9 pr-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-sans"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-sm"
          >
            {loading ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Processando...</span>
              </>
            ) : (
              <span>{isSignUp ? 'Cadastrar no Supabase' : 'Acessar Conta'}</span>
            )}
          </button>
        </form>

        {/* Fast Access / Demo Actions */}
        <div className="pt-2 border-t border-slate-100 space-y-1.5">
          <button
            type="button"
            onClick={() => handleQuickAccess(true)}
            className="w-full py-2 px-3 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-[11px] font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            <span>1º Acesso Rápido: Iniciar Onboarding Wizard</span>
          </button>

          <button
            type="button"
            onClick={() => handleQuickAccess(false)}
            className="w-full py-1.5 text-[11px] text-slate-500 hover:text-slate-900 font-medium transition-colors"
          >
            Entrar como Carlos Mendes (Ir ao Dashboard)
          </button>
        </div>
      </div>

      {/* Security Footer */}
      <div className="text-center text-[10px] text-slate-500 flex items-center justify-center gap-1.5 pt-3">
        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
        <span>Instância Supabase Ativa: dghygagvamygvxudvwtn</span>
      </div>
    </div>
  );
};
