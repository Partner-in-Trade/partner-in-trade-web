import { describe, it, expect } from 'vitest';
import { dailyJournalFromApi, dailyJournalToApi } from './journalMapper';

describe('journalMapper', () => {
  it('maps API journal to form', () => {
    const form = dailyJournalFromApi({
      title: 'Good day',
      marketOverview: '<p>Overview</p>',
      whatWentWell: '<p>Win</p>',
      whatToImprove: '<p>Fix</p>',
      screenshotsJson: [{ id: '1', caption: 'BTC', imageUrl: 'data:x' }],
    });
    expect(form.title).toBe('Good day');
    expect(form.screenshots).toHaveLength(1);
  });

  it('maps form to API payload', () => {
    const body = dailyJournalToApi({
      title: 'T',
      quickSummary: 'S',
      marketOverview: '<p>a</p>',
      whatWentWell: '<p>b</p>',
      whatToImprove: '<p>c</p>',
      screenshots: [],
    });
    expect(body.title).toBe('T');
    expect(body.whatToImprove).toBe('<p>c</p>');
  });
});
