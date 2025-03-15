import React from 'react';
import { useTranslation } from 'react-i18next';
import { Users, UserCheck, UserX } from 'lucide-react';
import type { Subscription } from '../types';

interface SubscriptionStatsProps {
  subscriptions: Subscription[];
}

export function SubscriptionStats({ subscriptions }: SubscriptionStatsProps) {
  const { t } = useTranslation();
  
  const totalCount = subscriptions.length;
  const activeCount = subscriptions.filter(sub => sub.status === 'active').length;
  const expiredCount = subscriptions.filter(sub => sub.status === 'expired').length;

  const stats = [
    { label: 'stats.total', count: totalCount, icon: Users, color: 'blue' },
    { label: 'stats.active', count: activeCount, icon: UserCheck, color: 'green' },
    { label: 'stats.expired', count: expiredCount, icon: UserX, color: 'red' }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6" dir="ltr">
      {stats.map(({ label, count, icon: Icon, color }) => (
        <div
          key={label}
          className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 flex items-center justify-between"
        >
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {t(`dashboard.${label}`)}
            </p>
            <p className="mt-1 text-3xl font-semibold text-gray-900 dark:text-white font-['Inter']">
              {count}
            </p>
          </div>
          <div className={`p-3 bg-${color}-100 dark:bg-${color}-900/30 rounded-full`}>
            <Icon className={`w-6 h-6 text-${color}-600 dark:text-${color}-400`} />
          </div>
        </div>
      ))}
    </div>
  );
}