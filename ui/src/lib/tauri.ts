import { invoke } from '@tauri-apps/api/core';
import { listen, type UnlistenFn } from '@tauri-apps/api/event';

export interface ConvertResult {
  success: boolean;
  output_path: string;
  record_count: number;
  error: string | null;
}

export interface PreviewData {
  file_type: string;
  headers: string[];
  rows: string[][];
  total_rows: number;
}

export interface BatchItem {
  input: string;
  output: string;
  direction: string;
}

export interface BatchProgress {
  current: number;
  total: number;
  current_file: string;
  status: string;
}

export async function convertFile(
  input: string,
  output: string,
  direction: string,
): Promise<ConvertResult> {
  return invoke<ConvertResult>('convert_file', { input, output, direction });
}

export async function previewFile(path: string): Promise<PreviewData> {
  return invoke<PreviewData>('preview_file', { path });
}

export async function batchConvert(files: BatchItem[]): Promise<void> {
  return invoke('batch_convert', { files });
}

export async function showInFolder(path: string): Promise<void> {
  return invoke('show_in_folder', { path });
}

export function onBatchProgress(
  callback: (progress: BatchProgress) => void,
): Promise<UnlistenFn> {
  return listen<BatchProgress>('batch-progress', (event) => {
    callback(event.payload);
  });
}
