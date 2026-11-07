// src/utils/streak.js

/**
 * Retorna a data no formato YYYY-MM-DD no fuso horário local do usuário.
 */
export const getLocalDateString = (d = new Date()) => {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/**
 * Retorna a data de ontem no formato YYYY-MM-DD no fuso horário local.
 */
export const getYesterdayDateString = () => {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return getLocalDateString(d);
};

/**
 * Calcula a ofensiva ativa para exibição em tela.
 * Se a última lição foi hoje: ofensiva ativa e dia concluído.
 * Se a última lição foi ontem: ofensiva mantida, mas aguarda a lição de hoje.
 * Se a última lição foi anterior a ontem ou nula: ofensiva zerada.
 */
export const calculateActiveStreak = (userData) => {
  if (!userData) return { streak: 0, isCompletedToday: false };

  const today = getLocalDateString();
  const yesterday = getYesterdayDateString();
  const lastDate = userData.lastLessonDate;
  const rawStreak = userData.streak || 0;

  if (lastDate === today) {
    return { 
      streak: Math.max(rawStreak, 1), 
      isCompletedToday: true 
    };
  }

  if (lastDate === yesterday) {
    return { 
      streak: rawStreak, 
      isCompletedToday: false 
    };
  }

  // Mais de um dia sem lição: ofensiva zerada
  return { 
    streak: 0, 
    isCompletedToday: false 
  };
};

/**
 * Calcula o novo valor de ofensiva ao concluir uma lição.
 * Retorna se é um novo dia computado na ofensiva ou se já havia sido feita hoje.
 */
export const computeNextStreak = (userData) => {
  const today = getLocalDateString();
  const yesterday = getYesterdayDateString();
  const lastDate = userData?.lastLessonDate;
  const currentStreak = userData?.streak || 0;

  if (lastDate === today) {
    // Já fez lição hoje: mantém a ofensiva sem somar novamente
    return {
      newStreak: Math.max(currentStreak, 1),
      isNewDay: false,
      previousStreak: Math.max(currentStreak, 1),
    };
  }

  if (lastDate === yesterday) {
    // Dia consecutivo: soma +1 à ofensiva
    return {
      newStreak: currentStreak + 1,
      isNewDay: true,
      previousStreak: currentStreak,
    };
  }

  // Primeiro acesso ou quebrou a sequência anterior: reinicia em 1
  return {
    newStreak: 1,
    isNewDay: true,
    previousStreak: 0,
  };
};

