import '@testing-library/jest-dom/vitest';
import { server } from './msw/server';
import { installMemoryLocalStorage } from './localStorage';

installMemoryLocalStorage();

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => {
  server.resetHandlers();
  localStorage.clear();
});
afterAll(() => server.close());
