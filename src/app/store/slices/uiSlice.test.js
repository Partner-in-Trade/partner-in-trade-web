import { describe, it, expect } from 'vitest';
import { createTestStore } from '@/test/renderWithProviders';
import { setActiveTab } from './uiSlice';

describe('uiSlice', () => {
  it('setActiveTab updates active tab', () => {
    const store = createTestStore();
    store.dispatch(setActiveTab('markets'));
    expect(store.getState().ui.activeTab).toBe('markets');
  });
});
