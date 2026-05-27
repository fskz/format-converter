import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { DirectionToggle } from '@/components/DirectionToggle';
import { FileSelector } from '@/components/FileSelector';
import { ProgressBar } from '@/components/ProgressBar';
import { useBatchConvert } from '@/hooks/useBatchConvert';
import { useBatchProgress } from '@/hooks/useBatchProgress';
import { open } from '@tauri-apps/plugin-dialog';
import { getFileName, removeExtension } from '@/lib/utils';
import type { BatchItem, ConvertDirection } from '@/lib/tauri';

export function BatchPage() {
  const { t } = useTranslation();
  const [files, setFiles] = useState<BatchItem[]>([]);
  const [outputDir, setOutputDir] = useState('');
  const [direction, setDirection] = useState<ConvertDirection>('xlsx2json');

  const batchMutation = useBatchConvert();
  const { progress, reset } = useBatchProgress();

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
      const ext = direction === 'xlsx2json' ? '.json' : '.xlsx';
      const newFiles: BatchItem[] = paths.map((input) => {
        const name = removeExtension(getFileName(input));
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

    reset();
    await batchMutation.mutateAsync(files);
    setFiles([]);
  };

  const handleRemoveFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-6 p-4">
      <DirectionToggle value={direction} onChange={setDirection} />

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
