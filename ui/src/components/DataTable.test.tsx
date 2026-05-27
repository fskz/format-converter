import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { DataTable } from './DataTable';

// Mock i18next
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, options?: Record<string, unknown>) => {
      if (key === 'preview.totalRows' && options?.count) {
        return `共 ${options.count} 行`;
      }
      return key;
    },
  }),
}));

describe('DataTable', () => {
  it('renders headers correctly', () => {
    const headers = ['Name', 'Age', 'City'];
    const rows = [['Alice', '25', 'Beijing']];

    render(<DataTable headers={headers} rows={rows} />);

    expect(screen.getByText('Name')).toBeInTheDocument();
    expect(screen.getByText('Age')).toBeInTheDocument();
    expect(screen.getByText('City')).toBeInTheDocument();
  });

  it('renders rows correctly', () => {
    const headers = ['Name', 'Age'];
    const rows = [
      ['Alice', '25'],
      ['Bob', '30'],
    ];

    render(<DataTable headers={headers} rows={rows} />);

    expect(screen.getByText('Alice')).toBeInTheDocument();
    expect(screen.getByText('25')).toBeInTheDocument();
    expect(screen.getByText('Bob')).toBeInTheDocument();
    expect(screen.getByText('30')).toBeInTheDocument();
  });

  it('shows no data message when empty', () => {
    render(<DataTable headers={[]} rows={[]} />);

    expect(screen.getByText('common.noData')).toBeInTheDocument();
  });

  it('displays total row count', () => {
    const headers = ['Name'];
    const rows = [['Alice'], ['Bob'], ['Charlie']];

    render(<DataTable headers={headers} rows={rows} />);

    expect(screen.getByText('共 3 行')).toBeInTheDocument();
  });
});
