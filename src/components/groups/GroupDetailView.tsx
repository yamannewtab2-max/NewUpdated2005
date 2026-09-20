import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Breadcrumbs } from '../common/Breadcrumbs';
import { Button } from '../common/Button';
import { ConfirmDialog } from '../common/ConfirmDialog';
import { GroupOverviewCards } from './GroupOverviewCards';
import { PaymentTable } from './PaymentTable';
import { GroupModal } from './GroupModal';
import { ProgressBar } from '../common/ProgressBar';
import {
  FolderTree,
  Plus,
  Edit2,
  Trash2,
  Users,
  ChevronRight,
  DollarSign,
  ArrowLeft,
} from 'lucide-react';

interface GroupDetailViewProps {
  groupId: string;
}

export const GroupDetailView: React.FC<GroupDetailViewProps> = ({ groupId }) => {
  const {
    t,
    getGroup,
    getSubgroups,
    getGroupHierarchy,
    getGroupStats,
    deleteGroup,
    setSelectedGroupId,
    formatMoney,
  } = useApp();

  const group = getGroup(groupId);

  const [isEditGroupOpen, setIsEditGroupOpen] = useState(false);
  const [isAddSubgroupOpen, setIsAddSubgroupOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);

  if (!group) {
    return (
      <div className="p-8 text-center">
        <p className="text-sm text-slate-500">{t.dashboard.noGroupsFound}</p>
        <Button
          variant="secondary"
          size="sm"
          onClick={() => setSelectedGroupId(null)}
          className="mt-4"
        >
          {t.groups.backToAll}
        </Button>
      </div>
    );
  }

  const hierarchy = getGroupHierarchy(groupId);
  const subgroups = getSubgroups(groupId);
  const stats = getGroupStats(groupId, true);
  const parentGroup = group.parentId ? getGroup(group.parentId) : null;

  return (
    <div className="space-y-6">
      {/* Top Navigation & Breadcrumbs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-200/80">
        <div className="flex items-center gap-2 flex-wrap">
          {parentGroup && (
            <button
              onClick={() => setSelectedGroupId(parentGroup.id)}
              className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors mr-1"
              title={t.groups.backToParent.replace('{parent}', parentGroup.name)}
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
          )}
          <Breadcrumbs
            hierarchy={hierarchy}
            onSelectGroup={(id) => setSelectedGroupId(id)}
            rootLabel={t.groups.allRootGroups}
          />
        </div>

        {/* Group Actions */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setIsEditGroupOpen(true)}
            leftIcon={<Edit2 className="w-3.5 h-3.5" />}
          >
            {t.groups.editGroupBtn}
          </Button>
          <Button
            variant="danger"
            size="sm"
            onClick={() => setIsDeleteConfirmOpen(true)}
            leftIcon={<Trash2 className="w-3.5 h-3.5" />}
          >
            {t.groups.deleteGroupBtn}
          </Button>
        </div>
      </div>

      {/* Group Header Info */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100/80">
              <FolderTree className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900 tracking-tight">{group.name}</h2>
              {group.description && (
                <p className="text-xs text-slate-500">{group.description}</p>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 sm:gap-4 self-start md:self-auto">
          <div className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-200/60 text-right">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              Default Rate / Student
            </span>
            <span className="text-base font-mono font-bold text-indigo-700">
              {formatMoney(group.paymentAmount)}
            </span>
          </div>

          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsAddSubgroupOpen(true)}
            leftIcon={<Plus className="w-4 h-4" />}
          >
            {t.groups.addSubgroupBtn}
          </Button>
        </div>
      </div>

      {/* Financial Overview Stats Cards */}
      <GroupOverviewCards stats={stats} groupName={group.name} />

      {/* Nested Subgroups Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-slate-900 tracking-tight">
              {t.groups.subgroupsHeading}
            </h3>
            <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
              {subgroups.length}
            </span>
          </div>
          <button
            onClick={() => setIsAddSubgroupOpen(true)}
            className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
          >
            <Plus className="w-3.5 h-3.5" />
            {t.groups.addSubgroupBtn}
          </button>
        </div>

        {subgroups.length === 0 ? (
          <div className="p-5 rounded-2xl bg-slate-50/70 border border-dashed border-slate-200 text-center">
            <p className="text-xs text-slate-500">{t.groups.noSubgroupsDesc}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {subgroups.map((sub) => {
              const subStats = getGroupStats(sub.id, true);
              return (
                <div
                  key={sub.id}
                  onClick={() => setSelectedGroupId(sub.id)}
                  className="p-4 rounded-2xl bg-white border border-slate-200/80 hover:border-indigo-300 hover:shadow-md transition-all duration-150 cursor-pointer flex flex-col justify-between group text-left"
                >
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                        <FolderTree className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                          {sub.name}
                        </h4>
                        <span className="text-[11px] text-slate-400 font-mono">
                          Rate: {formatMoney(sub.paymentAmount)}
                        </span>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-indigo-600 group-hover:translate-x-0.5 transition-all" />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-500">
                        {subStats.totalStudents} {t.dashboard.studentsLabel}
                      </span>
                      <span className="font-mono font-bold text-slate-800">
                        {formatMoney(subStats.totalCollected)} / {formatMoney(subStats.totalExpected)}
                      </span>
                    </div>
                    <ProgressBar progress={subStats.progressPercentage} height="sm" />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Students & Payment Status Section */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-slate-900 tracking-tight">
              {t.groups.studentsHeading}
            </h3>
            <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
              {(group.studentIds || []).length}
            </span>
          </div>

          <Button
            variant="secondary"
            size="sm"
            onClick={() => setIsEditGroupOpen(true)}
            leftIcon={<Users className="w-3.5 h-3.5" />}
          >
            {t.groups.addStudentsToGroup}
          </Button>
        </div>

        {/* Student Payment Table */}
        <PaymentTable groupId={group.id} studentIds={group.studentIds || []} />
      </div>

      {/* Edit Group Modal */}
      {isEditGroupOpen && (
        <GroupModal
          isOpen={isEditGroupOpen}
          onClose={() => setIsEditGroupOpen(false)}
          groupToEdit={group}
        />
      )}

      {/* Add Subgroup Modal */}
      {isAddSubgroupOpen && (
        <GroupModal
          isOpen={isAddSubgroupOpen}
          onClose={() => setIsAddSubgroupOpen(false)}
          defaultParentId={group.id}
        />
      )}

      {/* Delete Group Confirmation */}
      <ConfirmDialog
        isOpen={isDeleteConfirmOpen}
        onClose={() => setIsDeleteConfirmOpen(false)}
        onConfirm={() => deleteGroup(group.id)}
        title={t.groups.deleteConfirmTitle}
        message={t.groups.deleteConfirmMessage.replace('{name}', group.name)}
        confirmText={t.common.delete}
        variant="danger"
      />
    </div>
  );
};
