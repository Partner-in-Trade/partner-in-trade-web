import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import workspaceReducer from './slices/workspaceSlice';
import tradesReducer from './slices/tradesSlice';
import uiReducer from './slices/uiSlice';
import newsReducer from './slices/newsSlice';
import journalReducer from './slices/journalSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    workspace: workspaceReducer,
    trades: tradesReducer,
    ui: uiReducer,
    news: newsReducer,
    journal: journalReducer,
  },
});

export * from './selectors';
export * from './slices/authSlice';
export * from './slices/workspaceSlice';
export * from './slices/tradesSlice';
export * from './slices/uiSlice';
export * from './slices/newsSlice';
export * from './slices/journalSlice';
