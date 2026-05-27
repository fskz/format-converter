import { useVirtualizer } from '@tanstack/react-virtual';
import { useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollArea, ScrollBar } from './ui/scroll-area';

interface DataTableProps {
  headers: string[];
  rows: string[][];
  maxHeight?: number;
}

export function DataTable({ headers, rows, maxHeight = 400 }: DataTableProps) {
  const { t } = useTranslation();
  const parentRef = useRef<HTMLDivElement>(null);

  const rowVirtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 35,
    overscan: 10,
  });

  if (!headers.length || !rows.length) {
    return (
      <div className="flex items-center justify-center h-40 text-muted-foreground">
        {t('common.noData')}
      </div>
    );
  }

  return (
    <div className="border rounded-md">
      <ScrollArea style={{ height: maxHeight }}>
        <table className="w-full text-sm">
          <thead className="bg-muted sticky top-0">
            <tr>
              {headers.map((header, index) => (
                <th
                  key={index}
                  className="px-4 py-2 text-left font-medium border-b"
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody ref={parentRef} className="relative">
            {rowVirtualizer.getVirtualItems().map((virtualRow) => {
              const row = rows[virtualRow.index];
              return (
                <tr
                  key={virtualRow.key}
                  className="absolute top-0 left-0 w-full"
                  style={{
                    height: `${virtualRow.size}px`,
                    transform: `translateY(${virtualRow.start}px)`,
                  }}
                >
                  {row.map((cell, cellIndex) => (
                    <td
                      key={cellIndex}
                      className="px-4 py-2 border-b truncate max-w-[200px]"
                    >
                      {cell}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
        <ScrollBar />
      </ScrollArea>
      <div className="p-2 text-sm text-muted-foreground border-t">
        {t('preview.totalRows', { count: rows.length })}
      </div>
    </div>
  );
}
