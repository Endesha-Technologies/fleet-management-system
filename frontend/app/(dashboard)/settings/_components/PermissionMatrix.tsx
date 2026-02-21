'use client';

import { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { Search, ChevronDown, ChevronRight, Minus } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import type { PermissionGroup, Permission } from '../_types';

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

export interface PermissionMatrixProps {
  permissionGroups: PermissionGroup[];
  selectedPermissionIds: string[];
  onChange: (permissionIds: string[]) => void;
  disabled?: boolean;
}

// ---------------------------------------------------------------------------
// Resource icon mapping (emoji fallback)
// ---------------------------------------------------------------------------

const RESOURCE_ICONS: Record<string, string> = {
  USERS: '👤',
  TRUCKS: '🚛',
  ROLES: '🔑',
  TYRES: '⚙️',
  MAINTENANCE: '🔧',
  ASSETS: '📦',
  TRIPS: '🗺️',
  ROUTES: '🛣️',
  FUEL: '⛽',
  REPORTS: '📊',
  SETTINGS: '⚙️',
  INVENTORY: '📋',
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatAction(action: string): string {
  return action.charAt(0).toUpperCase() + action.slice(1).toLowerCase();
}

function formatPermissionName(permission: Permission): string {
  return `${permission.resource.toLowerCase()}:${permission.action.toLowerCase()}`;
}

// ---------------------------------------------------------------------------
// Group Header Component
// ---------------------------------------------------------------------------

interface GroupHeaderProps {
  resource: string;
  permissions: Permission[];
  selectedIds: Set<string>;
  isExpanded: boolean;
  onToggleExpand: () => void;
  onToggleAll: () => void;
  disabled?: boolean;
}

function GroupHeader({
  resource,
  permissions,
  selectedIds,
  isExpanded,
  onToggleExpand,
  onToggleAll,
  disabled,
}: GroupHeaderProps) {
  const selectedCount = permissions.filter((p) => selectedIds.has(p.id)).length;
  const totalCount = permissions.length;
  const allSelected = selectedCount === totalCount && totalCount > 0;
  const someSelected = selectedCount > 0 && selectedCount < totalCount;

  const icon = RESOURCE_ICONS[resource] ?? '📁';

  // We need a ref for the indeterminate state since it can't be set via HTML attribute.
  // This is a legitimate DOM synchronization use of useEffect.
  const checkboxRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (checkboxRef.current) {
      checkboxRef.current.indeterminate = someSelected;
    }
  }, [someSelected]);

  return (
    <div
      className={cn(
        'flex items-center justify-between rounded-lg bg-muted/50 px-4 py-3 transition-colors',
        !disabled && 'hover:bg-muted/70'
      )}
    >
      <button
        type="button"
        onClick={onToggleExpand}
        className="flex flex-1 items-center gap-3 text-left"
      >
        {isExpanded ? (
          <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />
        ) : (
          <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
        )}
        <span className="text-lg">{icon}</span>
        <span className="font-semibold uppercase tracking-wide text-sm">
          {resource}
        </span>
        <span className="text-xs text-muted-foreground">
          ({selectedCount}/{totalCount})
        </span>
      </button>

      {/* Select All toggle */}
      <label
        className={cn(
          'flex items-center gap-2 text-xs font-medium text-muted-foreground',
          disabled && 'cursor-not-allowed opacity-50'
        )}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative inline-flex items-center">
          <input
            ref={checkboxRef}
            type="checkbox"
            checked={allSelected}
            onChange={onToggleAll}
            disabled={disabled}
            className={cn(
              'peer h-4 w-4 shrink-0 appearance-none rounded-sm border ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
              allSelected
                ? 'border-primary bg-primary'
                : someSelected
                  ? 'border-primary bg-primary'
                  : 'border-gray-300'
            )}
          />
          {allSelected && (
            <svg
              className="pointer-events-none absolute left-1/2 top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 text-primary-foreground"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="20 6 9 17 4 12" />
            </svg>
          )}
          {someSelected && !allSelected && (
            <Minus className="pointer-events-none absolute left-1/2 top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 text-primary-foreground" />
          )}
        </div>
        All
      </label>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Permission Row Component
// ---------------------------------------------------------------------------

interface PermissionRowProps {
  permission: Permission;
  isSelected: boolean;
  onToggle: () => void;
  disabled?: boolean;
}

function PermissionRow({
  permission,
  isSelected,
  onToggle,
  disabled,
}: PermissionRowProps) {
  return (
    <label
      className={cn(
        'flex cursor-pointer items-center gap-3 rounded-md px-4 py-2.5 transition-colors',
        isSelected
          ? 'bg-primary/5 hover:bg-primary/10'
          : 'hover:bg-gray-50',
        disabled && 'cursor-not-allowed opacity-60'
      )}
    >
      <div className="relative inline-flex items-center">
        <input
          type="checkbox"
          checked={isSelected}
          onChange={onToggle}
          disabled={disabled}
          className={cn(
            'peer h-4 w-4 shrink-0 appearance-none rounded-sm border ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
            isSelected ? 'border-primary bg-primary' : 'border-gray-300'
          )}
        />
        {isSelected && (
          <svg
            className="pointer-events-none absolute left-1/2 top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 text-primary-foreground"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="20 6 9 17 4 12" />
          </svg>
        )}
      </div>

      <div className="flex flex-col gap-0.5 min-w-0">
        <span
          className={cn(
            'text-sm font-mono',
            isSelected ? 'text-primary font-medium' : 'text-foreground'
          )}
        >
          {formatPermissionName(permission)}
        </span>
        <span className="text-xs text-muted-foreground truncate">
          {permission.description ||
            `${formatAction(permission.action)} ${permission.resource.toLowerCase()}`}
        </span>
      </div>
    </label>
  );
}

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------

export function PermissionMatrix({
  permissionGroups,
  selectedPermissionIds,
  onChange,
  disabled,
}: PermissionMatrixProps) {
  const [search, setSearch] = useState('');

  // Track which groups the user has explicitly collapsed.
  // All groups default to expanded; we derive the expanded set from the inverse.
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(
    () => new Set()
  );

  const expandedGroups = useMemo(() => {
    const all = new Set(permissionGroups.map((g) => g.resource));
    collapsedGroups.forEach((r) => all.delete(r));
    return all;
  }, [permissionGroups, collapsedGroups]);

  const selectedIds = useMemo(
    () => new Set(selectedPermissionIds),
    [selectedPermissionIds]
  );

  // Filter groups by search
  const filteredGroups = useMemo(() => {
    if (!search.trim()) return permissionGroups;

    const q = search.toLowerCase();
    return permissionGroups
      .map((group) => ({
        ...group,
        permissions: group.permissions.filter(
          (p) =>
            formatPermissionName(p).includes(q) ||
            p.description.toLowerCase().includes(q) ||
            p.resource.toLowerCase().includes(q) ||
            p.action.toLowerCase().includes(q)
        ),
      }))
      .filter((group) => group.permissions.length > 0);
  }, [permissionGroups, search]);

  // Total permission count
  const totalPermissions = useMemo(
    () => permissionGroups.reduce((acc, g) => acc + g.permissions.length, 0),
    [permissionGroups]
  );

  // Toggle expand/collapse
  const toggleExpand = useCallback((resource: string) => {
    setCollapsedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(resource)) {
        next.delete(resource);
      } else {
        next.add(resource);
      }
      return next;
    });
  }, []);

  // Toggle single permission
  const togglePermission = useCallback(
    (permissionId: string) => {
      if (disabled) return;
      const next = selectedIds.has(permissionId)
        ? selectedPermissionIds.filter((id) => id !== permissionId)
        : [...selectedPermissionIds, permissionId];
      onChange(next);
    },
    [disabled, selectedIds, selectedPermissionIds, onChange]
  );

  // Toggle all in a group
  const toggleGroup = useCallback(
    (group: PermissionGroup) => {
      if (disabled) return;
      const groupIds = group.permissions.map((p) => p.id);
      const allSelected = groupIds.every((id) => selectedIds.has(id));

      let next: string[];
      if (allSelected) {
        // Deselect all in this group
        const groupIdSet = new Set(groupIds);
        next = selectedPermissionIds.filter((id) => !groupIdSet.has(id));
      } else {
        // Select all in this group
        const currentSet = new Set(selectedPermissionIds);
        groupIds.forEach((id) => currentSet.add(id));
        next = Array.from(currentSet);
      }
      onChange(next);
    },
    [disabled, selectedIds, selectedPermissionIds, onChange]
  );

  return (
    <div className="space-y-3">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search permissions..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
          disabled={disabled}
        />
      </div>

      {/* Permission groups */}
      <div className="max-h-[400px] space-y-2 overflow-y-auto rounded-lg border border-gray-200 bg-white p-2">
        {filteredGroups.length === 0 && (
          <div className="flex flex-col items-center justify-center py-8 text-center text-muted-foreground">
            <Search className="mb-2 h-8 w-8 text-gray-300" />
            <p className="text-sm font-medium">No permissions found</p>
            <p className="text-xs">Try adjusting your search query.</p>
          </div>
        )}

        {filteredGroups.map((group) => {
          // Find the full group for toggle-all logic (in case search filtered some out)
          const fullGroup = permissionGroups.find(
            (g) => g.resource === group.resource
          );
          const isExpanded = expandedGroups.has(group.resource);

          return (
            <div key={group.resource} className="overflow-hidden rounded-lg">
              {/* Group header */}
              <GroupHeader
                resource={group.resource}
                permissions={fullGroup?.permissions ?? group.permissions}
                selectedIds={selectedIds}
                isExpanded={isExpanded}
                onToggleExpand={() => toggleExpand(group.resource)}
                onToggleAll={() => toggleGroup(fullGroup ?? group)}
                disabled={disabled}
              />

              {/* Permission rows */}
              {isExpanded && (
                <div className="ml-4 mt-1 space-y-0.5 border-l-2 border-gray-100 pl-3">
                  {group.permissions.map((perm) => (
                    <PermissionRow
                      key={perm.id}
                      permission={perm}
                      isSelected={selectedIds.has(perm.id)}
                      onToggle={() => togglePermission(perm.id)}
                      disabled={disabled}
                    />
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Selected count footer */}
      <div className="flex items-center justify-between rounded-md bg-muted/30 px-4 py-2 text-sm">
        <span className="text-muted-foreground">
          <span className="font-semibold text-foreground">
            {selectedPermissionIds.length}
          </span>{' '}
          of{' '}
          <span className="font-semibold text-foreground">
            {totalPermissions}
          </span>{' '}
          permissions selected
        </span>
        {selectedPermissionIds.length > 0 && !disabled && (
          <button
            type="button"
            onClick={() => onChange([])}
            className="text-xs font-medium text-red-500 hover:text-red-700 transition-colors"
          >
            Clear all
          </button>
        )}
      </div>
    </div>
  );
}
