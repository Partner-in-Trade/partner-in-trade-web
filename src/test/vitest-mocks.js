import React from 'react';
import { vi } from 'vitest';

vi.mock('recharts', () => import('./mocks/recharts.js'));

vi.mock('@/components/editor/RichTextEditor', () => ({
  RichTextEditor: function MockRichTextEditor({ value, onChange, placeholder }) {
    return React.createElement('textarea', {
      'data-testid': 'rich-text-editor',
      'aria-label': placeholder,
      value: value || '',
      onChange: (e) => onChange?.(e.target.value),
    });
  },
}));
