// src/screens/LoginScreen.jsx
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

export default function LoginScreen() {
  const [isRegistering, setIsRegistering] = useState(false); // Alterna entre login e cadastro
  const [nickname, setNickname] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const { loginWithGoogle, registerWithEmail, loginWithEmail } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email || !password || (isRegistering && !nickname)) {
      setError('Por favor, preencha todos os campos.');
      return;
    }

    try {
      setIsSubmitting(true);
      if (isRegistering) {
        await registerWithEmail(email, password, nickname);
      } else {
        await loginWithEmail(email, password);
      }
    } catch (err) {
      if (err.code === 'auth/email-already-in-use') {
        setError('Este e-mail já está cadastrado.');
      } else if (err.code === 'auth/invalid-credential' || err.code === 'auth/wrong-password') {
        setError('E-mail ou senha incorretos.');
      } else {
        setError('Ocorreu um erro. Verifique os dados e tente novamente.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      setError('');
      setIsSubmitting(true);
      await loginWithGoogle();
    } catch (err) {
      if (err?.code === 'auth/popup-closed-by-user') {
        setError('Login com o Google cancelado.');
      } else {
        setError('Falha ao autenticar com o Google.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-indigo-950 via-slate-900 to-purple-950 px-4 text-white">
      <div className="w-full max-w-md rounded-3xl bg-slate-900/90 p-8 shadow-2xl backdrop-blur-md border border-slate-800">
        
        {/* Cabeçalho */}
        <div className="text-center">
          <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-600/20 text-3xl text-indigo-400 border border-indigo-500/30">
            🤖
          </div>
          <h1 className="text-3xl font-black tracking-tight text-white">NorthLibras</h1>
          <p className="mt-1 text-xs text-slate-400">
            {isRegistering ? 'Crie sua conta para começar a aprender' : 'Entre para continuar seus estudos'}
          </p>
        </div>

        {error && (
          <div className="mt-5 rounded-xl bg-red-500/10 p-3 text-center text-xs font-medium text-red-400 border border-red-500/20">
            {error}
          </div>
        )}

        {/* Formulário de E-mail / Senha / Apelido */}
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          
          {isRegistering && (
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                Seu Apelido
              </label>
              <input
                type="text"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                placeholder="Ex: MariaLibras"
                maxLength={20}
                className="w-full rounded-xl bg-slate-950 px-4 py-3 text-slate-100 placeholder-slate-600 outline-none ring-1 ring-slate-800 transition focus:ring-2 focus:ring-indigo-500 text-sm"
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
              E-mail
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seu@email.com"
              className="w-full rounded-xl bg-slate-950 px-4 py-3 text-slate-100 placeholder-slate-600 outline-none ring-1 ring-slate-800 transition focus:ring-2 focus:ring-indigo-500 text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
              Senha
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full rounded-xl bg-slate-950 px-4 py-3 text-slate-100 placeholder-slate-600 outline-none ring-1 ring-slate-800 transition focus:ring-2 focus:ring-indigo-500 text-sm"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full transform rounded-xl bg-indigo-600 py-3.5 font-extrabold text-white shadow-lg shadow-indigo-600/30 transition hover:bg-indigo-500 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer text-sm"
          >
            {isSubmitting ? 'Processando...' : (isRegistering ? 'Cadastrar Conta' : 'Entrar')}
          </button>
        </form>

        {/* Divisor */}
        <div className="relative my-6 flex items-center justify-center">
          <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-800"></div></div>
          <span className="relative bg-slate-900 px-3 text-xs uppercase tracking-wider text-slate-500 font-bold">Ou</span>
        </div>

        {/* Botão Google */}
        <button
          onClick={handleGoogleLogin}
          disabled={isSubmitting}
          className="flex w-full items-center justify-center gap-3 rounded-xl bg-white py-3.5 px-4 font-bold text-slate-800 shadow-md transition hover:bg-slate-100 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer text-sm"
        >
          <svg className="h-4 w-4" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
          </svg>
          <span>Continuar com o Google</span>
        </button>

        {/* Alternar entre Login e Cadastro */}
        <div className="mt-6 text-center">
          <button
            onClick={() => { setIsRegistering(!isRegistering); setError(''); }}
            className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 transition cursor-pointer"
          >
            {isRegistering ? 'Já tem uma conta? Faça login' : 'Não tem conta? Cadastre-se com apelido'}
          </button>
        </div>

      </div>
    </div>
  );
}