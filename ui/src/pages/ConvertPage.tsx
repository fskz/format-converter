import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { DirectionToggle } from '@/components/DirectionToggle';
import { FileSelector } from '@/components/FileSelector';
import { useConvertFile } from '@/hooks/useConvertFile';
import { showInFolder, type ConvertDirection } from '@/lib/tauri';
import { changeExtension } from '@/lib/utils';

export function ConvertPage() {
  const { t } = useTranslation();
  const [inputPath, setInputPath] = useState('');
  const [outputPath, setOutputPath] = useState('');
  const [direction, setDirection] = useState<ConvertDirection>('xlsx2json');

  const convertMutation = useConvertFile();

  const handleDirectionChange = (newDirection: ConvertDirection) => {
    setDirection(newDirection);
    setInputPath('');
    setOutputPath('');
  };

  const handleInputChange = (path: string) => {
    setInputPath(path);
    if (path) {
      const ext = direction === 'xlsx2json' ? '.json' : '.xlsx';
      setOutputPath(changeExtension(path, ext));
    } else {
      setOutputPath('');
    }
  };

  const handleConvert = async () => {
    if (!inputPath || !outputPath) return;
    await convertMutation.mutateAsync({
      input: inputPath,
      output: outputPath,
      direction,
    });
  };

  const result = convertMutation.data;
  const inputFilters =
    direction === 'xlsx2json'
      ? [{ name: 'Excel Files', extensions: ['xlsx', 'xls'] }]
      : [{ name: 'JSON Files', extensions: ['json'] }];

  return (
    <div className="space-y-6 p-4">
      <DirectionToggle value={direction} onChange={handleDirectionChange} />

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

      {result?.success && (
        <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-md space-y-2">
          <p className="text-green-800 dark:text-green-200 font-medium">
            {t('convert.success')}
          </p>
          <p className="text-sm text-muted-foreground">
            {t('convert.records', { count: result.record_count })}
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => showInFolder(result.output_path)}
          >
            {t('convert.openFolder')}
          </Button>
        </div>
      )}
    </div>
  );
}
