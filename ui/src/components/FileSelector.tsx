import { open } from '@tauri-apps/plugin-dialog';
import { useTranslation } from 'react-i18next';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';

interface FileSelectorProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  filters?: { name: string; extensions: string[] }[];
  mode?: 'open' | 'save' | 'directory';
  placeholder?: string;
}

export function FileSelector({
  label,
  value,
  onChange,
  filters,
  mode = 'open',
  placeholder,
}: FileSelectorProps) {
  const { t } = useTranslation();

  const handleSelect = async () => {
    let result: string | null = null;

    if (mode === 'directory') {
      result = await open({ directory: true });
    } else if (mode === 'save') {
      result = await open({
        filters,
        multiple: false,
      });
    } else {
      result = await open({
        filters,
        multiple: false,
      });
    }

    if (result) {
      onChange(result);
    }
  };

  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <div className="flex gap-2">
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          readOnly
          className="flex-1"
        />
        <Button onClick={handleSelect} type="button" variant="outline">
          {t('common.confirm')}
        </Button>
      </div>
    </div>
  );
}
