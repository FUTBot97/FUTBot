import React, { useState } from 'react';
import { PlusCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { addHours } from 'date-fns';
import type { Subscription, DurationOption } from '../types';

interface SubscriptionFormProps {
  onSubmit: (subscription: Omit<Subscription, 'id' | 'status'>) => void;
}

const DURATION_OPTIONS: DurationOption[] = [
  { value: 1, label: 'dashboard.duration.6hours', hours: 6 },
  { value: 2, label: 'dashboard.duration.1month', hours: 720 },
  { value: 3, label: 'dashboard.duration.2months', hours: 1440 },
  { value: 4, label: 'dashboard.duration.3months', hours: 2160 },
  { value: 5, label: 'dashboard.duration.6months', hours: 4320 },
  { value: 6, label: 'dashboard.duration.1year', hours: 8760 }
];

export function SubscriptionForm({ onSubmit }: SubscriptionFormProps) {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [endDate, setEndDate] = useState('');
  const [useCustomDate, setUseCustomDate] = useState(true);
  const [selectedDuration, setSelectedDuration] = useState<number>(DURATION_OPTIONS[0].value);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const startDate = new Date().toISOString();
    const calculatedEndDate = useCustomDate
      ? endDate
      : addHours(
          new Date(),
          DURATION_OPTIONS.find(opt => opt.value === selectedDuration)?.hours || 6
        ).toISOString();

    onSubmit({
      email,
      password,
      startDate,
      endDate: calculatedEndDate
    });

    setEmail('');
    setPassword('');
    setEndDate('');
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
        {t('form.title')}
      </h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            {t('dashboard.email')}
          </label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            placeholder={t('form.emailPlaceholder')}
            required
          />
        </div>
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            {t('dashboard.password')}
          </label>
          <input
            type="text"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            placeholder={t('form.passwordPlaceholder')}
            required
          />
        </div>
        <div className="space-y-4">
          <div className="flex items-center space-x-4">
            <input
              type="radio"
              id="customDate"
              checked={useCustomDate}
              onChange={() => setUseCustomDate(true)}
              className="text-blue-600 focus:ring-blue-500"
            />
            <label htmlFor="customDate" className="text-sm text-gray-700 dark:text-gray-300">
              {t('dashboard.duration.custom')}
            </label>
            <input
              type="radio"
              id="presetDuration"
              checked={!useCustomDate}
              onChange={() => setUseCustomDate(false)}
              className="text-blue-600 focus:ring-blue-500"
            />
            <label htmlFor="presetDuration" className="text-sm text-gray-700 dark:text-gray-300">
              {t('dashboard.duration.preset')}
            </label>
          </div>
          {useCustomDate ? (
            <div>
              <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                {t('dashboard.endDate')}
              </label>
              <input
                type="datetime-local"
                id="endDate"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                required={useCustomDate}
              />
            </div>
          ) : (
            <div>
              <label htmlFor="duration" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                {t('dashboard.duration.preset')}
              </label>
              <select
                id="duration"
                value={selectedDuration}
                onChange={(e) => setSelectedDuration(Number(e.target.value))}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                required={!useCustomDate}
              >
                {DURATION_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {t(option.label)}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
        <button
          type="submit"
          className="w-full flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:bg-blue-500 dark:hover:bg-blue-600"
        >
          <PlusCircle className="w-5 h-5 mr-2" />
          {t('dashboard.addSubscription')}
        </button>
      </form>
    </div>
  );
}