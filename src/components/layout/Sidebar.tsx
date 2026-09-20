import React from 'react';
import { useApp } from '../../context/AppContext';
import { ActiveView } from '../../types';
import {
  LayoutDashboard,
  Users,
  FolderTree,
  Settings,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Layers,
} from 'lucide-react';

interface SidebarProps {
  isMobileOpen: boolean;
  setIsMobileOpen: (open: boolean) => void;
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isMobileOpen,
  setIsMobileOpen,
  isCollapsed,
  setIsCollapsed,
}) => {
  const { activeView, setActiveView, setSelectedGroupId, t, students, groups, language, setLanguage } = useApp();

  const navItems: { id: ActiveView; label: string; icon: React.ReactNode; badge?: number }[] = [
    {
      id: 'dashboard',
      label: t.nav.dashboard,
      icon: <LayoutDashboard className="w-5 h-5 shrink-0" />,
    },
    {
      id: 'groups',
      label: t.nav.trackingGroups,
      icon: <FolderTree className="w-5 h-5 shrink-0" />,
      badge: groups.length,
    },
    {
      id: 'students',
      label: t.nav.studentManager,
      icon: <Users className="w-5 h-5 shrink-0" />,
      badge: students.length,
    },
    {
      id: 'settings',
      label: t.nav.settings,
      icon: <Settings className="w-5 h-5 shrink-0" />,
    },
  ];

  const handleNavClick = (view: ActiveView) => {
    setActiveView(view);
    if (view === 'groups') {
      // If clicking groups nav, show root groups list
      setSelectedGroupId(null);
    }
    setIsMobileOpen(false);
  };

  const content = (
    <div className="flex flex-col h-full bg-slate-900 text-slate-300 select-none">
      {/* Brand Header */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-slate-800">
        <div className="flex items-center gap-2.5 overflow-hidden">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-500 flex items-center justify-center text-white font-bold shadow-md shadow-indigo-600/30 shrink-0">
            <Layers className="w-5 h-5 text-white" />
          </div>
          {!isCollapsed && (
            <div className="flex flex-col truncate">
              <span className="text-sm font-bold text-white tracking-tight leading-none">
                {t.app.name}
              </span>
              <span className="text-[10px] text-slate-400 font-medium mt-1 leading-none">
                {t.app.tagline}
              </span>
            </div>
          )}
        </div>

        {/* Desktop Collapse Button */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="hidden md:flex p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          title={isCollapsed ? t.nav.expandSidebar : t.nav.collapseSidebar}
        >
          {isCollapsed ? (
            <ChevronRight className="w-4 h-4" />
          ) : (
            <ChevronLeft className="w-4 h-4" />
          )}
        </button>
      </div>

      {/* Navigation List */}
      <nav className="flex-1 p-3 space-y-1.5 overflow-y-auto">
        <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-3 py-1">
          {!isCollapsed ? 'Navigation' : '•••'}
        </div>
        {navItems.map((item) => {
          const isActive = activeView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => handleNavClick(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 text-left ${
                isActive
                  ? 'bg-indigo-600 text-white font-semibold shadow-xs'
                  : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/70'
              } ${isCollapsed ? 'justify-center px-2' : ''}`}
              title={isCollapsed ? item.label : undefined}
            >
              <div className={`${isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-200'}`}>
                {item.icon}
              </div>

              {!isCollapsed && (
                <div className="flex-1 flex items-center justify-between min-w-0">
                  <span className="truncate">{item.label}</span>
                  {item.badge !== undefined && (
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full font-mono font-medium ${
                        isActive
                          ? 'bg-indigo-500/50 text-white'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </div>
              )}
            </button>
          );
        })}
      </nav>

      {/* Footer / Quick Language Switch */}
      <div className="p-3 border-t border-slate-800 bg-slate-900/50">
        {!isCollapsed ? (
          <div className="flex items-center justify-between p-2 rounded-xl bg-slate-800/60 text-xs">
            <div className="flex items-center gap-2 text-slate-400">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              <span className="font-mono">{t.app.version}</span>
            </div>
            <div className="flex items-center gap-1 bg-slate-900 p-0.5 rounded-lg border border-slate-700/60">
              <button
                onClick={() => setLanguage('en')}
                className={`px-2 py-1 rounded text-[11px] font-semibold transition-colors ${
                  language === 'en'
                    ? 'bg-indigo-600 text-white'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                EN
              </button>
              <button
                onClick={() => setLanguage('id')}
                className={`px-2 py-1 rounded text-[11px] font-semibold transition-colors ${
                  language === 'id'
                    ? 'bg-indigo-600 text-white'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                ID
              </button>
            </div>
          </div>
        ) : (
          <div className="flex justify-center">
            <button
              onClick={() => setLanguage(language === 'en' ? 'id' : 'en')}
              className="text-[11px] font-mono font-bold px-2 py-1 rounded bg-slate-800 text-slate-300 hover:bg-slate-700"
              title="Toggle Language"
            >
              {language.toUpperCase()}
            </button>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside
        className={`hidden md:block shrink-0 transition-all duration-300 border-r border-slate-800 z-30 ${
          isCollapsed ? 'w-20' : 'w-64'
        }`}
      >
        <div className="fixed top-0 bottom-0 left-0 transition-all duration-300 overflow-hidden" style={{ width: isCollapsed ? '5rem' : '16rem' }}>
          {content}
        </div>
      </aside>

      {/* Mobile Drawer */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs transition-opacity"
            onClick={() => setIsMobileOpen(false)}
          />
          <div className="fixed inset-y-0 left-0 w-72 max-w-[85vw] shadow-2xl z-10 animate-in slide-in-from-left duration-200">
            {content}
          </div>
        </div>
      )}
    </>
  );
};
