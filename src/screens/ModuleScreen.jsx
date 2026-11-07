import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { moduleData } from '../data/moduledata_temp';
import RobotViewer from '../components/RobotViewer';
import { computeNextStreak } from '../utils/streak';

const signals = moduleData.signals;
const totalSignals = signals.length;
// Sequência: N demos (índices 0..N-1) + N quizzes (índices N..2N-1) + conclusão
const TOTAL_STEPS = totalSignals * 2;

export default function ModuleScreen({ onBack }) {
  const { userData, completeLesson } = useAuth();

  const [step, setStep] = useState(0);           // 0..totalSignals-1 = demo; totalSignals..TOTAL_STEPS-1 = quiz
  const [completed, setCompleted] = useState(false);
  const [completionStage, setCompletionStage] = useState(null); // 'streak' | 'xp'
  const [streakResult, setStreakResult] = useState(null);
  const [flameLit, setFlameLit] = useState(false);
  const [displayStreak, setDisplayStreak] = useState(0);

  const [selectedOption, setSelectedOption] = useState(null);
  const [isAnswerCorrect, setIsAnswerCorrect] = useState(null);
  const [score, setScore] = useState(0);
  const [xpAwarded, setXpAwarded] = useState(false);
  const [animKey, setAnimKey] = useState(0);

  // Controles de animação do robô
  const [isPaused, setIsPaused] = useState(false);
  const [repeatKey, setRepeatKey] = useState(0);

  const handleTogglePause = () => setIsPaused((p) => !p);
  const handleRepeat = () => {
    setIsPaused(false);
    setRepeatKey((k) => k + 1);
  };

  const isDemo = step < totalSignals;
  const signalIndex = isDemo ? step : step - totalSignals;
  const currentSignal = signals[signalIndex];
  const progress = Math.round((step / TOTAL_STEPS) * 100);

  const advance = () => {
    // Retoma animação ao avançar
    setIsPaused(false);
    setRepeatKey((k) => k + 1);

    const next = step + 1;
    if (next >= TOTAL_STEPS) {
      setCompleted(true);

      if (!xpAwarded) {
        setXpAwarded(true);

        // Previsão do cálculo da ofensiva
        const nextStreakData = computeNextStreak(userData);
        setStreakResult(nextStreakData);

        // Salva a lição concluída, ofensiva e pontos de XP no Firebase
        completeLesson(50).catch(console.error);

        // Se for a primeira lição do dia, exibe a animação do foguinho acendendo.
        // Se já tiver recebido a ofensiva hoje, não exibe a animação e vai direto para a tela de XP.
        if (nextStreakData.isNewDay) {
          setCompletionStage('streak');
          setDisplayStreak(nextStreakData.previousStreak);

          // Disparo da animação: acendimento do fogo e contabilização do dia
          setTimeout(() => {
            setFlameLit(true);
            setTimeout(() => {
              setDisplayStreak(nextStreakData.newStreak);
            }, 350);
          }, 400);
        } else {
          setCompletionStage('xp');
        }
      }
    } else {
      setStep(next);
      setAnimKey((k) => k + 1);
    }
  };

  // Demo: clicou no botão do nome do sinal → avança
  const handleDemoNext = () => {
    advance();
  };

  // Quiz: clicou numa opção → feedback breve → avança
  const handleAnswerSubmit = (option) => {
    if (selectedOption !== null) return;
    const correct = option === currentSignal.correctAnswer;
    setSelectedOption(option);
    setIsAnswerCorrect(correct);
    if (correct) setScore((prev) => prev + 1);

    setTimeout(() => {
      setSelectedOption(null);
      setIsAnswerCorrect(null);
      advance();
    }, 900);
  };

  /* ── 1ª Etapa: Animação de Ofensiva (Fogo acendendo e contabilização do dia) ── */
  if (completed && completionStage === 'streak') {
    const currentDayOfWeek = new Date().getDay();

    return (
      <div style={s.root}>
        <Header onBack={onBack} progress={100} label="Ofensiva" />
        <main style={{ ...s.center, gap: 22, animation: 'popIn 0.5s ease', textAlign: 'center', position: 'relative' }}>
          
          {/* Brilho radial de fundo quente */}
          <div style={{
            position: 'absolute',
            width: 380,
            height: 380,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(249,115,22,0.2) 0%, transparent 70%)',
            pointerEvents: 'none',
          }} />

          {/* Área do Fogo com Shockwave */}
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', width: 140, height: 140 }}>
            {flameLit && (
              <div 
                className="animate-fire-ring"
                style={{
                  position: 'absolute',
                  width: 130,
                  height: 130,
                  borderRadius: '50%',
                  border: '3px solid rgba(251,146,60,0.85)',
                  boxShadow: '0 0 25px rgba(249,115,22,0.6)',
                  pointerEvents: 'none',
                }}
              />
            )}

            <div 
              className={flameLit ? "animate-flame-burn" : "animate-flame-ignite"}
              style={{
                fontSize: '5.5rem',
                userSelect: 'none',
                filter: flameLit 
                  ? 'drop-shadow(0 0 35px rgba(249,115,22,0.95)) drop-shadow(0 0 15px rgba(251,191,36,0.9))' 
                  : 'grayscale(1) opacity(0.35)',
                transition: 'filter 0.5s ease',
              }}
            >
              🔥
            </div>
          </div>

          {/* Título e Contabilização do Dia */}
          <div style={{ maxWidth: 420 }}>
            <div style={{
              display: 'inline-block',
              borderRadius: 99,
              background: 'rgba(249,115,22,0.15)',
              padding: '6px 18px',
              fontSize: '0.8rem',
              fontWeight: 800,
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              color: '#fb923c',
              border: '1px solid rgba(249,115,22,0.3)',
              marginBottom: 10,
            }}>
              🔥 Fogo Acendido!
            </div>

            <h2 style={{
              margin: '0 0 6px 0',
              fontSize: '2.5rem',
              fontWeight: 900,
              background: 'linear-gradient(135deg, #fff, #fb923c)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}>
              <span className={flameLit ? "animate-count-bump" : ""} style={{ display: 'inline-block' }}>
                {displayStreak}
              </span> {displayStreak === 1 ? 'Dia de Ofensiva!' : 'Dias de Ofensiva!'}
            </h2>

            <p style={{ margin: 0, color: '#94a3b8', fontSize: '0.95rem', lineHeight: 1.5 }}>
              Você praticou hoje e avançou sua ofensiva! Mantenha a chama acesa amanhã.
            </p>
          </div>

          {/* Indicador de Dias da Semana */}
          <div style={{
            display: 'flex',
            gap: 8,
            background: 'rgba(15,23,42,0.85)',
            padding: '12px 18px',
            borderRadius: 20,
            border: '1px solid rgba(249,115,22,0.25)',
            boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
          }}>
            {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map((dayName, idx) => {
              const isToday = idx === currentDayOfWeek;
              return (
                <div key={idx} style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 6,
                  padding: '6px 10px',
                  borderRadius: 12,
                  background: isToday ? 'rgba(249,115,22,0.25)' : 'rgba(30,41,59,0.5)',
                  border: isToday ? '1px solid rgba(249,115,22,0.6)' : '1px solid transparent',
                  boxShadow: isToday ? '0 0 14px rgba(249,115,22,0.35)' : 'none',
                }}>
                  <span style={{ fontSize: '0.72rem', fontWeight: 700, color: isToday ? '#fb923c' : '#64748b' }}>
                    {dayName}
                  </span>
                  <span style={{ fontSize: '1.05rem' }}>
                    {isToday ? '🔥' : '•'}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Botão para Avançar para a Tela de XP */}
          <div style={{ width: '100%', maxWidth: 360, marginTop: 8 }}>
            <button
              onClick={() => setCompletionStage('xp')}
              style={{
                width: '100%',
                padding: '16px 24px',
                borderRadius: 16,
                border: 'none',
                background: 'linear-gradient(135deg, #f97316, #ea580c)',
                color: '#fff',
                fontSize: '1.05rem',
                fontWeight: 800,
                cursor: 'pointer',
                boxShadow: '0 8px 32px rgba(234,88,12,0.4)',
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
              }}
              onMouseEnter={e => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 12px 36px rgba(234,88,12,0.55)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 8px 32px rgba(234,88,12,0.4)';
              }}
            >
              <span>Ver Recompensa de XP</span>
              <span>→</span>
            </button>
          </div>

        </main>
        <Keyframes />
      </div>
    );
  }

  /* ── 2ª Etapa: Tela de Pontos de XP e Conclusão ── */
  if (completed) {
    return (
      <div style={s.root}>
        <Header onBack={onBack} progress={100} label="Concluído" />
        <main style={{ ...s.center, gap: 28, animation: 'popIn 0.5s ease' }}>
          <div style={s.trophy}>🏆</div>
          <div style={{ textAlign: 'center' }}>
            <h2 style={s.completedTitle}>Módulo Concluído!</h2>
            <p style={{ margin: 0, color: '#94a3b8' }}>
              Você acertou{' '}
              <span style={{ color: '#a5b4fc', fontWeight: 700 }}>{score}</span>
              {' '}de {totalSignals} perguntas.
            </p>
          </div>
          <div style={s.xpBadge}>+50 XP adicionados ao seu perfil!</div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, width: '100%', maxWidth: 360 }}>
            {/* Botão de Redirecionamento para o Formulário */}
            <a
              href="https://docs.google.com/forms/d/e/1FAIpQLSf6G7aiUaYlDtpIlFqn04_-KtD87tjjqaLcY2TZH274L-strg/viewform?usp=publish-editor"
              target="_blank"
              rel="noopener noreferrer"
              style={s.formBtn}
              onMouseEnter={e => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 12px 36px rgba(16, 185, 129, 0.45)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 8px 32px rgba(16, 185, 129, 0.3)';
              }}
            >
              <span>📋</span>
              <span>Responder Formulário</span>
              <span style={{ fontSize: '0.9rem', opacity: 0.9 }}>↗</span>
            </a>

            <button
              style={s.primaryBtn}
              onClick={onBack}
              onMouseEnter={e => (e.currentTarget.style.transform = 'translateY(-2px)')}
              onMouseLeave={e => (e.currentTarget.style.transform = 'translateY(0)')}
            >
              Voltar ao Menu Principal
            </button>
          </div>
        </main>
        <Keyframes />
      </div>
    );
  }

  /* ── Tela Principal ── */
  return (
    <div style={s.root}>
      <Header
        onBack={onBack}
        progress={progress}
        label={isDemo
          ? `Aprendendo ${signalIndex + 1}/${totalSignals}`
          : `Quiz ${signalIndex + 1}/${totalSignals}`}
      />

      <main style={s.twoCol}>

        {/* ── ESQUERDA: Robô ── */}
        <div style={s.leftPanel}>
          <div style={s.glow} />

          <div style={{ width: '100%', height: '100%' }}>
            <RobotViewer
              modelPath={currentSignal.modelPath}
              paused={isPaused}
              repeatKey={repeatKey}
            />
          </div>

          {/* ── Controles de animação ── */}
          <div style={{
            position: 'absolute',
            bottom: 70,
            left: '50%',
            transform: 'translateX(-50%)',
            display: 'flex',
            gap: 10,
            zIndex: 5,
          }}>
            {/* Botão Pausa / Play */}
            <button
              onClick={handleTogglePause}
              title={isPaused ? 'Retomar animação' : 'Pausar animação'}
              style={{
                ...s.ctrlBtn,
                background: isPaused ? '#06b6d4' : '#1e3a4d',
                border: isPaused ? '2px solid #22d3ee' : '2px solid #164e63',
                boxShadow: isPaused ? '0 4px 0 #0e7490' : '0 4px 0 #0f2d3d',
              }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; }}
              onMouseDown={e  => { e.currentTarget.style.transform = 'translateY(3px)'; e.currentTarget.style.boxShadow = '0 1px 0 #0e7490'; }}
              onMouseUp={e    => { e.currentTarget.style.transform = 'translateY(0)';  e.currentTarget.style.boxShadow = isPaused ? '0 4px 0 #0e7490' : '0 4px 0 #0f2d3d'; }}
            >
              {isPaused ? '▶' : '⏸'}
            </button>

            {/* Botão Repetir */}
            <button
              onClick={handleRepeat}
              title="Repetir animação do início"
              style={{
                ...s.ctrlBtn,
                background: '#1e3a4d',
                border: '2px solid #164e63',
                boxShadow: '0 4px 0 #0f2d3d',
              }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; }}
              onMouseDown={e  => { e.currentTarget.style.transform = 'translateY(3px)'; e.currentTarget.style.boxShadow = '0 1px 0 #0f2d3d'; }}
              onMouseUp={e    => { e.currentTarget.style.transform = 'translateY(0)';  e.currentTarget.style.boxShadow = '0 4px 0 #0f2d3d'; }}
            >
              🔁
            </button>
          </div>

          {/* Tag de fase */}
          <div style={{
            ...s.phaseTag,
            background: isDemo
              ? 'rgba(99,102,241,0.18)'
              : 'rgba(34,211,238,0.12)',
            border: isDemo
              ? '1px solid rgba(99,102,241,0.35)'
              : '1px solid rgba(34,211,238,0.35)',
            color: isDemo ? '#a5b4fc' : '#67e8f9',
          }}>
            {isDemo ? '📖 Aprenda' : '🎯 Quiz'}
          </div>

          <div style={s.robotLabel}>Robô LIBRAS</div>
        </div>

        {/* ── DIREITA: Interação ── */}
        <div style={s.rightPanel} key={animKey}>

          {/* ─── DEMO: botão único com o nome do sinal ─── */}
          {isDemo && (
            <div style={s.demoWrapper}>
              <p style={s.demoHint}>Observe o gesto e aprenda o sinal:</p>

              <button
                onClick={handleDemoNext}
                style={s.demoBtn}
                onMouseEnter={e => {
                  e.currentTarget.style.transform = 'translateX(6px) scale(1.02)';
                  e.currentTarget.style.boxShadow = '0 12px 48px rgba(99,102,241,0.55)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.transform = 'translateX(0) scale(1)';
                  e.currentTarget.style.boxShadow = '0 8px 32px rgba(99,102,241,0.35)';
                }}
              >
                <span style={s.demoBtnIcon}>👋</span>
                <span style={s.demoBtnLabel}>{currentSignal.name}</span>
                <span style={s.demoBtnArrow}>→</span>
              </button>

              <p style={s.demoCaption}>
                Clique para continuar ao próximo sinal
              </p>
            </div>
          )}

          {/* ─── QUIZ: múltipla escolha ─── */}
          {!isDemo && (
            <div style={s.quizWrapper}>
              <p style={s.questionLabel}>O que este sinal significa?</p>

              {selectedOption !== null && (
                <div style={{
                  ...s.feedback,
                  background: isAnswerCorrect ? 'rgba(16,185,129,0.18)' : 'rgba(239,68,68,0.18)',
                  border: `1px solid ${isAnswerCorrect ? 'rgba(16,185,129,0.5)' : 'rgba(239,68,68,0.5)'}`,
                  color: isAnswerCorrect ? '#6ee7b7' : '#fca5a5',
                }}>
                  {isAnswerCorrect ? '🎉 Correto!' : `❌ Era: ${currentSignal.correctAnswer}`}
                </div>
              )}

              <div style={s.optionsGrid}>
                {currentSignal.options.map((option, idx) => {
                  let bg = 'rgba(30,41,59,0.85)';
                  let border = '1px solid rgba(99,102,241,0.25)';
                  let color = '#e2e8f0';
                  let opacity = 1;
                  let boxShadow = 'none';

                  if (selectedOption !== null) {
                    if (option === currentSignal.correctAnswer) {
                      bg = 'rgba(16,185,129,0.2)'; border = '1px solid rgba(16,185,129,0.6)';
                      color = '#6ee7b7'; boxShadow = '0 4px 20px rgba(16,185,129,0.2)';
                    } else if (option === selectedOption) {
                      bg = 'rgba(239,68,68,0.2)'; border = '1px solid rgba(239,68,68,0.5)';
                      color = '#fca5a5';
                    } else {
                      opacity = 0.35;
                    }
                  }

                  return (
                    <button
                      key={idx}
                      onClick={() => handleAnswerSubmit(option)}
                      disabled={selectedOption !== null}
                      style={{
                        ...s.optionBtn,
                        background: bg, border, color, opacity, boxShadow,
                        animationDelay: `${idx * 0.08}s`,
                        cursor: selectedOption !== null ? 'not-allowed' : 'pointer',
                      }}
                      onMouseEnter={e => {
                        if (selectedOption === null) {
                          e.currentTarget.style.background = 'rgba(99,102,241,0.22)';
                          e.currentTarget.style.border = '1px solid rgba(99,102,241,0.7)';
                          e.currentTarget.style.transform = 'translateX(6px) scale(1.01)';
                          e.currentTarget.style.boxShadow = '0 6px 28px rgba(99,102,241,0.25)';
                        }
                      }}
                      onMouseLeave={e => {
                        if (selectedOption === null) {
                          e.currentTarget.style.background = 'rgba(30,41,59,0.85)';
                          e.currentTarget.style.border = '1px solid rgba(99,102,241,0.25)';
                          e.currentTarget.style.transform = 'translateX(0) scale(1)';
                          e.currentTarget.style.boxShadow = 'none';
                        }
                      }}
                    >
                      <span style={s.optionLetter}>{String.fromCharCode(65 + idx)}</span>
                      {option}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </main>

      <Keyframes />
    </div>
  );
}

/* ─── Componentes auxiliares ─── */

function Header({ onBack, progress, label }) {
  return (
    <header style={s.header}>
      <button
        style={s.backBtn}
        onClick={onBack}
        onMouseEnter={e => { e.target.style.background = 'rgba(99,102,241,0.3)'; e.target.style.color = '#fff'; }}
        onMouseLeave={e => { e.target.style.background = 'rgba(99,102,241,0.15)'; e.target.style.color = '#a5b4fc'; }}
      >
        ← Voltar
      </button>

      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
        <h1 style={s.headerTitle}>{moduleData.title}</h1>
        <div style={s.progressBar}>
          <div style={{ ...s.progressFill, width: `${progress}%` }} />
        </div>
      </div>

      <span style={s.headerLabel}>{label}</span>
    </header>
  );
}

function Keyframes() {
  return (
    <style>{`
      @keyframes slideInRight {
        from { opacity: 0; transform: translateX(28px); }
        to   { opacity: 1; transform: translateX(0); }
      }
      @keyframes slideInOption {
        from { opacity: 0; transform: translateX(20px); }
        to   { opacity: 1; transform: translateX(0); }
      }
      @keyframes popIn {
        from { opacity: 0; transform: scale(0.7); }
        to   { opacity: 1; transform: scale(1); }
      }
      @keyframes feedbackIn {
        from { opacity: 0; transform: translateY(-8px); }
        to   { opacity: 1; transform: translateY(0); }
      }
    `}</style>
  );
}

/* ─── Estilos ─── */
const s = {
  root: {
    display: 'flex', flexDirection: 'column', minHeight: '100vh',
    background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 60%, #0f172a 100%)',
    color: 'white', fontFamily: "'Inter', sans-serif",
  },
  header: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '12px 28px', borderBottom: '1px solid rgba(99,102,241,0.2)',
    background: 'rgba(15,23,42,0.85)', backdropFilter: 'blur(12px)',
    position: 'sticky', top: 0, zIndex: 10,
  },
  headerTitle: { margin: 0, fontSize: '0.95rem', fontWeight: 700, color: '#a5b4fc' },
  headerLabel: {
    fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.1em',
    textTransform: 'uppercase', color: '#475569', minWidth: 120, textAlign: 'right',
  },
  progressBar: {
    width: 200, height: 5, background: 'rgba(255,255,255,0.08)',
    borderRadius: 99, overflow: 'hidden',
  },
  progressFill: {
    height: '100%', background: 'linear-gradient(90deg, #6366f1, #22d3ee)',
    borderRadius: 99, transition: 'width 0.6s ease',
  },
  backBtn: {
    background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.3)',
    borderRadius: 10, padding: '8px 18px', color: '#a5b4fc', fontSize: '0.85rem',
    fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s', minWidth: 80,
  },
  twoCol: { flex: 1, display: 'flex', flexDirection: 'row', overflow: 'hidden' },
  leftPanel: {
    width: '48%', minWidth: 300, position: 'relative',
    background: 'linear-gradient(180deg, rgba(99,102,241,0.04) 0%, rgba(34,211,238,0.02) 100%)',
    borderRight: '1px solid rgba(99,102,241,0.12)',
    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
  },
  glow: {
    position: 'absolute', width: 340, height: 340, borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(99,102,241,0.12) 0%, transparent 70%)',
    pointerEvents: 'none',
  },
  phaseTag: {
    position: 'absolute', bottom: 24, left: '50%', transform: 'translateX(-50%)',
    borderRadius: 12, padding: '8px 22px', fontSize: '0.85rem', fontWeight: 700,
    whiteSpace: 'nowrap', letterSpacing: '0.04em',
  },
  robotLabel: {
    position: 'absolute', top: 16, left: 16,
    background: 'rgba(99,102,241,0.18)', border: '1px solid rgba(99,102,241,0.3)',
    borderRadius: 8, padding: '4px 12px', fontSize: '0.68rem', fontWeight: 700,
    color: '#a5b4fc', letterSpacing: '0.1em', textTransform: 'uppercase',
  },
  rightPanel: {
    flex: 1, display: 'flex', flexDirection: 'column',
    alignItems: 'center', justifyContent: 'center',
    padding: '40px 48px', gap: 0,
    animation: 'slideInRight 0.35s ease',
  },

  /* Demo */
  demoWrapper: {
    width: '100%', maxWidth: 400,
    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20,
  },
  demoHint: {
    margin: 0, fontSize: '0.85rem', fontWeight: 600, color: '#64748b',
    textTransform: 'uppercase', letterSpacing: '0.1em', textAlign: 'center',
  },
  demoBtn: {
    width: '100%', padding: '24px 28px', borderRadius: 18,
    border: '2px solid rgba(99,102,241,0.5)',
    background: 'linear-gradient(135deg, rgba(99,102,241,0.25), rgba(79,70,229,0.18))',
    color: '#fff', display: 'flex', alignItems: 'center', gap: 16,
    cursor: 'pointer', transition: 'all 0.2s ease',
    boxShadow: '0 8px 32px rgba(99,102,241,0.35)',
    animation: 'slideInRight 0.4s cubic-bezier(0.34,1.56,0.64,1)',
  },
  demoBtnIcon: { fontSize: '2rem', flexShrink: 0 },
  demoBtnLabel: { flex: 1, fontSize: '1.6rem', fontWeight: 900, textAlign: 'left' },
  demoBtnArrow: {
    fontSize: '1.4rem', color: '#a5b4fc', flexShrink: 0,
    transition: 'transform 0.2s',
  },
  demoCaption: {
    margin: 0, fontSize: '0.78rem', color: '#475569', textAlign: 'center',
  },

  /* Quiz */
  quizWrapper: {
    width: '100%', maxWidth: 440,
    display: 'flex', flexDirection: 'column', gap: 14,
  },
  questionLabel: {
    margin: '0 0 4px 0', fontSize: '1.25rem', fontWeight: 800,
    color: '#f1f5f9', textAlign: 'center',
  },
  feedback: {
    padding: '10px 18px', borderRadius: 12, textAlign: 'center',
    fontWeight: 700, fontSize: '0.95rem',
    animation: 'feedbackIn 0.25s ease',
  },
  optionsGrid: { display: 'flex', flexDirection: 'column', gap: 11 },
  optionBtn: {
    padding: '18px 22px', borderRadius: 13, fontSize: '1rem', fontWeight: 700,
    textAlign: 'left', display: 'flex', alignItems: 'center', gap: 14,
    cursor: 'pointer',
    transition: 'all 0.18s ease',
    animation: 'slideInOption 0.35s ease both',
  },
  optionLetter: {
    width: 34, height: 34, borderRadius: 9,
    background: 'rgba(99,102,241,0.18)', border: '1px solid rgba(99,102,241,0.35)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: '0.85rem', fontWeight: 800, color: '#a5b4fc', flexShrink: 0,
  },

  /* Conclusão */
  center: {
    flex: 1, display: 'flex', flexDirection: 'column',
    alignItems: 'center', justifyContent: 'center', padding: 40,
  },
  trophy: {
    width: 100, height: 100, borderRadius: 28,
    background: 'rgba(245,158,11,0.15)', border: '2px solid rgba(245,158,11,0.4)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: '3rem', boxShadow: '0 0 60px rgba(245,158,11,0.2)',
  },
  completedTitle: {
    margin: '0 0 8px 0', fontSize: '2rem', fontWeight: 900,
    background: 'linear-gradient(135deg, #fff, #fbbf24)',
    WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
  },
  xpBadge: {
    padding: '14px 32px', borderRadius: 16,
    background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.3)',
    color: '#a5b4fc', fontWeight: 800, fontSize: '1rem',
    boxShadow: '0 4px 24px rgba(99,102,241,0.2)',
  },
  primaryBtn: {
    width: '100%', padding: '16px 24px', borderRadius: 16, border: 'none',
    background: 'linear-gradient(135deg, #6366f1, #4f46e5)',
    color: '#fff', fontSize: '1rem', fontWeight: 700,
    cursor: 'pointer', boxShadow: '0 8px 32px rgba(99,102,241,0.35)',
    transition: 'all 0.2s', textAlign: 'center', boxSizing: 'border-box',
  },
  formBtn: {
    width: '100%', padding: '16px 24px', borderRadius: 16,
    border: '1px solid rgba(52, 211, 153, 0.4)',
    background: 'linear-gradient(135deg, #059669, #10b981)',
    color: '#fff', fontSize: '1rem', fontWeight: 700,
    textDecoration: 'none', display: 'flex', alignItems: 'center',
    justifyContent: 'center', gap: 10, cursor: 'pointer',
    boxShadow: '0 8px 32px rgba(16, 185, 129, 0.3)',
    transition: 'all 0.2s ease', boxSizing: 'border-box',
  },

  /* Controles de animação */
  ctrlBtn: {
    width: 48, height: 48, borderRadius: 14,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: '1.2rem', cursor: 'pointer',
    transition: 'transform 0.1s ease, box-shadow 0.1s ease',
    color: '#e0f2fe', fontWeight: 700,
  },
};