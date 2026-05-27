import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { FileSelector } from './FileSelector';

// Mock i18next
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

// Mock Tauri dialog
vi.mock('@tauri-apps/plugin-dialog', () => ({
  open: vi.fn(),
}));

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe('FileSelector', () => {
  it('renders with label', () => {
    const wrapper = createWrapper();
    render(
      <FileSelector label="选择文件" value="" onChange={vi.fn()} />,
      { wrapper }
    );
    expect(screen.getByText('选择文件')).toBeInTheDocument();
  });

  it('displays selected file path', () => {
    const wrapper = createWrapper();
    render(
      <FileSelector
        label="选择文件"
        value="/path/to/file.xlsx"
        onChange={vi.fn()}
      />,
      { wrapper }
    );
    expect(screen.getByDisplayValue('/path/to/file.xlsx')).toBeInTheDocument();
  });

  it('renders button for selecting file', () => {
    const wrapper = createWrapper();
    render(
      <FileSelector label="选择文件" value="" onChange={vi.fn()} />,
      { wrapper }
    );
    expect(screen.getByRole('button', { name: 'common.confirm' })).toBeInTheDocument();
  });
});
