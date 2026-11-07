import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { db } from '../services/firebase';
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore';

export default function RankingScreen({ onBack }) {
  const { user, userData } = useAuth();
  const [ranking, setRanking] = useState([]);
  const [loadingRanking, setLoadingRanking] = useState(true);

  // Buscar o ranking de usuários do Firestore ao carregar a tela
  useEffect(() => {
    async function fetchRanking() {
      try {
        const q = query(collection(db, 'users'), orderBy('xp', 'desc'), limit(25));
        const querySnapshot = await getDocs(q);
        
        const rankList = [];
        querySnapshot.forEach((docSnap) => {
          rankList.push({ id: docSnap.id, ...docSnap.data() });
        });
        
        setRanking(rankList);
      } catch (error) {
        console.error("Erro ao carregar o ranking:", error);
      } finally {
        setLoadingRanking(false);
      }
    }

    fetchRanking();
  }, []);

  const currentUserRankIndex = ranking.findIndex((student) => student.id === user?.uid);
  const currentUserRank = currentUserRankIndex !== -1 ? currentUserRankIndex + 1 : null;

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
        <div className="flex items-center gap-2">
          <span className="text-xl">🏆</span>
          <h1 className="text-xl font-black text-amber-400 tracking-tight">Ranking de Estudantes</h1>
        </div>
        <div className="w-24 hidden sm:block"></div> {/* Espaçador para centralizar título */}
      </header>

      {/* Conteúdo Principal */}
      <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col px-4 sm:px-6 py-8 sm:py-10 space-y-8">
        
        {/* Banner de Apresentação / Posição do Usuário */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-amber-950/40 via-slate-900 to-indigo-950/30 p-6 sm:p-8 border border-amber-500/20 shadow-2xl">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="space-y-2 text-center sm:text-left">
              <div className="inline-block rounded-full bg-amber-500/10 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-amber-400 border border-amber-500/20">
                Plataforma NorthLibras
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                Tabela de Classificação
              </h2>
              <p className="text-sm text-slate-400 max-w-md">
                Pratique sinais, conclua módulos e acumule XP para subir posições no ranking geral.
              </p>
            </div>

            {/* Cartão de status do próprio usuário */}
            <div className="flex items-center gap-4 bg-slate-900/90 px-6 py-4 rounded-2xl border border-slate-800 shadow-lg">
              <div className="text-center">
                <span className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider">Sua Posição</span>
                <span className="text-2xl font-black text-indigo-400">
                  {currentUserRank ? `#${currentUserRank}` : '—'}
                </span>
              </div>
              <div className="h-8 w-px bg-slate-800"></div>
              <div className="text-center">
                <span className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider">Seu XP</span>
                <span className="text-2xl font-black text-amber-400">
                  ⚡ {userData?.xp || 0}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* PODIUM TOP 3 (quando houver estudantes suficientes) */}
        {!loadingRanking && ranking.length >= 3 && (
          <div className="grid grid-cols-3 gap-3 sm:gap-6 pt-6 pb-2 items-end">
            {/* 2º Lugar */}
            <div className="flex flex-col items-center p-4 rounded-2xl bg-slate-900/70 border border-slate-700/60 shadow-lg order-1 text-center">
              <div className="relative mb-2">
                <div className="h-14 w-14 sm:h-16 sm:w-16 rounded-2xl bg-slate-800 border-2 border-slate-400/50 flex items-center justify-center overflow-hidden text-2xl">
                  {ranking[1].photoURL ? (
                    <img src={ranking[1].photoURL} alt={ranking[1].name} className="h-full w-full object-cover" referrerPolicy="no-referrer" />
                  ) : (
                    '🥈'
                  )}
                </div>
                <span className="absolute -bottom-2 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-slate-300 text-slate-950 font-black text-xs shadow">
                  2
                </span>
              </div>
              <h4 className="font-bold text-white text-xs sm:text-sm truncate w-full mt-1">
                {ranking[1].name}
              </h4>
              <span className="text-[11px] font-extrabold text-amber-400 mt-0.5">
                ⚡ {ranking[1].xp || 0} XP
              </span>
            </div>

            {/* 1º Lugar */}
            <div className="flex flex-col items-center p-5 sm:p-6 rounded-3xl bg-gradient-to-b from-amber-500/20 via-slate-900 to-slate-900 border-2 border-amber-500/50 shadow-xl shadow-amber-500/10 order-2 text-center -translate-y-2">
              <div className="text-2xl mb-1">👑</div>
              <div className="relative mb-2">
                <div className="h-16 w-16 sm:h-20 sm:w-20 rounded-2xl bg-amber-500/20 border-2 border-amber-400 flex items-center justify-center overflow-hidden text-3xl shadow-inner">
                  {ranking[0].photoURL ? (
                    <img src={ranking[0].photoURL} alt={ranking[0].name} className="h-full w-full object-cover" referrerPolicy="no-referrer" />
                  ) : (
                    '🥇'
                  )}
                </div>
                <span className="absolute -bottom-2 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-amber-400 text-amber-950 font-black text-xs shadow">
                  1
                </span>
              </div>
              <h4 className="font-black text-white text-sm sm:text-base truncate w-full mt-1">
                {ranking[0].name}
              </h4>
              <span className="text-xs sm:text-sm font-black text-amber-400 mt-0.5">
                ⚡ {ranking[0].xp || 0} XP
              </span>
            </div>

            {/* 3º Lugar */}
            <div className="flex flex-col items-center p-4 rounded-2xl bg-slate-900/70 border border-amber-700/50 shadow-lg order-3 text-center">
              <div className="relative mb-2">
                <div className="h-14 w-14 sm:h-16 sm:w-16 rounded-2xl bg-slate-800 border-2 border-amber-600/50 flex items-center justify-center overflow-hidden text-2xl">
                  {ranking[2].photoURL ? (
                    <img src={ranking[2].photoURL} alt={ranking[2].name} className="h-full w-full object-cover" referrerPolicy="no-referrer" />
                  ) : (
                    '🥉'
                  )}
                </div>
                <span className="absolute -bottom-2 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-amber-600 text-white font-black text-xs shadow">
                  3
                </span>
              </div>
              <h4 className="font-bold text-white text-xs sm:text-sm truncate w-full mt-1">
                {ranking[2].name}
              </h4>
              <span className="text-[11px] font-extrabold text-amber-400 mt-0.5">
                ⚡ {ranking[2].xp || 0} XP
              </span>
            </div>
          </div>
        )}

        {/* LISTAGEM GERAL DO RANKING */}
        <div className="space-y-4">
          <div className="flex items-center justify-between px-2">
            <h3 className="text-lg font-black text-white flex items-center gap-2">
              <span>📋</span> Lista Geral
            </h3>
            <span className="text-xs font-bold text-slate-400">Classificação por XP</span>
          </div>

          <div className="overflow-hidden rounded-3xl bg-slate-900/60 border border-slate-800 shadow-xl backdrop-blur-md">
            {loadingRanking ? (
              <div className="p-12 text-center text-slate-400 font-medium">
                Carregando ranking em tempo real...
              </div>
            ) : ranking.length === 0 ? (
              <div className="p-12 text-center text-slate-400 font-medium">
                Nenhum estudante encontrado no ranking ainda.
              </div>
            ) : (
              <div className="divide-y divide-slate-800/60">
                {ranking.map((student, index) => {
                  const isCurrentStudent = student.id === user?.uid;
                  
                  // Medalhas / Estilo de posição
                  let badgeStyle = "bg-slate-800 text-slate-400 border-slate-700";
                  if (index === 0) badgeStyle = "bg-amber-500/20 text-amber-400 border-amber-500/40 font-black";
                  if (index === 1) badgeStyle = "bg-slate-300/20 text-slate-200 border-slate-400/40 font-black";
                  if (index === 2) badgeStyle = "bg-amber-700/20 text-amber-500 border-amber-700/40 font-black";

                  return (
                    <div 
                      key={student.id} 
                      className={`flex items-center justify-between px-4 sm:px-6 py-4 transition-colors ${
                        isCurrentStudent ? 'bg-indigo-600/10 border-l-4 border-l-indigo-500' : 'hover:bg-slate-800/30'
                      }`}
                    >
                      <div className="flex items-center gap-3 sm:gap-4">
                        {/* Posição */}
                        <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-sm border ${badgeStyle}`}>
                          #{index + 1}
                        </div>

                        {/* Avatar do Estudante */}
                        <div className="h-10 w-10 shrink-0 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center overflow-hidden text-lg">
                          {student.photoURL ? (
                            <img
                              src={student.photoURL}
                              alt={student.name || 'Estudante'}
                              className="h-full w-full object-cover"
                              referrerPolicy="no-referrer"
                            />
                          ) : (
                            '🤖'
                          )}
                        </div>
                        
                        <div>
                          <h4 className="font-bold text-white text-sm sm:text-base flex items-center gap-2">
                            {student.name}
                            {isCurrentStudent && (
                              <span className="rounded-md bg-indigo-500/20 px-2 py-0.5 text-[10px] font-extrabold text-indigo-300 border border-indigo-500/30">
                                Você
                              </span>
                            )}
                          </h4>
                          <span className="text-xs text-slate-400">Nível {student.level || 1}</span>
                        </div>
                      </div>

                      {/* XP do Aluno */}
                      <div className="flex items-center gap-1.5 font-black text-amber-400 text-sm sm:text-base">
                        <span>⚡</span>
                        <span>{student.xp || 0} XP</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

      </main>
    </div>
  );
}
