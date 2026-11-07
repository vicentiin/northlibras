import { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import LoginScreen from './screens/LoginScreen';
import NicknameScreen from './screens/NicknameScreen';
import HomeScreen from './screens/HomeScreen';
import ModuleScreen from './screens/ModuleScreen';
import ProfileScreen from './screens/ProfileScreen';
import RankingScreen from './screens/RankingScreen';

function getScreenFromUrl() {
  const hash = window.location.hash.replace(/^#\/?/, '');
  if (hash === 'module' || hash === 'profile' || hash === 'ranking') {
    return hash;
  }
  return 'home';
}

function MainApp() {
  const { user, userData, loading } = useAuth();
  
  // Controla qual tela está ativa sincronizada com a URL e histórico do navegador
  const [currentScreen, setCurrentScreen] = useState(getScreenFromUrl);

  // Inicializa o estado no histórico do navegador
  useEffect(() => {
    if (!user) return;
    const initialScreen = getScreenFromUrl();
    const targetUrl = initialScreen === 'home' 
      ? window.location.pathname + window.location.search 
      : `#${initialScreen}`;

    if (!window.history.state || window.history.state.screen !== initialScreen) {
      window.history.replaceState({ screen: initialScreen, idx: 0 }, '', targetUrl);
    }
  }, [user]);

  // Escuta os botões de avançar e voltar do navegador
  useEffect(() => {
    const handlePopState = (event) => {
      const screenFromUrl = getScreenFromUrl();
      const targetScreen = event.state?.screen || screenFromUrl;
      setCurrentScreen(targetScreen);
    };

    window.addEventListener('popstate', handlePopState);
    window.addEventListener('hashchange', handlePopState);

    return () => {
      window.removeEventListener('popstate', handlePopState);
      window.removeEventListener('hashchange', handlePopState);
    };
  }, []);

  // Limpa o hash da URL se o usuário deslogar
  useEffect(() => {
    if (!user && window.location.hash) {
      window.history.replaceState(null, '', window.location.pathname);
    }
  }, [user]);

  // Navega para uma nova tela inserindo a entrada correspondente no histórico
  const navigateTo = (screen, replace = false) => {
    if (screen === currentScreen) return;
    const targetUrl = screen === 'home' 
      ? window.location.pathname + window.location.search 
      : `#${screen}`;

    const currentIdx = window.history.state?.idx ?? 0;
    const nextIdx = replace ? currentIdx : currentIdx + 1;

    if (replace) {
      window.history.replaceState({ screen, idx: nextIdx }, '', targetUrl);
    } else {
      window.history.pushState({ screen, idx: nextIdx }, '', targetUrl);
    }
    setCurrentScreen(screen);
  };

  // Botões internos de voltar usam o histórico do navegador quando disponível
  const handleBack = () => {
    const currentIdx = window.history.state?.idx ?? 0;
    if (currentIdx > 0) {
      window.history.back();
    } else {
      navigateTo('home', true);
    }
  };

  // Tela de carregamento enquanto o Firebase verifica a autenticação
  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-950 text-white font-medium">
        Carregando NorthLibras...
      </div>
    );
  }

  // Se o usuário não estiver autenticado, exibe a tela de login rápido
  if (!user) {
    return <LoginScreen />;
  }

  // Se o usuário estiver autenticado mas ainda não possuir apelido/perfil cadastrado (primeiro acesso com Google)
  if (!userData || !userData.name) {
    return <NicknameScreen />;
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-indigo-500 selection:text-white">
      {currentScreen === 'home' && (
        <HomeScreen 
          onStartModule={() => navigateTo('module')} 
          onOpenProfile={() => navigateTo('profile')} 
          onOpenRanking={() => navigateTo('ranking')}
        />
      )}

      {currentScreen === 'module' && (
        <ModuleScreen 
          onBack={handleBack} 
        />
      )}

      {currentScreen === 'profile' && (
        <ProfileScreen 
          onBack={handleBack} 
        />
      )}

      {currentScreen === 'ranking' && (
        <RankingScreen 
          onBack={handleBack} 
        />
      )}
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}
