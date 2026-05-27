import { useState, useEffect } from 'react';
import { onBatchProgress, type BatchProgress } from '@/lib/tauri';

export function useBatchProgress() {
  const [progress, setProgress] = useState<BatchProgress | null>(null);

  useEffect(() => {
    let unlisten: (() => void) | null = null;

    onBatchProgress((data) => {
      setProgress(data);
    }).then((fn) => {
      unlisten = fn;
    });

    return () => {
      unlisten?.();
    };
  }, []);

  return progress;
}
