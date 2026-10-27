import React from 'react';
import { useSelector } from 'react-redux';
import { selectJournalMainView } from '@/app/store/slices/journalSlice';
import { WriteJournalEditor } from './components/WriteJournalEditor';
import { JournalDayReadView } from './components/JournalDayReadView';

export function JournalView() {
  const mainView = useSelector(selectJournalMainView);

  if (mainView === 'write') {
    return <WriteJournalEditor />;
  }

  return <JournalDayReadView />;
}
