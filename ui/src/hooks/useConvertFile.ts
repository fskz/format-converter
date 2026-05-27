import { useMutation } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import {
  convertFile,
  type ConvertResult,
  type ConvertDirection,
} from '@/lib/tauri';

interface ConvertParams {
  input: string;
  output: string;
  direction: ConvertDirection;
}

export function useConvertFile() {
  const { t } = useTranslation();

  return useMutation<ConvertResult, Error, ConvertParams>({
    mutationFn: ({ input, output, direction }) =>
      convertFile(input, output, direction),
    onSuccess: (result) => {
      if (result.success) {
        toast.success(t('convert.success'));
      } else {
        toast.error(result.error || t('convert.failed'));
      }
    },
    onError: (error) => {
      toast.error(t('convert.failed', { error: error.message }));
    },
  });
}
