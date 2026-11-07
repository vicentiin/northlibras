// src/data/moduleData.js
export const moduleData = {
  id: "cumprimentos",
  title: "Módulo 1: Cumprimentos",
  description: "Aprenda os 5 cumprimentos fundamentais em LIBRAS.",
  signals: [
    {
      id: "oi_tchau",
      name: "Oi / Tchau",
      modelPath: "/models/oi_tchau.glb", 
      options: ["Oi / Tchau", "Bom dia", "Por favor", "Obrigado"],
      correctAnswer: "Oi / Tchau"
    },
    {
      id: "ola",
      name: "Olá",
      modelPath: "/models/ola.glb",
      options: ["Boa noite", "Olá", "Tudo bem", "Até logo"],
      correctAnswer: "Olá"
    },
    {
      id: "bom_dia",
      name: "Bom dia",
      modelPath: "/models/bom_dia.glb",
      options: ["Boa tarde", "Bom dia", "Com licença", "Oi / Tchau"],
      correctAnswer: "Bom dia"
    },
    {
      id: "boa_tarde",
      name: "Boa tarde",
      modelPath: "/models/boa_tarde.glb",
      options: ["Boa noite", "Bom dia", "Boa tarde", "Desculpa"],
      correctAnswer: "Boa tarde"
    },
    {
      id: "boa_noite",
      name: "Boa noite",
      modelPath: "/models/boa_noite.glb",
      options: ["Boa noite", "Olá", "Tudo bem", "Boa tarde"],
      correctAnswer: "Boa noite"
    }
  ]
};