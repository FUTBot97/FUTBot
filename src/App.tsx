import React, { useState, useEffect } from 'react';
import { Bot, Moon, Sun, Globe } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { LoginForm } from './components/LoginForm';
import { SubscriptionForm } from './components/SubscriptionForm';
import { SubscriptionList } from './components/SubscriptionList';
import { SubscriptionStats } from './components/SubscriptionStats';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import type { Subscription } from './types';

function Dashboard() {
  const { t, i18n } = useTranslation();
  const { isDark, toggleTheme } = useTheme();
  const [subscriptions, setSubscriptions] = useState<Subscription[]>(() => {
    const saved = localStorage.getItem('subscriptions');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('subscriptions', JSON.stringify(subscriptions));
  }, [subscriptions]);

  const toggleLanguage = () => {
    i18n.changeLanguage(i18n.language === 'en' ? 'ar' : 'en');
  };

  const addSubscription = (newSub: Omit<Subscription, 'id' | 'status'>) => {
    const subscription: Subscription = {
      ...newSub,
      id: crypto.randomUUID(),
      status: new Date(newSub.endDate) > new Date() ? 'active' : 'expired',
    };
    setSubscriptions([...subscriptions, subscription]);
  };

  const deleteSubscription = (id: string) => {
    setSubscriptions(subscriptions.filter((sub) => sub.id !== id));
  };

  const editSubscription = (updatedSubscription: Subscription) => {
    setSubscriptions(
      subscriptions.map((sub) =>
        sub.id === updatedSubscription.id ? updatedSubscription : sub
      )
    );
  };

  return (
    <div className={`min-h-screen bg-gray-100 dark:bg-gray-900 ${i18n.language === 'ar' ? 'rtl' : 'ltr'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center">
            <Bot className="w-10 h-10 text-blue-600 dark:text-blue-400 mr-3" />
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              {t('dashboard.title')}
            </h1>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={toggleLanguage}
              className="p-2 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200"
            >
              <Globe className="w-5 h-5" />
            </button>
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200"
            >
              {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
          </div>
        </div>

        <SubscriptionStats subscriptions={subscriptions} />
        
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          <div className="md:col-span-1">
            <SubscriptionForm onSubmit={addSubscription} />
          </div>
          <div className="md:col-span-2">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              {t('dashboard.subscriptionsTitle')}
            </h2>
            <SubscriptionList
              subscriptions={subscriptions}
              onDelete={deleteSubscription}
              onEdit={editSubscription}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return localStorage.getItem('isAuthenticated') === 'true';
  });

  const handleLogin = (email: string, password: string) => {
    // For demo purposes, accept any non-empty email and password
    if (email && password) {
      setIsAuthenticated(true);
      localStorage.setItem('isAuthenticated', 'true');
    } else {
      alert('Please enter both email and password');
    }
  };

  return (
    <ThemeProvider>
      {isAuthenticated ? <Dashboard /> : <LoginForm onLogin={handleLogin} />}
    </ThemeProvider>
  );
}

export default App;