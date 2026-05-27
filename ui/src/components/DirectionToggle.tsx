import { useTranslation } from 'react-i18next';
import { Button } from './ui/button';
import { Label } from './ui/label';
import type { ConvertDirection } from '@/lib/tauri';

interface DirectionToggleProps {
  value: ConvertDirection;
  onChange: (value: ConvertDirection) => void;
}

export function DirectionToggle({ value, onChange }: DirectionToggleProps) {
  const { t } = useTranslation();

  return (
    <div className="space-y-2">
      <Label>{t('convert.direction')}</Label>
      <div className="flex gap-4">
        <Button
          variant={value === 'xlsx2json' ? 'default' : 'outline'}
          onClick={() => onChange('xlsx2json')}
        >
          {t('convert.xlsx2json')}
        </Button>
        <Button
          variant={value === 'json2xlsx' ? 'default' : 'outline'}
          onClick={() => onChange('json2xlsx')}
        >
          {t('convert.json2xlsx')}
        </Button>
      </div>
    </div>
  );
}
