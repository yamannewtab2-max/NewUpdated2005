import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { GroupDetailView } from './GroupDetailView';
import { GroupModal } from './GroupModal';
import { ConfirmDialog } from '../common/ConfirmDialog';
import { ProgressBar } from '../common/ProgressBar';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { EmptyState } from '../common/EmptyState';
import {
  FolderTree,
  Plus,
  Search,
  ChevronRight,
  Edit2,
  Trash2,
  Layers,
  CornerDownRight,
} from 'lucide-react';

export const GroupsView: React.FC = () => {
  const {
    t,
    groups,
    selectedGroupId,
    setSelectedGroupId,
    getGroupStats,
    deleteGroup,
    formatMoney,
  } = useApp();

  const [search, setSearch] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [groupToDelete, setGroupToDelete] = useState<{ id: string; name: string } | null>(null);

  // If a group is actively selected, show its deep detail view
  if (selectedGroupId) {
    return (
      <GroupDetailView
        groupId={selectedGroupId}
      />
    );
  }

  // Filter groups
  const filteredGroups = useMemo(() => {
    if (!search.trim()) return groups;
    const q = search.toLowerCase();
    return groups.filter((g) => g.name.toLowerCase().includes(q));
  }, [groups, search]);

  // Root groups (groups with parentId === null)
  const rootGroups = useMemo(() => {
    return filteredGroups.filter((g) => g.parentId === null);
  }, [filteredGroups]);

  // Map of child groups
  const childrenMap = useMemo(() => {
    const map = new Map<string, typeof groups>();
    for (const g of groups) {
      if (g.parentId) {
        const list = map.get(g.parentId) || [];
        list.push(g);
        map.set(g.parentId, list);
      }
    }
    return map;
  }, [groups]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">{t.groups.title}</h2>
          <p className="text-xs text-slate-500 mt-1">{t.groups.subtitle}</p>
        </div>

        <Button
          variant="primary"
          onClick={() => setIsCreateModalOpen(true)}
          leftIcon={<Plus className="w-4 h-4" />}
        >
          {t.groups.createGroupBtn}
        </Button>
      </div>

      {/* Search Bar */}
      <div className="relative max-w-md">
        <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          placeholder={t.groups.searchPlaceholder}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full text-sm pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-500/20 shadow-2xs"
        />
      </div>

      {/* Groups Content */}
      {filteredGroups.length === 0 ? (
        <EmptyState
          icon={<FolderTree className="w-6 h-6" />}
          title={t.dashboard.noGroupsFound}
          description={t.dashboard.noGroupsDesc}
          actionLabel={t.groups.createGroupBtn}
          onAction={() => setIsCreateModalOpen(true)}
        />
      ) : (
        <div className="space-y-4">
          {rootGroups.map((rootGroup) => {
            const rootStats = getGroupStats(rootGroup.id, true);
            const childList = childrenMap.get(rootGroup.id) || [];

            return (
              <div
                key={rootGroup.id}
                className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden transition-all duration-150 hover:border-slate-300"
              >
                {/* Root Group Header Row */}
                <div className="p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-50/40 border-b border-slate-100">
                  <div
                    onClick={() => setSelectedGroupId(rootGroup.id)}
                    className="flex items-start gap-3 cursor-pointer group flex-1"
                  >
                    <div className="p-2.5 rounded-xl bg-indigo-600 text-white shadow-xs shrink-0 group-hover:bg-indigo-700 transition-colors">
                      <Layers className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-base font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                          {rootGroup.name}
                        </h3>
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-100 uppercase tracking-wider">
                          Root
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {childList.length} {t.dashboard.subgroupsLabel} • {rootStats.totalStudents}{' '}
                        {t.dashboard.studentsLabel}
                      </p>
                    </div>
                  </div>

                  {/* Root Group Stats & CTA */}
                  <div className="flex items-center justify-between md:justify-end gap-4">
                    <div className="text-right">
                      <p className="text-xs text-slate-400 font-medium">{t.dashboard.collected}</p>
                      <p className="text-sm font-bold font-mono text-slate-800">
                        {formatMoney(rootStats.totalCollected)} / {formatMoney(rootStats.totalExpected)}
                      </p>
                    </div>

                    <div className="w-24 sm:w-28">
                      <ProgressBar progress={rootStats.progressPercentage} height="sm" />
                      <span className="text-[10px] font-mono font-semibold text-slate-500 text-right block mt-0.5">
                        {rootStats.progressPercentage}%
                      </span>
                    </div>

                    <div className="flex items-center gap-1 pl-2 border-l border-slate-200">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => setSelectedGroupId(rootGroup.id)}
                        rightIcon={<ChevronRight className="w-3.5 h-3.5" />}
                      >
                        {t.dashboard.viewGroup}
                      </Button>
                      <button
                        onClick={() =>
                          setGroupToDelete({ id: rootGroup.id, name: rootGroup.name })
                        }
                        className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Subgroups Hierarchy List */}
                {childList.length > 0 && (
                  <div className="divide-y divide-slate-100 bg-white">
                    {childList.map((child) => {
                      const childStats = getGroupStats(child.id, true);
                      const grandChildren = childrenMap.get(child.id) || [];

                      return (
                        <div
                          key={child.id}
                          className="p-3.5 sm:p-4 pl-6 sm:pl-10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/70 transition-colors"
                        >
                          <div
                            onClick={() => setSelectedGroupId(child.id)}
                            className="flex items-center gap-2.5 cursor-pointer group flex-1 min-w-0"
                          >
                            <CornerDownRight className="w-4 h-4 text-slate-300 group-hover:text-indigo-600 transition-colors shrink-0" />
                            <div className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors shrink-0">
                              <FolderTree className="w-4 h-4" />
                            </div>
                            <div className="truncate">
                              <h4 className="text-sm font-semibold text-slate-800 group-hover:text-indigo-600 transition-colors truncate">
                                {child.name}
                              </h4>
                              <p className="text-[11px] text-slate-400 font-mono">
                                {childStats.totalStudents} {t.dashboard.studentsLabel} • Rate:{' '}
                                {formatMoney(child.paymentAmount)}
                                {grandChildren.length > 0 && ` • ${grandChildren.length} nested`}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center justify-between sm:justify-end gap-3 pl-6 sm:pl-0">
                            <div className="text-right">
                              <p className="text-[11px] font-mono font-medium text-slate-700">
                                {formatMoney(childStats.totalCollected)} /{' '}
                                {formatMoney(childStats.totalExpected)}
                              </p>
                              <span className="text-[10px] text-slate-400 font-mono">
                                {childStats.progressPercentage}% paid
                              </span>
                            </div>

                            <div className="w-20">
                              <ProgressBar progress={childStats.progressPercentage} height="sm" />
                            </div>

                            <button
                              onClick={() => setSelectedGroupId(child.id)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                              title="Inspect Room"
                            >
                              <ChevronRight className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Create Group Modal */}
      {isCreateModalOpen && (
        <GroupModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
        />
      )}

      {/* Delete Confirmation */}
      {groupToDelete && (
        <ConfirmDialog
          isOpen={!!groupToDelete}
          onClose={() => setGroupToDelete(null)}
          onConfirm={() => deleteGroup(groupToDelete.id)}
          title={t.groups.deleteConfirmTitle}
          message={t.groups.deleteConfirmMessage.replace('{name}', groupToDelete.name)}
          confirmText={t.common.delete}
          variant="danger"
        />
      )}
    </div>
  );
};
