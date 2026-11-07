import { useAuth } from '../context/AuthContext';
import { calculateActiveStreak } from '../utils/streak';

export default function ProfileScreen({ onBack }) {
  const { userData, user } = useAuth();
  const photoURL = userData?.photoURL || user?.photoURL;

  // Cálculo da ofensiva ativa e status de hoje
  const { streak: activeStreak, isCompletedToday } = calculateActiveStreak(userData);

  // Data de criação formatada se disponível
  const memberSince = userData?.createdAt?.toDate
    ? userData.createdAt.toDate().toLocaleDateString('pt-BR')
    : '2026';

  return (
    <div className="flex min-h-screen flex-col bg-slate-950 text-white selection:bg-indigo-500 selection:text-white">
      
      {/* Cabeçalho */}
      <header className="sticky top-0 z-30 flex items-center justify-between border-b border-slate-800/80 bg-slate-950/90 px-6 sm:px-8 py-4 backdrop-blur-md">
        <button 
          onClick={onBack}
          className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-bold text-slate-300 border border-slate-800 transition hover:bg-slate-800 hover:text-white active:scale-95 cursor-pointer"
        >
          ← Voltar ao Início
        </button>
        <h1 className="text-xl font-black text-indigo-400">Meu Perfil</h1>
        <div className="w-24 hidden sm:block"></div> {/* Espaçador para centralizar o título */}
      </header>

      {/* Conteúdo Principal */}
      <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col px-4 sm:px-6 py-10 space-y-8">
        
        {/* CARD DE PERFIL DO USUÁRIO (Sem UID) */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-950/80 via-slate-900 to-slate-950 p-6 sm:p-8 border border-indigo-500/30 shadow-2xl">
          <div className="flex flex-col md:flex-row items-center gap-6">
            
            {/* Avatar / Imagem de perfil do Google */}
            <div className="flex h-24 w-24 sm:h-28 sm:w-28 shrink-0 items-center justify-center rounded-3xl bg-indigo-600/20 text-5xl border border-indigo-500/40 shadow-inner overflow-hidden">
              {photoURL ? (
                <img
                  src={photoURL}
                  alt={userData?.name || 'Estudante'}
                  className="h-full w-full object-cover"
                  referrerPolicy="no-referrer"
                />
              ) : (
                '🤖'
              )}
            </div>

            {/* Dados do Perfil */}
            <div className="flex-1 text-center md:text-left space-y-2">
              <div className="inline-block rounded-full bg-indigo-500/10 px-3 py-1 text-xs font-bold uppercase tracking-widest text-indigo-400 border border-indigo-500/20">
                Estudante Ativo
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                {userData?.name || 'Estudante'}
              </h2>
              {userData?.email && (
                <p className="text-xs sm:text-sm text-slate-400 font-medium">
                  {userData.email}
                </p>
              )}
            </div>

            {/* Estatísticas (Ofensiva, XP e Nível) */}
            <div className="flex gap-3 sm:gap-4 bg-slate-900/90 p-3.5 sm:p-4 rounded-2xl border border-slate-800 shadow-lg">
              <div className="text-center px-2 sm:px-3">
                <span className="block text-[11px] sm:text-xs font-bold text-slate-400 uppercase">Ofensiva</span>
                <span className={`text-xl sm:text-2xl font-black flex items-center justify-center gap-1 ${
                  isCompletedToday ? 'text-orange-400 drop-shadow-[0_0_8px_rgba(251,146,60,0.5)]' : activeStreak > 0 ? 'text-orange-400/90' : 'text-slate-500'
                }`}>
                  🔥 {activeStreak}
                </span>
              </div>
              <div className="w-px bg-slate-800"></div>
              <div className="text-center px-2 sm:px-3">
                <span className="block text-[11px] sm:text-xs font-bold text-slate-400 uppercase">XP Total</span>
                <span className="text-xl sm:text-2xl font-black text-amber-400">⚡ {userData?.xp || 0}</span>
              </div>
              <div className="w-px bg-slate-800"></div>
              <div className="text-center px-2 sm:px-3">
                <span className="block text-[11px] sm:text-xs font-bold text-slate-400 uppercase">Nível</span>
                <span className="text-xl sm:text-2xl font-black text-indigo-400">⭐ {userData?.level || 1}</span>
              </div>
            </div>

          </div>
        </div>

        {/* ESTATÍSTICAS E CONQUISTAS DO ESTUDANTE */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="rounded-2xl bg-slate-900/60 border border-slate-800 p-5 backdrop-blur-md">
            <span className="text-2xl mb-2 block">🔥</span>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Ofensiva Atual</span>
            <p className="text-base font-bold text-white mt-1">
              {activeStreak} {activeStreak === 1 ? 'dia consecutivo' : 'dias consecutivos'}
            </p>
            <p className={`text-xs mt-1 font-semibold ${isCompletedToday ? 'text-orange-400' : 'text-slate-400'}`}>
              {isCompletedToday 
                ? 'Lição de hoje concluída! Chama acesa 🔥' 
                : activeStreak > 0 
                  ? 'Pratique hoje para manter a sequência!' 
                  : 'Complete uma lição para iniciar sua ofensiva!'}
            </p>
          </div>

          <div className="rounded-2xl bg-slate-900/60 border border-slate-800 p-5 backdrop-blur-md">
            <span className="text-2xl mb-2 block">🎯</span>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Foco de Aprendizado</span>
            <p className="text-base font-bold text-white mt-1">LIBRAS Básico & Intermediário</p>
            <p className="text-xs mt-1 text-slate-400 font-semibold">Cumprimentos e Saudações</p>
          </div>

          <div className="rounded-2xl bg-slate-900/60 border border-slate-800 p-5 backdrop-blur-md">
            <span className="text-2xl mb-2 block">📅</span>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Estudante Desde</span>
            <p className="text-base font-bold text-white mt-1">{memberSince}</p>
            <p className="text-xs mt-1 text-emerald-400 font-semibold">Conta ativa no NorthLibras</p>
          </div>
        </div>

      </main>
    </div>
  );
}
