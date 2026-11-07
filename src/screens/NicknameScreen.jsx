// src/screens/NicknameScreen.jsx
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

export default function NicknameScreen() {
  const { user, saveNickname, logout } = useAuth();

  // Sugestão inicial: primeiro nome da conta Google ou vazio
  const getInitialSuggestion = () => {
    if (!user?.displayName) return '';
    const firstName = user.displayName.split(' ')[0];
    return firstName.slice(0, 20);
  };

  const [nickname, setNickname] = useState(getInitialSuggestion);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const cleanNickname = nickname.trim();

    if (!cleanNickname) {
      setError('Por favor, informe um apelido.');
      return;
    }

    if (cleanNickname.length < 2) {
      setError('O apelido deve ter no mínimo 2 caracteres.');
      return;
    }

    if (cleanNickname.length > 20) {
      setError('O apelido não pode ultrapassar 20 caracteres.');
      return;
    }

    try {
      setIsSubmitting(true);
      await saveNickname(cleanNickname);
    } catch (err) {
      console.error(err);
      setError('Não foi possível salvar seu apelido. Tente novamente.');
      setIsSubmitting(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (err) {
      console.error('Erro ao sair da conta:', err);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-indigo-950 via-slate-900 to-purple-950 px-4 text-white">
      <div className="w-full max-w-md rounded-3xl bg-slate-900/90 p-8 shadow-2xl backdrop-blur-md border border-slate-800">
        
        {/* Cabeçalho com Avatar do Google ou Robô */}
        <div className="text-center">
          <div className="relative mx-auto mb-4 flex h-20 w-20 items-center justify-center">
            {user?.photoURL ? (
              <img
                src={user.photoURL}
                alt={user.displayName || 'Usuário'}
                className="h-20 w-20 rounded-2xl object-cover border-2 border-indigo-500/50 shadow-lg shadow-indigo-500/20"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-indigo-600/20 text-4xl text-indigo-400 border border-indigo-500/30 shadow-inner">
                🤖
              </div>
            )}
            <span 
              className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-600 text-xs shadow-md border border-indigo-400"
              title="Primeiro Acesso com Google"
            >
              ✨
            </span>
          </div>

          <div className="inline-flex items-center gap-1.5 rounded-full bg-indigo-500/10 px-3 py-1 text-xs font-bold uppercase tracking-widest text-indigo-400 border border-indigo-500/20 mb-3">
            <span>🎉</span> Primeiro Acesso
          </div>

          <h1 className="text-2xl font-black tracking-tight text-white">
            Escolha seu Apelido
          </h1>
          <p className="mt-2 text-xs text-slate-400 leading-relaxed">
            {user?.displayName ? (
              <>Olá, <strong className="text-slate-200">{user.displayName}</strong>! Como gostaria de ser chamado(a) no NorthLibras?</>
            ) : (
              'Como gostaria de ser chamado(a) durante seus estudos no NorthLibras?'
            )}
          </p>
        </div>

        {/* Mensagem de Erro */}
        {error && (
          <div className="mt-5 rounded-xl bg-red-500/10 p-3 text-center text-xs font-medium text-red-400 border border-red-500/20">
            {error}
          </div>
        )}

        {/* Card Informativo */}
        <div className="mt-5 flex items-start gap-3 rounded-2xl bg-slate-950/60 p-3.5 border border-slate-800/80 text-xs text-slate-300">
          <span className="text-base leading-none">💡</span>
          <p className="leading-relaxed">
            Seu apelido será exibido na sua tela inicial, no seu perfil e no <strong>ranking de pontuação</strong> dos estudantes.
          </p>
        </div>

        {/* Formulário do Apelido */}
        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div>
            <div className="flex items-center justify-between mb-1">
              <label htmlFor="nickname-input" className="block text-xs font-bold uppercase tracking-wider text-slate-400">
                Seu Apelido
              </label>
              <span className={`text-[11px] font-mono ${nickname.length > 20 ? 'text-red-400' : 'text-slate-500'}`}>
                {nickname.length}/20
              </span>
            </div>

            <input
              id="nickname-input"
              type="text"
              autoFocus
              value={nickname}
              onChange={(e) => {
                setNickname(e.target.value);
                if (error) setError('');
              }}
              placeholder="Ex: MariaLibras, DevGamer, Carlos..."
              maxLength={20}
              className="w-full rounded-xl bg-slate-950 px-4 py-3 text-slate-100 placeholder-slate-600 outline-none ring-1 ring-slate-800 transition focus:ring-2 focus:ring-indigo-500 text-sm font-medium"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting || nickname.trim().length === 0}
            className="w-full transform rounded-xl bg-indigo-600 py-3.5 font-extrabold text-white shadow-lg shadow-indigo-600/30 transition hover:bg-indigo-500 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer text-sm flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <svg className="h-4 w-4 animate-spin text-white" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                </svg>
                <span>Salvando apelido...</span>
              </>
            ) : (
              <span>Começar a Aprender 🚀</span>
            )}
          </button>
        </form>

        {/* Rodapé: Informação da conta e Logout */}
        <div className="mt-6 pt-5 border-t border-slate-800/80 text-center space-y-2">
          {user?.email && (
            <p className="text-[11px] text-slate-500 truncate">
              Conectado como <span className="text-slate-400 font-mono">{user.email}</span>
            </p>
          )}
          <button
            onClick={handleLogout}
            disabled={isSubmitting}
            className="text-xs font-semibold text-slate-400 hover:text-rose-400 transition cursor-pointer disabled:cursor-not-allowed"
          >
            Entrar com outra conta
          </button>
        </div>

      </div>
    </div>
  );
}
