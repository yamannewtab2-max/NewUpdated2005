import React from 'react';
import { useApp } from '../../context/AppContext';
import { Menu, Plus, Globe, DollarSign } from 'lucide-react';
import { Button } from '../common/Button';

interface HeaderProps {
  onOpenMobileNav: () => void;
  onOpenCreateGroup?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenMobileNav, onOpenCreateGroup }) => {
  const { activeView, t, language, setLanguage, currency, setCurrency } = useApp();

  const getPageTitle = () => {
    switch (activeView) {
      case 'dashboard':
        return t.nav.dashboard;
      case 'groups':
        return t.nav.trackingGroups;
      case 'students':
        return t.nav.studentManager;
      case 'settings':
        return t.nav.settings;
      default:
        return t.app.name;
    }
  };

  return (
    <header className="sticky top-0 z-20 h-16 bg-white/90 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-8 flex items-center justify-between transition-colors">
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenMobileNav}
          className="md:hidden p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
          aria-label="Open navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2">
          <h1 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
            {getPageTitle()}
          </h1>
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        {/* Currency Quick Selector */}
        <div className="hidden sm:flex items-center bg-slate-100/90 rounded-xl p-1 border border-slate-200/60 text-xs">
          {(['IDR', 'USD', 'EUR'] as const).map((curr) => (
            <button
              key={curr}
              onClick={() => setCurrency(curr)}
              className={`px-2 py-1 rounded-lg font-mono text-[11px] font-semibold transition-all ${
                currency === curr
                  ? 'bg-white text-indigo-700 shadow-2xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              {curr}
            </button>
          ))}
        </div>

        {/* Language Switch */}
        <button
          onClick={() => setLanguage(language === 'en' ? 'id' : 'en')}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-2xs transition-colors"
          title="Switch Language"
        >
          <Globe className="w-3.5 h-3.5 text-slate-500" />
          <span className="uppercase">{language}</span>
        </button>

        {/* Quick Action Button */}
        {onOpenCreateGroup && (
          <Button
            variant="primary"
            size="sm"
            onClick={onOpenCreateGroup}
            leftIcon={<Plus className="w-4 h-4" />}
            className="hidden xs:inline-flex"
          >
            {t.dashboard.createGroupBtn}
          </Button>
        )}
      </div>
    </header>
  );
};
