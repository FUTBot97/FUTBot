import React, { useState, useMemo } from 'react';
import { format, parseISO, addHours } from 'date-fns';
import { enUS } from 'date-fns/locale';
import { Trash2, Edit2, Download, Search, ChevronUp, ChevronDown, Filter } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { Subscription, DurationOption } from '../types';

const DURATION_OPTIONS: DurationOption[] = [
  { value: 1, label: 'dashboard.duration.6hours', hours: 6 },
  { value: 2, label: 'dashboard.duration.1month', hours: 720 },
  { value: 3, label: 'dashboard.duration.2months', hours: 1440 },
  { value: 4, label: 'dashboard.duration.3months', hours: 2160 },
  { value: 5, label: 'dashboard.duration.6months', hours: 4320 },
  { value: 6, label: 'dashboard.duration.1year', hours: 8760 }
];

const ITEMS_PER_PAGE = 10;

interface SubscriptionListProps {
  subscriptions: Subscription[];
  onDelete: (id: string) => void;
  onEdit: (subscription: Subscription) => void;
}

type SortField = 'email' | 'startDate' | 'endDate' | 'status';
type SortDirection = 'asc' | 'desc';

export function SubscriptionList({ subscriptions, onDelete, onEdit }: SubscriptionListProps) {
  const { t } = useTranslation();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<Subscription>>({});
  const [useCustomDate, setUseCustomDate] = useState(true);
  const [selectedDuration, setSelectedDuration] = useState<number>(DURATION_OPTIONS[0].value);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [sortField, setSortField] = useState<SortField>('email');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'expired'>('all');

  const handleEdit = (subscription: Subscription) => {
    setEditingId(subscription.id);
    setEditForm(subscription);
    setUseCustomDate(true);
  };

  const handleSave = (id: string) => {
    if (editForm.email && editForm.password) {
      let endDate: string;
      
      if (useCustomDate && editForm.endDate) {
        endDate = new Date(editForm.endDate).toISOString();
      } else {
        const duration = DURATION_OPTIONS.find(opt => opt.value === selectedDuration);
        endDate = addHours(new Date(), duration?.hours || 6).toISOString();
      }

      const updatedSubscription: Subscription = {
        ...editForm,
        id,
        startDate: editForm.startDate || new Date().toISOString(),
        endDate,
        status: new Date(endDate) > new Date() ? 'active' : 'expired'
      } as Subscription;
      
      onEdit(updatedSubscription);
      setEditingId(null);
      setEditForm({});
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditForm({});
    setUseCustomDate(true);
  };

  const formatDateForInput = (dateString: string) => {
    try {
      return format(parseISO(dateString), "yyyy-MM-dd'T'HH:mm");
    } catch {
      return '';
    }
  };

  const formatDateDisplay = (dateString: string) => {
    try {
      return format(parseISO(dateString), 'MMM dd, yyyy HH:mm', { locale: enUS });
    } catch {
      return '';
    }
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const date = new Date(e.target.value);
      if (!isNaN(date.getTime())) {
        setEditForm({ ...editForm, endDate: date.toISOString() });
      }
    } catch (error) {
      console.error('Invalid date:', error);
    }
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedItems(filteredSubscriptions.map(sub => sub.id));
    } else {
      setSelectedItems([]);
    }
  };

  const handleSelectItem = (id: string) => {
    setSelectedItems(prev => 
      prev.includes(id) 
        ? prev.filter(item => item !== id)
        : [...prev, id]
    );
  };

  const handleDeleteSelected = () => {
    selectedItems.forEach(id => onDelete(id));
    setSelectedItems([]);
  };

  const exportToCSV = () => {
    const headers = ['Email', 'Password', 'Start Date', 'End Date', 'Status'];
    const csvContent = [
      headers.join(','),
      ...filteredSubscriptions.map(sub => [
        sub.email,
        sub.password,
        formatDateDisplay(sub.startDate),
        formatDateDisplay(sub.endDate),
        sub.status
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `subscriptions_${format(new Date(), 'yyyy-MM-dd')}.csv`;
    link.click();
  };

  const filteredSubscriptions = useMemo(() => {
    return subscriptions
      .filter(sub => {
        const matchesSearch = 
          sub.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          sub.status.toLowerCase().includes(searchTerm.toLowerCase());
        
        const matchesStatus = 
          statusFilter === 'all' || sub.status === statusFilter;

        return matchesSearch && matchesStatus;
      })
      .sort((a, b) => {
        if (sortField === 'email') {
          return sortDirection === 'asc' 
            ? a.email.localeCompare(b.email)
            : b.email.localeCompare(a.email);
        }
        if (sortField === 'startDate' || sortField === 'endDate') {
          const dateA = new Date(a[sortField]).getTime();
          const dateB = new Date(b[sortField]).getTime();
          return sortDirection === 'asc' ? dateA - dateB : dateB - dateA;
        }
        return sortDirection === 'asc'
          ? a[sortField].localeCompare(b[sortField])
          : b[sortField].localeCompare(a[sortField]);
      });
  }, [subscriptions, searchTerm, sortField, sortDirection, statusFilter]);

  const paginatedSubscriptions = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredSubscriptions.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredSubscriptions, currentPage]);

  const totalPages = Math.ceil(filteredSubscriptions.length / ITEMS_PER_PAGE);

  return (
    <div className="space-y-4" dir="ltr">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-2.5 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder={t('dashboard.search')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 pr-3 py-1.5 w-full sm:w-56 border border-gray-300 rounded-md text-sm focus:ring-1 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white transition-all duration-200"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as 'all' | 'active' | 'expired')}
                className="border border-gray-300 rounded-md px-2 py-1.5 text-sm focus:ring-1 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white transition-all duration-200"
              >
                <option value="all">{t('dashboard.filter.all')}</option>
                <option value="active">{t('dashboard.filter.active')}</option>
                <option value="expired">{t('dashboard.filter.expired')}</option>
              </select>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {selectedItems.length > 0 && (
              <button
                onClick={handleDeleteSelected}
                className="flex items-center px-3 py-1.5 text-sm bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors duration-200"
              >
                <Trash2 className="w-4 h-4 mr-1.5" />
                {t('dashboard.deleteSelected', { count: selectedItems.length })}
              </button>
            )}
            <button
              onClick={exportToCSV}
              className="flex items-center px-3 py-1.5 text-sm bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors duration-200"
            >
              <Download className="w-4 h-4 mr-1.5" />
              {t('dashboard.export')}
            </button>
          </div>
        </div>

        <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-4 py-2 text-left">
                  <input
                    type="checkbox"
                    checked={selectedItems.length === filteredSubscriptions.length}
                    onChange={handleSelectAll}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 transition-colors duration-200"
                  />
                </th>
                <th 
                  className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('email')}
                >
                  <div className="flex items-center">
                    Email
                    {sortField === 'email' && (
                      sortDirection === 'asc' ? <ChevronUp className="w-3 h-3 ml-1" /> : <ChevronDown className="w-3 h-3 ml-1" />
                    )}
                  </div>
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Password
                </th>
                <th 
                  className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('startDate')}
                >
                  <div className="flex items-center">
                    Start Date
                    {sortField === 'startDate' && (
                      sortDirection === 'asc' ? <ChevronUp className="w-3 h-3 ml-1" /> : <ChevronDown className="w-3 h-3 ml-1" />
                    )}
                  </div>
                </th>
                <th 
                  className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('endDate')}
                >
                  <div className="flex items-center">
                    End Date
                    {sortField === 'endDate' && (
                      sortDirection === 'asc' ? <ChevronUp className="w-3 h-3 ml-1" /> : <ChevronDown className="w-3 h-3 ml-1" />
                    )}
                  </div>
                </th>
                <th 
                  className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('status')}
                >
                  <div className="flex items-center">
                    Status
                    {sortField === 'status' && (
                      sortDirection === 'asc' ? <ChevronUp className="w-3 h-3 ml-1" /> : <ChevronDown className="w-3 h-3 ml-1" />
                    )}
                  </div>
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {paginatedSubscriptions.map((subscription) => (
                <tr 
                  key={subscription.id}
                  className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-150"
                >
                  <td className="px-4 py-2">
                    <input
                      type="checkbox"
                      checked={selectedItems.includes(subscription.id)}
                      onChange={() => handleSelectItem(subscription.id)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 transition-colors duration-200"
                    />
                  </td>
                  <td className="px-4 py-2">
                    {editingId === subscription.id ? (
                      <input
                        type="email"
                        value={editForm.email || ''}
                        onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                        className="w-full rounded-md border-gray-300 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-1 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      />
                    ) : (
                      <span className="text-sm text-gray-900 dark:text-gray-300">{subscription.email}</span>
                    )}
                  </td>
                  <td className="px-4 py-2">
                    {editingId === subscription.id ? (
                      <input
                        type="text"
                        value={editForm.password || ''}
                        onChange={(e) => setEditForm({ ...editForm, password: e.target.value })}
                        className="w-full rounded-md border-gray-300 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-1 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      />
                    ) : (
                      <span className="text-sm text-gray-900 dark:text-gray-300">{subscription.password}</span>
                    )}
                  </td>
                  <td className="px-4 py-2">
                    <span className="text-sm text-gray-900 dark:text-gray-300">
                      {formatDateDisplay(subscription.startDate)}
                    </span>
                  </td>
                  <td className="px-4 py-2">
                    {editingId === subscription.id ? (
                      <div className="space-y-2">
                        <div className="flex items-center gap-3 text-sm">
                          <label className="inline-flex items-center">
                            <input
                              type="radio"
                              checked={useCustomDate}
                              onChange={() => setUseCustomDate(true)}
                              className="text-blue-600 focus:ring-blue-500 transition-colors duration-200"
                            />
                            <span className="ml-1.5 text-gray-700 dark:text-gray-300">
                              {t('dashboard.duration.custom')}
                            </span>
                          </label>
                          <label className="inline-flex items-center">
                            <input
                              type="radio"
                              checked={!useCustomDate}
                              onChange={() => setUseCustomDate(false)}
                              className="text-blue-600 focus:ring-blue-500 transition-colors duration-200"
                            />
                            <span className="ml-1.5 text-gray-700 dark:text-gray-300">
                              {t('dashboard.duration.preset')}
                            </span>
                          </label>
                        </div>
                        {useCustomDate ? (
                          <input
                            type="datetime-local"
                            value={formatDateForInput(editForm.endDate || '')}
                            onChange={handleDateChange}
                            className="w-full rounded-md border-gray-300 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-1 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                          />
                        ) : (
                          <select
                            value={selectedDuration}
                            onChange={(e) => setSelectedDuration(Number(e.target.value))}
                            className="w-full rounded-md border-gray-300 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-1 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                          >
                            {DURATION_OPTIONS.map((option) => (
                              <option key={option.value} value={option.value}>
                                {t(option.label)}
                              </option>
                            ))}
                          </select>
                        )}
                      </div>
                    ) : (
                      <span className="text-sm text-gray-900 dark:text-gray-300">
                        {formatDateDisplay(subscription.endDate)}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-2">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                        subscription.status === 'active'
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                          : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                      }`}
                    >
                      <span className={`w-1.5 h-1.5 mr-1.5 rounded-full ${
                        subscription.status === 'active'
                          ? 'bg-green-400'
                          : 'bg-red-400'
                      }`}></span>
                      {subscription.status}
                    </span>
                  </td>
                  <td className="px-4 py-2">
                    {editingId === subscription.id ? (
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleSave(subscription.id)}
                          className="text-xs font-medium text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 transition-colors duration-200"
                        >
                          {t('dashboard.save')}
                        </button>
                        <button
                          onClick={handleCancel}
                          className="text-xs font-medium text-gray-600 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors duration-200"
                        >
                          {t('dashboard.cancel')}
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleEdit(subscription)}
                          className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors duration-200"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onDelete(subscription.id)}
                          className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 transition-colors duration-200"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-4">
            <div className="text-xs text-gray-700 dark:text-gray-300">
              {t('dashboard.showing', {
                start: (currentPage - 1) * ITEMS_PER_PAGE + 1,
                end: Math.min(currentPage * ITEMS_PER_PAGE, filteredSubscriptions.length),
                total: filteredSubscriptions.length
              })}
            </div>
            <div className="flex items-center space-x-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors duration-200 ${
                    currentPage === page
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
                  }`}
                >
                  {page}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}