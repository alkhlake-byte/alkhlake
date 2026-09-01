import React, { useState, useEffect } from 'react';
import {
  UserAccount,
  Language,
  AppTab,
} from './types';
import {
  getActiveUser,
  setActiveUserId,
  getSavedLanguage,
  saveLanguage,
} from './utils/storage';
import { AuthScreen } from './components/AuthScreen';
import { TopBar } from './components/TopBar';
import { BottomBar } from './components/BottomBar';
import { MainCalculator } from './components/MainCalculator';
import { DatabaseManager } from './components/DatabaseManager';

export default function App() {
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(() => getActiveUser());
  const [language, setLanguage] = useState<Language>(() => getSavedLanguage());
  const [activeTab, setActiveTab] = useState<AppTab>('main');

  // Sync document direction with language
  useEffect(() => {
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = language;
    saveLanguage(language);
  }, [language]);

  const handleLoginSuccess = (user: UserAccount) => {
    setCurrentUser(user);
    setActiveUserId(user.id);
  };

  const handleLogout = () => {
    setActiveUserId(null);
    setCurrentUser(null);
  };

  const handleLanguageChange = (newLang: Language) => {
    setLanguage(newLang);
  };

  const handleUserUpdated = (updatedUser: UserAccount) => {
    setCurrentUser(updatedUser);
  };

  // If no user is logged in, show AuthScreen (Prompt 1 requirement #7)
  if (!currentUser) {
    return (
      <div className="min-h-screen w-full" style={{ backgroundColor: '#292734' }}>
        <AuthScreen
          lang={language}
          onLoginSuccess={handleLoginSuccess}
        />
      </div>
    );
  }

  return (
    <div
      className="min-h-screen w-full flex flex-col justify-between text-white selection:bg-amber-500/30 selection:text-white"
      style={{ backgroundColor: '#292734' }}
    >
      {/* Top Bar (Prompt 2) */}
      <TopBar
        user={currentUser}
        lang={language}
        onLanguageChange={handleLanguageChange}
        onLogout={handleLogout}
        onUserUpdated={handleUserUpdated}
      />

      {/* Main Content Area */}
      <main className="flex-1 w-full overflow-y-auto">
        {activeTab === 'main' ? (
          <MainCalculator
            user={currentUser}
            lang={language}
            onNavigateToDatabase={() => setActiveTab('database')}
          />
        ) : (
          <DatabaseManager
            user={currentUser}
            lang={language}
          />
        )}
      </main>

      {/* Bottom Bar (Prompt 2) */}
      <BottomBar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        lang={language}
      />
    </div>
  );
}
