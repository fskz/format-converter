import { useQuery } from '@tanstack/react-query';
import { previewFile, type PreviewData } from '@/lib/tauri';

export function usePreviewFile(path: string | null) {
  return useQuery<PreviewData>({
    queryKey: ['preview', path],
    queryFn: () => previewFile(path!),
    enabled: !!path,
  });
}
