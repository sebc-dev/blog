import { vi } from 'vitest';

export interface TestContextOptions {
  url: string;
  cookies?: Record<string, string>;
  headers?: Record<string, string>;
  prefixDefaultLocale?: boolean;
}

export const createTestContext = (options: TestContextOptions) => {
  const { url, cookies = {}, headers = {} } = options;

  const mockCookies = {
    get: vi.fn((name: string) => cookies[name] ? { value: cookies[name] } : undefined)
  };

  const mockRequest = {
    url,
    headers: {
      get: vi.fn((name: string) => headers[name] || null)
    }
  };

  const mockRedirect = vi.fn();
  const mockNext = vi.fn(() => Promise.resolve(new Response()));
  const mockLocals = {
    currentLang: undefined,
  };

  const context = {
    cookies: mockCookies,
    request: mockRequest,
    redirect: mockRedirect,
    locals: mockLocals
  };

  return {
    context,
    next: mockNext,
    mocks: {
      cookies: mockCookies,
      request: mockRequest,
      redirect: mockRedirect,
      next: mockNext,
      locals: mockLocals
    }
  };
};
