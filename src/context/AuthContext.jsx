// src/context/AuthContext.jsx
import { createContext, useContext, useEffect, useRef, useState } from 'react';
import { auth, db } from '../services/firebase';
import { 
  GoogleAuthProvider, 
  signInWithPopup, 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut, 
  onAuthStateChanged 
} from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { getLocalDateString, computeNextStreak } from '../utils/streak';

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const isRegisteringEmailRef = useRef(false);

  // 1. Login com Google
  const loginWithGoogle = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const currentUser = result.user;

      const userRef = doc(db, 'users', currentUser.uid);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
        // Primeiro acesso do usuário com o Google:
        // Mantemos userData como null para exibir a tela intermediária de apelido.
        setUserData(null);
      } else {
        setUserData(userSnap.data());
      }
      return { isNewUser: !userSnap.exists(), user: currentUser };
    } catch (error) {
      console.error("Erro ao autenticar com Google:", error);
      throw error;
    }
  };

  // 2. Salvar apelido para primeiro acesso (Google Login)
  const saveNickname = async (nickname) => {
    if (!user) {
      throw new Error("Nenhum usuário autenticado para definir o apelido.");
    }

    try {
      const initialData = {
        uid: user.uid,
        name: nickname.trim(),
        email: user.email || '',
        photoURL: user.photoURL || '',
        xp: 0,
        level: 1,
        streak: 0,
        lastLessonDate: null,
        createdAt: new Date()
      };

      const userRef = doc(db, 'users', user.uid);
      await setDoc(userRef, initialData);
      setUserData(initialData);
      return initialData;
    } catch (error) {
      console.error("Erro ao salvar apelido:", error);
      throw error;
    }
  };

  // 3. Cadastro com E-mail, Senha e Apelido Personalizado
  const registerWithEmail = async (email, password, nickname) => {
    try {
      isRegisteringEmailRef.current = true;
      const result = await createUserWithEmailAndPassword(auth, email, password);
      const currentUser = result.user;

      const initialData = {
        uid: currentUser.uid,
        name: nickname.trim(), // Apelido escolhido pelo usuário
        email: currentUser.email,
        photoURL: '',
        xp: 0,
        level: 1,
        streak: 0,
        lastLessonDate: null,
        createdAt: new Date()
      };

      const userRef = doc(db, 'users', currentUser.uid);
      await setDoc(userRef, initialData);
      setUserData(initialData);
    } catch (error) {
      console.error("Erro no cadastro:", error);
      throw error;
    } finally {
      isRegisteringEmailRef.current = false;
    }
  };

  // 4. Login com E-mail e Senha
  const loginWithEmail = async (email, password) => {
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      const currentUser = result.user;

      const userRef = doc(db, 'users', currentUser.uid);
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        setUserData(userSnap.data());
      } else {
        setUserData(null);
      }
    } catch (error) {
      console.error("Erro no login com e-mail:", error);
      throw error;
    }
  };

  // 5. Sair da Conta
  const logout = async () => {
    try {
      await signOut(auth);
      setUser(null);
      setUserData(null);
    } catch (error) {
      console.error("Erro ao fazer logout:", error);
    }
  };

  // 6. Adicionar XP
  const addXp = async (amount) => {
    if (!user || !userData) return;
    const newXp = (userData.xp || 0) + amount;
    const newLevel = Math.floor(newXp / 100) + 1;

    const userRef = doc(db, 'users', user.uid);
    await updateDoc(userRef, { xp: newXp, level: newLevel });
    setUserData({ ...userData, xp: newXp, level: newLevel });
  };

  // 7. Concluir Lição / Módulo: Atualiza Ofensiva e XP
  const completeLesson = async (xpAmount = 50) => {
    if (!user || !userData) {
      return { newStreak: 1, isNewDay: true, previousStreak: 0, xpEarned: xpAmount };
    }

    const { newStreak, isNewDay, previousStreak } = computeNextStreak(userData);
    const today = getLocalDateString();

    const newXp = (userData.xp || 0) + xpAmount;
    const newLevel = Math.floor(newXp / 100) + 1;

    const userRef = doc(db, 'users', user.uid);
    const updatedFields = {
      xp: newXp,
      level: newLevel,
      streak: newStreak,
      lastLessonDate: today,
    };

    await updateDoc(userRef, updatedFields);
    setUserData((prev) => ({
      ...prev,
      ...updatedFields,
    }));

    return {
      newStreak,
      previousStreak,
      isNewDay,
      xpEarned: xpAmount,
    };
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        if (!isRegisteringEmailRef.current) {
          const userRef = doc(db, 'users', currentUser.uid);
          const userSnap = await getDoc(userRef);
          if (userSnap.exists()) {
            setUserData(userSnap.data());
          } else {
            setUserData(null);
          }
        }
      } else {
        setUserData(null);
      }
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  return (
    <AuthContext.Provider value={{ 
      user, 
      userData, 
      loginWithGoogle, 
      saveNickname,
      registerWithEmail, 
      loginWithEmail, 
      logout, 
      addXp,
      completeLesson, 
      loading 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
