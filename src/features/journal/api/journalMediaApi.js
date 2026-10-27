import { apiClient } from '@/lib/apiClient';

export const journalMediaApi = {
  uploadImage: (file, journalDate) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('journalDate', journalDate);
    return apiClient.post('/journal-media', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      timeout: 120000,
    });
  },
};
