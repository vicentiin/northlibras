import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { moduleData } from '../data/moduledata_temp';
import { calculateActiveStreak } from '../utils/streak';

export default function HomeScreen({ onStartModule, onOpenProfile, onOpenRanking }) {
  const { user, userData, logout } = useAuth();
  const [activeTooltip, setActiveTooltip] = useState(null);
  const [photoError, setPhotoError] = useState(false);

  // Cálculo da ofensiva ativa e status de hoje
  const { streak: activeStreak, isCompletedToday } = calculateActiveStreak(userData);

  // Foto de perfil do usuário vinda do Google ou Firestore
  const photoURL = userData?.photoURL || user?.photoURL;

  // Lista de nós para montar a trilha estilo Duolingo
  const pathNodes = [
    {
      id: 'cumprimentos',
      type: 'level',
      title: moduleData.title,
      description: moduleData.description,
      icon: '⭐',
      status: 'unlocked', // 'unlocked', 'current', ou 'locked'
      offset: 'translate-x-0', // Centralizado no topo
    },
    {
      id: 'livro_1',
      type: 'book',
      title: 'Histórias Curtas',
      description: 'Pratique a leitura de gestos básicos em contexto.',
      icon: '📖',
      status: 'locked',
      offset: 'translate-x-12', // Deslocado para a direita
    },
    {
      id: 'bau_1',
      type: 'chest',
      title: 'Baú de Recompensa',
      description: 'Acumule XP para abrir este baú de bônus.',
      icon: '🧰',
      status: 'locked',
      offset: 'translate-x-16', // Mais à direita
    },
    {
      id: 'modulo_2',
      type: 'level',
      title: 'Módulo 2: Cores em LIBRAS',
      description: 'Aprenda a sinalizar as principais cores.',
      icon: '⭐',
      status: 'locked',
      offset: 'translate-x-6', // Voltando
    },
    {
      id: 'livro_2',
      type: 'book',
      title: 'Prática de Diálogos',
      description: 'Simule conversas reais em LIBRAS.',
      icon: '📖',
      status: 'locked',
      offset: '-translate-x-6', // Deslocado para a esquerda
    },
  ];

  return (
    <div className="relative flex min-h-screen flex-col bg-slate-950 text-white selection:bg-indigo-500 selection:text-white">
      
      {/* Cabeçalho / Navbar */}
      <header className="sticky top-0 z-30 flex items-center justify-between border-b border-slate-800/80 bg-slate-950/90 px-4 sm:px-6 py-4 backdrop-blur-md">
        {/* Identificação do Estudante com foto de perfil do Google */}
        <div className="flex items-center gap-3">
          <div className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-indigo-600/20 border border-indigo-500/30 shadow-inner overflow-hidden">
            {photoURL && !photoError ? (
              <img
                src={photoURL}
                alt={userData?.name || 'Foto de perfil'}
                className="h-full w-full object-cover"
                referrerPolicy="no-referrer"
                onError={() => setPhotoError(true)}
              />
            ) : (
              <span className="text-2xl">🤖</span>
            )}
          </div>
          <div>
            <h1 className="text-xl font-black tracking-tight text-white">NorthLibras</h1>
            <p className="text-xs font-medium text-slate-400">
              Estudante: <span className="font-bold text-indigo-400">{userData?.name || 'Estudante'}</span>
            </p>
          </div>
        </div>

        {/* Estatísticas e Ações (Ofensiva, Ranking, Perfil, Sair) */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Foguinho de Ofensiva, XP & Nível */}
          <div className="flex items-center gap-2.5 sm:gap-3 rounded-2xl bg-slate-900 px-3 sm:px-3.5 py-2 border border-slate-800 shadow-sm">
            {/* Ofensiva */}
            <div 
              className={`flex items-center gap-1.5 font-black text-xs sm:text-sm transition-all duration-300 ${
                isCompletedToday 
                  ? 'text-orange-400 drop-shadow-[0_0_8px_rgba(251,146,60,0.6)]' 
                  : activeStreak > 0 
                    ? 'text-orange-400/85' 
                    : 'text-slate-500'
              }`}
              title={
                isCompletedToday 
                  ? `Ofensiva de ${activeStreak} ${activeStreak === 1 ? 'dia' : 'dias'}! Lição de hoje concluída!`
                  : activeStreak > 0 
                    ? `Ofensiva de ${activeStreak} ${activeStreak === 1 ? 'dia' : 'dias'}. Conclua uma lição hoje para manter a chama acesa!`
                    : 'Conclua uma lição hoje para iniciar sua ofensiva!'
              }
            >
              <span className={`text-base transition-transform duration-300 ${isCompletedToday ? 'scale-110 animate-pulse' : ''}`}>
                🔥
              </span>
              <span>{activeStreak}</span>
            </div>

            <div className="h-4 w-px bg-slate-800"></div>

            <div className="flex items-center gap-1.5 font-extrabold text-amber-400 text-xs sm:text-sm">
              <span>⚡</span>
              <span>{userData?.xp || 0} XP</span>
            </div>

            <div className="h-4 w-px bg-slate-800"></div>

            <div className="flex items-center gap-1.5 font-extrabold text-indigo-400 text-xs sm:text-sm">
              <span>Nível</span>
              <span>{userData?.level || 1}</span>
            </div>
          </div>

          {/* Botão Ranking */}
          <button
            onClick={onOpenRanking}
            className="flex h-11 items-center gap-2 px-3.5 sm:px-4 rounded-2xl bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-amber-500/40 text-slate-300 hover:text-amber-400 transition duration-200 active:scale-95 text-xs sm:text-sm font-bold cursor-pointer"
            title="Ver Ranking de Estudantes"
          >
            <span className="text-base">🏆</span>
            <span className="hidden sm:inline">Ranking</span>
          </button>

          {/* Botão Perfil */}
          <button
            onClick={onOpenProfile}
            className="flex h-11 items-center gap-2 px-3.5 sm:px-4 rounded-2xl bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-indigo-500/40 text-slate-300 hover:text-indigo-400 transition duration-200 active:scale-95 text-xs sm:text-sm font-bold cursor-pointer"
            title="Ver Meu Perfil"
          >
            <span className="text-base">👤</span>
            <span className="hidden sm:inline">Perfil</span>
          </button>

          {/* Botão Sair (sem ícone de porta, apenas texto) */}
          <button
            onClick={async () => {
              if (window.confirm('Deseja sair da sua conta?')) {
                await logout();
              }
            }}
            className="flex h-11 items-center px-4 rounded-2xl bg-slate-900 hover:bg-red-900/40 border border-slate-800 hover:border-red-700/50 transition duration-200 active:scale-95 text-xs sm:text-sm font-bold text-slate-400 hover:text-red-400 cursor-pointer"
            title="Sair da conta"
          >
            Sair
          </button>
        </div>
      </header>

      {/* Área da Trilha de Aprendizado */}
      <main className="relative mx-auto flex w-full max-w-4xl flex-1 flex-col items-center px-6 py-12">
        
        {/* Título da Seção Atual */}
        <div className="mb-12 text-center">
          <span className="inline-block rounded-full bg-indigo-500/10 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-indigo-400 border border-indigo-500/20">
            Seção 1 • Introdução
          </span>
          <h2 className="mt-2 text-3xl font-black text-white">
            Cumprimentos & Saudações
          </h2>
        </div>

        {/* Trilha de Nós / Caminho */}
        <div className="relative flex flex-col items-center space-y-10 py-4 w-full max-w-xs">
          
          {pathNodes.map((node) => {
            const isUnlocked = node.status === 'unlocked';
            const isHovered = activeTooltip === node.id;

            return (
              <div
                key={node.id}
                className={`relative flex flex-col items-center transition-all duration-300 ${node.offset}`}
                onMouseEnter={() => setActiveTooltip(node.id)}
                onMouseLeave={() => setActiveTooltip(null)}
              >
                
                {/* TOOLTIP / POP-UP QUE APARECE NO HOVER */}
                {isHovered && (
                  <div className="absolute -top-32 z-20 w-64 rounded-2xl bg-indigo-600 p-4 text-white shadow-2xl shadow-indigo-600/40 border border-indigo-400/40 animate-fade-in text-center">
                    <h4 className="font-extrabold text-base mb-1">{node.title}</h4>
                    <p className="text-xs text-indigo-100 mb-3 leading-relaxed">{node.description}</p>
                    
                    {isUnlocked ? (
                      <button
                        onClick={onStartModule}
                        className="w-full rounded-xl bg-white py-2 font-black text-xs text-indigo-900 uppercase tracking-wider shadow-md transition hover:bg-slate-100 active:scale-95 cursor-pointer"
                      >
                        COMEÇAR
                      </button>
                    ) : (
                      <span className="inline-block text-xs font-bold text-indigo-200/80 bg-indigo-800/50 px-3 py-1 rounded-lg">
                        🔒 Bloqueado
                      </span>
                    )}

                    {/* Seta do Pop-up apontando para baixo */}
                    <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 border-x-8 border-x-transparent border-t-8 border-t-indigo-600"></div>
                  </div>
                )}

                {/* BOTÃO DO NÓ (NÍVEL) COM ANIMAÇÃO DE JUMP NO HOVER */}
                <div className="module-jump-hover">
                  <button
                    onClick={isUnlocked ? onStartModule : undefined}
                    className={`group relative flex h-20 w-20 items-center justify-center rounded-full border-4 transition-all duration-300 active:scale-95 ${
                      isUnlocked
                        ? 'border-cyan-400 bg-sky-500 text-white shadow-lg shadow-sky-500/40 hover:bg-sky-400 cursor-pointer'
                        : 'border-slate-800 bg-slate-900 text-slate-600 cursor-not-allowed hover:border-slate-700'
                    }`}
                  >
                    {/* Anel de destaque em volta do nó ativo */}
                    {isUnlocked && (
                      <span className="absolute -inset-2 rounded-full border-2 border-dashed border-cyan-400/60 animate-spin-slow"></span>
                    )}

                    {/* Ícone interno */}
                    <span className={`text-2xl transition duration-300 ${isUnlocked ? 'group-hover:scale-125' : 'opacity-40'}`}>
                      {node.icon}
                    </span>
                  </button>
                </div>

              </div>
            );
          })}

        </div>

      </main>
    </div>
  );
}
