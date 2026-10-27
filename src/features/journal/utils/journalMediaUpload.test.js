import { describe, it, expect, vi } from 'vitest';
import { prepareJournalFormForSave } from './journalMediaUpload';

describe('prepareJournalFormForSave', () => {
  it('uploads pending screenshot and replaces blob HTML images', async () => {
    const file = new File([new Uint8Array([1, 2])], 'a.png', { type: 'image/png' });
    const uploadFile = vi.fn(async () => ({ data: { url: 'https://ik.imagekit.io/x/a.png' } }));

    const form = {
      title: 'Day',
      marketOverview:
        '<p>Hi</p><img src="blob:fake" data-upload-id="img-1" class="pit-rich-text-image" />',
      whatWentWell: '',
      whatToImprove: '',
      screenshots: [{ id: 'shot-1', caption: 'c', imageUrl: 'blob:shot' }],
    };

    const result = await prepareJournalFormForSave({
      journalDate: '2025-05-01',
      form,
      pendingUploads: { 'img-1': file, 'shot-1': file },
      uploadFile,
    });

    expect(uploadFile).toHaveBeenCalledTimes(2);
    expect(result.screenshots[0].imageUrl).toBe('https://ik.imagekit.io/x/a.png');
    expect(result.marketOverview).toContain('https://ik.imagekit.io/x/a.png');
    expect(result.marketOverview).not.toContain('data-upload-id');
  });

  it('leaves existing https URLs unchanged', async () => {
    const uploadFile = vi.fn();
    const form = {
      marketOverview: '<img src="https://ik.imagekit.io/existing.png" />',
      screenshots: [],
    };

    const result = await prepareJournalFormForSave({
      journalDate: '2025-05-01',
      form,
      pendingUploads: {},
      uploadFile,
    });

    expect(uploadFile).not.toHaveBeenCalled();
    expect(result.marketOverview).toContain('https://ik.imagekit.io/existing.png');
  });
});
