import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FileSelector } from '@/components/FileSelector';
import { DataTable } from '@/components/DataTable';
import { usePreviewFile } from '@/hooks/usePreviewFile';
import { Label } from '@/components/ui/label';

export function PreviewPage() {
  const { t } = useTranslation();
  const [filePath, setFilePath] = useState<string | null>(null);

  const { data, isLoading, error } = usePreviewFile(filePath);

  const filters = [
    { name: 'Excel Files', extensions: ['xlsx', 'xls'] },
    { name: 'JSON Files', extensions: ['json'] },
  ];

  return (
    <div className="space-y-6 p-4">
      <FileSelector
        label={t('preview.selectFile')}
        value={filePath || ''}
        onChange={(path) => setFilePath(path || null)}
        filters={filters}
        mode="open"
      />

      {isLoading && (
        <div className="flex items-center justify-center h-40">
          <p className="text-muted-foreground">{t('common.loading')}</p>
        </div>
      )}

      {error && (
        <div className="p-4 bg-destructive/10 rounded-md">
          <p className="text-destructive">{error.message}</p>
        </div>
      )}

      {data && !isLoading && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Label>{t('preview.fileType')}</Label>
              <span className="text-sm font-medium uppercase">
                {data.file_type}
              </span>
            </div>
          </div>

          <DataTable headers={data.headers} rows={data.rows} />
        </div>
      )}

      {!filePath && !isLoading && !error && (
        <div className="flex items-center justify-center h-40 text-muted-foreground">
          {t('preview.noFile')}
        </div>
      )}
    </div>
  );
}
