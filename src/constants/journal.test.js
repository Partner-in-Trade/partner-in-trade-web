import { describe, it, expect } from 'vitest';
import { emptyDailyJournalForm, journalFormHasContent } from './journal';

describe('journalFormHasContent', () => {
  it('returns false for empty form', () => {
    expect(journalFormHasContent(emptyDailyJournalForm())).toBe(false);
  });

  it('returns true when title or sections have content', () => {
    expect(journalFormHasContent({ ...emptyDailyJournalForm(), title: 'Session' })).toBe(true);
    expect(journalFormHasContent({ ...emptyDailyJournalForm(), marketOverview: '<p>Plan</p>' })).toBe(
      true
    );
    expect(
      journalFormHasContent({
        ...emptyDailyJournalForm(),
        screenshots: [{ id: '1', caption: '', imageUrl: 'https://x/y.png' }],
      })
    ).toBe(true);
  });

  it('ignores empty rich-text placeholders', () => {
    expect(journalFormHasContent({ ...emptyDailyJournalForm(), whatWentWell: '<p></p>' })).toBe(false);
  });
});
