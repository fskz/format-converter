import { useState, useEffect, useCallback } from 'react';
import { onBatchProgress, type BatchProgress } from '@/lib/tauri';

export function useBatchProgress() {
  const [progress, setProgress] = useState<BatchProgress | null>(null);

  const reset = useCallback(() => setProgress(null), []);

  useEffect(() => {
    let unlisten: (() => void) | null = null;
    let mounted = true;

    onBatchProgress((data) => {
      if (!mounted) return;
      setProgress((prev) => {
        if (
          prev?.current === data.current &&
          prev?.total === data.total &&
          prev?.status === data.status
        ) {
          return prev;
        }
        return data;
      });
    }).then((fn) => {
      if (mounted) {
        unlisten = fn;
      } else {
        fn();
      }
    });

    return () => {
      mounted = false;
      unlisten?.();
    };
  }, []);

  return { progress, reset };
}
