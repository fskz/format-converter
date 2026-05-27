import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { FileSelector } from '@/components/FileSelector';
import { ProgressBar } from '@/components/ProgressBar';
import { useBatchConvert } from '@/hooks/useBatchConvert';
import { useBatchProgress } from '@/hooks/useBatchProgress';
import { open } from '@tauri-apps/plugin-dialog';
import type { BatchItem } from '@/lib/tauri';

export function BatchPage() {
  const { t } = useTranslation();
  const [files, setFiles] = useState<BatchItem[]>([]);
  const [outputDir, setOutputDir] = useState('');
  const [direction, setDirection] = useState<'xlsx2json' | 'json2xlsx'>(
    'xlsx2json',
  );

  const batchMutation = useBatchConvert();
  const progress = useBatchProgress();

  const handleAddFiles = async () => {
    const selected = await open({
      multiple: true,
      filters:
        direction === 'xlsx2json'
          ? [{ name: 'Excel Files', extensions: ['xlsx', 'xls'] }]
          : [{ name: 'JSON Files', extensions: ['json'] }],
    });

    if (selected) {
      const paths = Array.isArray(selected) ? selected : [selected];
      const newFiles: BatchItem[] = paths.map((input) => {
        const ext = direction === 'xlsx2json' ? '.json' : '.xlsx';
        const baseName = input.split('/').pop() || '';
        const name = baseName.replace(/\.[^.]+$/, '');
        return {
          input,
          output: outputDir ? `${outputDir}/${name}${ext}` : '',
          direction,
        };
      });
      setFiles((prev) => [...prev, ...newFiles]);
    }
  };

  const handleStartBatch = async () => {
    if (files.length === 0 || !outputDir) return;

    await batchMutation.mutateAsync(files);

    // Clear files after successful batch
    setFiles([]);
  };

  const handleRemoveFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-6 p-4">
      <div className="space-y-2">
        <Label>{t('convert.direction')}</Label>
        <div className="flex gap-4">
          <Button
            variant={direction === 'xlsx2json' ? 'default' : 'outline'}
            onClick={() => setDirection('xlsx2json')}
          >
            {t('convert.xlsx2json')}
          </Button>
          <Button
            variant={direction === 'json2xlsx' ? 'default' : 'outline'}
            onClick={() => setDirection('json2xlsx')}
          >
            {t('convert.json2xlsx')}
          </Button>
        </div>
      </div>

      <div className="flex gap-4">
        <Button onClick={handleAddFiles} variant="outline">
          {t('batch.addFiles')}
        </Button>
        <FileSelector
          label={t('batch.selectOutputDir')}
          value={outputDir}
          onChange={setOutputDir}
          mode="directory"
        />
      </div>

      {files.length > 0 && (
        <div className="space-y-2">
          <Label>{t('batch.addFiles')}</Label>
          <div className="border rounded-md divide-y">
            {files.map((file, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-2"
              >
                <span className="text-sm truncate flex-1">{file.input}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRemoveFile(index)}
                >
                  ×
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      {progress && (
        <ProgressBar
          current={progress.current}
          total={progress.total}
          label={t('batch.progress', {
            current: progress.current,
            total: progress.total,
          })}
        />
      )}

      {progress && progress.current_file && (
        <p className="text-sm text-muted-foreground">
          {t('batch.currentFile', { file: progress.current_file })}
        </p>
      )}

      <Button
        onClick={handleStartBatch}
        disabled={files.length === 0 || !outputDir || batchMutation.isPending}
        className="w-full"
      >
        {batchMutation.isPending
          ? t('batch.converting')
          : t('batch.start')}
      </Button>
    </div>
  );
}
