import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { FileSelector } from '@/components/FileSelector';
import { useConvertFile } from '@/hooks/useConvertFile';
import { showInFolder } from '@/lib/tauri';

export function ConvertPage() {
  const { t } = useTranslation();
  const [inputPath, setInputPath] = useState('');
  const [outputPath, setOutputPath] = useState('');
  const [direction, setDirection] = useState<'xlsx2json' | 'json2xlsx'>(
    'xlsx2json',
  );
  const [result, setResult] = useState<{
    success: boolean;
    outputPath: string;
    recordCount: number;
  } | null>(null);

  const convertMutation = useConvertFile();

  const handleDirectionChange = (newDirection: 'xlsx2json' | 'json2xlsx') => {
    setDirection(newDirection);
    setInputPath('');
    setOutputPath('');
    setResult(null);
  };

  const handleInputChange = (path: string) => {
    setInputPath(path);
    // Auto-generate output path
    if (path) {
      const ext = direction === 'xlsx2json' ? '.json' : '.xlsx';
      const basePath = path.replace(/\.[^.]+$/, '');
      setOutputPath(basePath + ext);
    } else {
      setOutputPath('');
    }
    setResult(null);
  };

  const handleConvert = async () => {
    if (!inputPath || !outputPath) return;

    const convertResult = await convertMutation.mutateAsync({
      input: inputPath,
      output: outputPath,
      direction,
    });

    if (convertResult.success) {
      setResult({
        success: true,
        outputPath: convertResult.output_path,
        recordCount: convertResult.record_count,
      });
    }
  };

  const inputFilters =
    direction === 'xlsx2json'
      ? [{ name: 'Excel Files', extensions: ['xlsx', 'xls'] }]
      : [{ name: 'JSON Files', extensions: ['json'] }];

  return (
    <div className="space-y-6 p-4">
      <div className="space-y-2">
        <Label>{t('convert.direction')}</Label>
        <div className="flex gap-4">
          <Button
            variant={direction === 'xlsx2json' ? 'default' : 'outline'}
            onClick={() => handleDirectionChange('xlsx2json')}
          >
            {t('convert.xlsx2json')}
          </Button>
          <Button
            variant={direction === 'json2xlsx' ? 'default' : 'outline'}
            onClick={() => handleDirectionChange('json2xlsx')}
          >
            {t('convert.json2xlsx')}
          </Button>
        </div>
      </div>

      <FileSelector
        label={t('convert.selectInput')}
        value={inputPath}
        onChange={handleInputChange}
        filters={inputFilters}
        mode="open"
      />

      <FileSelector
        label={t('convert.selectOutput')}
        value={outputPath}
        onChange={setOutputPath}
        mode="save"
      />

      <Button
        onClick={handleConvert}
        disabled={!inputPath || !outputPath || convertMutation.isPending}
        className="w-full"
      >
        {convertMutation.isPending
          ? t('convert.converting')
          : t('convert.start')}
      </Button>

      {result && (
        <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-md space-y-2">
          <p className="text-green-800 dark:text-green-200 font-medium">
            {t('convert.success')}
          </p>
          <p className="text-sm text-muted-foreground">
            {t('convert.records', { count: result.recordCount })}
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => showInFolder(result.outputPath)}
          >
            {t('convert.openFolder')}
          </Button>
        </div>
      )}
    </div>
  );
}
