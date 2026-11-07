import { strategyStatusOverride } from './strategyUiPrefs';

export const STATUS_FILTERS = ['active', 'draft'];

export function strategyListStatus(strategy, prefs) {
  const override = strategyStatusOverride(strategy?.id, prefs);
  if (override === 'active') return 'active';
  if (override === 'draft') return 'draft';

  if (strategy?.isActive === true) return 'active';
  if (strategy?.isActive === false) return 'draft';

  const hasPlaybook =
    Boolean(strategy?.rulesSetup?.trim()) ||
    Boolean(strategy?.description?.trim()) ||
    (strategy?.tags?.length ?? 0) > 0;

  if (!hasPlaybook) return 'draft';
  return 'active';
}

/** @deprecated use strategyListStatus */
export function inferStrategyStatus(strategy, _perf, prefs) {
  return strategyListStatus(strategy, prefs);
}

export function statusMatchesFilter(status, filter) {
  return status === filter;
}

export function statusLabel(status) {
  const labels = {
    active: 'Active',
    paused: 'Paused',
    draft: 'Draft',
    archived: 'Archived',
  };
  return labels[status] || 'Active';
}
