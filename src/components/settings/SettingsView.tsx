import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Language, Currency } from '../../types';
import { Button } from '../common/Button';
import { ConfirmDialog } from '../common/ConfirmDialog';
import {
  Globe,
  DollarSign,
  RotateCcw,
  Sparkles,
  CheckCircle2,
  ShieldCheck,
} from 'lucide-react';

export const SettingsView: React.FC = () => {
  const {
    t,
    language,
    setLanguage,
    currency,
    setCurrency,
    resetToMockData,
  } = useApp();

  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);

  const languages: { id: Language; label: string; sub: string; flag: string }[] = [
    {
      id: 'en',
      label: t.settings.english,
      sub: 'English (United States)',
      flag: '🇺🇸',
    },
    {
      id: 'id',
      label: t.settings.indonesian,
      sub: 'Bahasa Indonesia',
      flag: '🇮🇩',
    },
  ];

  const currencies: { id: Currency; symbol: string; label: string; example: string }[] = [
    {
      id: 'IDR',
      symbol: 'Rp',
      label: 'Indonesian Rupiah',
      example: 'Rp 150.000',
    },
    {
      id: 'USD',
      symbol: '$',
      label: 'US Dollar',
      example: '$150.00',
    },
    {
      id: 'EUR',
      symbol: '€',
      label: 'Euro',
      example: '€150.00',
    },
  ];

  return (
    <div className="max-w-4xl space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">{t.settings.title}</h2>
        <p className="text-xs text-slate-500 mt-1">{t.settings.subtitle}</p>
      </div>

      {/* Language Section */}
      <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs space-y-4">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600">
            <Globe className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">{t.settings.languageHeading}</h3>
            <p className="text-xs text-slate-500 mt-0.5">{t.settings.languageDesc}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          {languages.map((lang) => {
            const isSelected = language === lang.id;
            return (
              <div
                key={lang.id}
                onClick={() => setLanguage(lang.id)}
                className={`p-4 rounded-xl border-2 cursor-pointer transition-all flex items-center justify-between ${
                  isSelected
                    ? 'border-indigo-600 bg-indigo-50/40 text-indigo-900'
                    : 'border-slate-200 hover:border-slate-300 bg-white text-slate-800'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{lang.flag}</span>
                  <div>
                    <p className="text-sm font-bold">{lang.label}</p>
                    <p className="text-[11px] text-slate-400">{lang.sub}</p>
                  </div>
                </div>
                {isSelected && (
                  <CheckCircle2 className="w-5 h-5 text-indigo-600 shrink-0" />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Currency Section */}
      <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs space-y-4">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
            <DollarSign className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">{t.settings.currencyHeading}</h3>
            <p className="text-xs text-slate-500 mt-0.5">{t.settings.currencyDesc}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
          {currencies.map((curr) => {
            const isSelected = currency === curr.id;
            return (
              <div
                key={curr.id}
                onClick={() => setCurrency(curr.id)}
                className={`p-4 rounded-xl border-2 cursor-pointer transition-all flex flex-col justify-between gap-2 ${
                  isSelected
                    ? 'border-indigo-600 bg-indigo-50/40 text-indigo-900'
                    : 'border-slate-200 hover:border-slate-300 bg-white text-slate-800'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm">{curr.label}</span>
                  <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                    {curr.id}
                  </span>
                </div>
                <div className="text-xs text-slate-500 font-mono">
                  Format preview: <span className="font-bold text-slate-900">{curr.example}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Mock Data Reset Section */}
      <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs space-y-4">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-xl bg-amber-50 text-amber-600">
            <RotateCcw className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">{t.settings.dataManagementHeading}</h3>
            <p className="text-xs text-slate-500 mt-0.5">{t.settings.dataManagementDesc}</p>
          </div>
        </div>

        <div className="pt-2 flex items-center justify-between flex-wrap gap-4 border-t border-slate-100">
          <p className="text-xs text-slate-500 max-w-md">
            Restores the initial demonstration state including Level One (Rooms 1, 2, 3), realistic student roster, and payment records.
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsResetConfirmOpen(true)}
            leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
          >
            {t.settings.resetBtn}
          </Button>
        </div>
      </div>

      {/* About Box */}
      <div className="p-5 rounded-2xl bg-slate-900 text-slate-300 space-y-2">
        <div className="flex items-center gap-2 text-white">
          <Sparkles className="w-4 h-4 text-indigo-400" />
          <h4 className="text-sm font-bold">{t.settings.aboutHeading}</h4>
          <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-slate-800 text-indigo-300 border border-slate-700">
            {t.app.version}
          </span>
        </div>
        <p className="text-xs text-slate-400 leading-relaxed max-w-2xl">{t.settings.aboutDesc}</p>
        <div className="pt-2 flex items-center gap-4 text-[11px] text-slate-400">
          <span className="flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> Production-ready UI architecture
          </span>
          <span>•</span>
          <span>Ready for Firestore / SQL integration</span>
        </div>
      </div>

      {/* Reset Confirmation Dialog */}
      <ConfirmDialog
        isOpen={isResetConfirmOpen}
        onClose={() => setIsResetConfirmOpen(false)}
        onConfirm={resetToMockData}
        title={t.settings.resetConfirmTitle}
        message={t.settings.resetConfirmMessage}
        confirmText={t.common.confirm}
        variant="danger"
      />
    </div>
  );
};
