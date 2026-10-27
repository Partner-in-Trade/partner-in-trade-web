import { describe, it, expect } from 'vitest';
import { screen } from '@testing-library/react';
import { JournalView } from './JournalView';
import { renderWithProviders } from '@/test/renderWithProviders';

describe('JournalView', () => {
  it('renders day read view by default', () => {
    renderWithProviders(<JournalView />, {
      preloadedState: {
        journal: {
          summariesByDate: {},
          dailyByDate: {},
          dailyLoading: false,
          dailySaving: false,
          dailyError: null,
          selectedDate: '2025-01-10',
          mainView: 'day',
          journalNavExpanded: false,
        },
      },
    });
    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
  });

  it('renders write editor when mainView is write', () => {
    renderWithProviders(<JournalView />, {
      preloadedState: {
        journal: {
          summariesByDate: {},
          dailyByDate: { '2025-05-01': { title: '', quickSummary: '', marketOverview: '', whatWentWell: '', whatToImprove: '', screenshots: [] } },
          dailyLoading: false,
          dailySaving: false,
          dailyError: null,
          selectedDate: '2025-05-01',
          mainView: 'write',
          journalNavExpanded: false,
        },
      },
    });
    expect(screen.getByRole('button', { name: /back to entry/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^save$/i })).toBeInTheDocument();
  });
});
