import { useMutation } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { batchConvert, type BatchItem } from '@/lib/tauri';

export function useBatchConvert() {
  const { t } = useTranslation();

  return useMutation<void, Error, BatchItem[]>({
    mutationFn: (files) => batchConvert(files),
    onSuccess: () => {
      toast.success(t('batch.completed'));
    },
    onError: (error) => {
      toast.error(t('batch.failed', { error: error.message }));
    },
  });
}
