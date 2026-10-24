import React from 'react';
import { render } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import authReducer from '@/app/store/slices/authSlice';
import workspaceReducer from '@/app/store/slices/workspaceSlice';
import tradesReducer from '@/app/store/slices/tradesSlice';
import uiReducer from '@/app/store/slices/uiSlice';

export function createTestStore(preloadedState) {
  return configureStore({
    reducer: {
      auth: authReducer,
      workspace: workspaceReducer,
      trades: tradesReducer,
      ui: uiReducer,
    },
    preloadedState,
  });
}

export function renderWithProviders(ui, { preloadedState, store } = {}) {
  const testStore = store ?? createTestStore(preloadedState);
  return {
    store: testStore,
    ...render(<Provider store={testStore}>{ui}</Provider>),
  };
}
