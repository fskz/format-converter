<script lang="ts">
  import ProgressBar from '../components/ProgressBar.svelte';
  import { batchConvert, onBatchProgress, type BatchItem, type BatchProgress } from '../lib/tauri';
  import { open } from '@tauri-apps/plugin-dialog';

  interface FileEntry {
    input: string;
    direction: string;
  }

  let files: FileEntry[] = $state([]);
  let autoDirection: boolean = $state(true);
  let manualDirection: string = $state('xlsx2json');
  let converting: boolean = $state(false);
  let progress: BatchProgress | null = $state(null);
  let completedFiles: { input: string; success: boolean; error?: string }[] = $state([]);

  const allFilters = [
    { name: 'Supported', extensions: ['xlsx', 'xls', 'json'] },
  ];

  function detectDirection(path: string): string {
    const ext = path.split('.').pop()?.toLowerCase() || '';
    return ext === 'json' ? 'json2xlsx' : 'xlsx2json';
  }

  async function addFiles() {
    const selected = await open({ multiple: true, filters: allFilters });
    if (selected && Array.isArray(selected)) {
      for (const path of selected) {
        files = [...files, {
          input: path,
          direction: autoDirection ? detectDirection(path) : manualDirection,
        }];
      }
    } else if (selected && typeof selected === 'string') {
      files = [...files, {
        input: selected,
        direction: autoDirection ? detectDirection(selected) : manualDirection,
      }];
    }
  }

  function removeFile(index: number) {
    files = files.filter((_, i) => i !== index);
  }

  function clearFiles() {
    files = [];
    completedFiles = [];
    progress = null;
  }

  async function handleBatchConvert() {
    if (files.length === 0) return;
    converting = true;
    completedFiles = [];
    progress = null;

    const batchItems: BatchItem[] = files.map((f) => {
      const dotIdx = f.input.lastIndexOf('.');
      const base = dotIdx > 0 ? f.input.substring(0, dotIdx) : f.input;
      const ext = f.direction === 'xlsx2json' ? '.json' : '.xlsx';
      return {
        input: f.input,
        output: base + ext,
        direction: f.direction,
      };
    });

    const unlisten = await onBatchProgress((p) => {
      progress = p;
      if (p.status === 'success' || p.status.startsWith('error')) {
        completedFiles = [...completedFiles, {
          input: p.current_file,
          success: p.status === 'success',
          error: p.status.startsWith('error') ? p.status : undefined,
        }];
      }
    });

    try {
      await batchConvert(batchItems);
    } catch (e) {
      // error handled in progress
    }

    unlisten();
    converting = false;
  }
</script>

<div class="batch-page">
  <div class="actions">
    <button class="add-btn" onclick={addFiles} disabled={converting}>添加文件</button>
    <button class="clear-btn" onclick={clearFiles} disabled={converting || files.length === 0}>清空</button>
    <span class="file-count">{files.length} 个文件</span>
  </div>

  <div class="direction-setting">
    <label class="direction-label">转换方向</label>
    <div class="direction-options">
      <label class="radio-label">
        <input type="radio" name="direction" bind:group={autoDirection} value={true} />
        自动检测（根据文件扩展名）
      </label>
      <label class="radio-label">
        <input type="radio" name="direction" bind:group={autoDirection} value={false} />
        统一指定
      </label>
    </div>
    {#if !autoDirection}
      <div class="manual-direction">
        <button
          class="dir-btn"
          class:active={manualDirection === 'xlsx2json'}
          onclick={() => (manualDirection = 'xlsx2json')}
        >
          Excel → JSON
        </button>
        <button
          class="dir-btn"
          class:active={manualDirection === 'json2xlsx'}
          onclick={() => (manualDirection = 'json2xlsx')}
        >
          JSON → Excel
        </button>
      </div>
    {/if}
  </div>

  {#if files.length > 0}
    <div class="file-list">
      {#each files as file, i}
        <div class="file-item">
          <span class="file-name">{file.input.split('/').pop() || file.input.split('\\').pop() || file.input}</span>
          <span class="file-dir">{file.direction === 'xlsx2json' ? '→ JSON' : '→ XLSX'}</span>
          <button class="remove-btn" onclick={() => removeFile(i)} disabled={converting}>✕</button>
        </div>
      {/each}
    </div>
  {/if}

  <button
    class="convert-btn"
    onclick={handleBatchConvert}
    disabled={files.length === 0 || converting}
  >
    {converting ? '转换中...' : '开始批量转换'}
  </button>

  {#if progress && converting}
    <ProgressBar
      current={progress.current}
      total={progress.total}
      status={progress.current_file.split('/').pop() || progress.current_file}
    />
  {/if}

  {#if completedFiles.length > 0}
    <div class="results">
      <h3 class="results-title">转换结果</h3>
      {#each completedFiles as file}
        <div class="result-item" class:success={file.success} class:error={!file.success}>
          <span class="result-name">{file.input.split('/').pop() || file.input}</span>
          {#if file.success}
            <span class="result-status">✓ 成功</span>
          {:else}
            <span class="result-status">✗ {file.error || '失败'}</span>
          {/if}
        </div>
      {/each}
    </div>
  {/if}
</div>

<style>
  .batch-page {
    display: flex;
    flex-direction: column;
    gap: 20px;
  }

  .actions {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .add-btn {
    padding: 8px 16px;
    background: var(--primary);
    color: white;
    border: none;
    border-radius: var(--radius);
    font-size: 14px;
  }

  .add-btn:hover:not(:disabled) {
    background: var(--primary-hover);
  }

  .clear-btn {
    padding: 8px 16px;
    background: var(--bg);
    color: var(--text-secondary);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    font-size: 14px;
  }

  .clear-btn:hover:not(:disabled) {
    background: var(--bg-secondary);
  }

  .file-count {
    font-size: 14px;
    color: var(--text-secondary);
  }

  .direction-setting {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .direction-label {
    font-size: 14px;
    font-weight: 500;
  }

  .direction-options {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .radio-label {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 14px;
    cursor: pointer;
  }

  .manual-direction {
    display: flex;
    gap: 8px;
    margin-top: 4px;
  }

  .dir-btn {
    flex: 1;
    padding: 8px 12px;
    border: 1px solid var(--border);
    background: var(--bg);
    border-radius: var(--radius);
    font-size: 13px;
    color: var(--text);
  }

  .dir-btn.active {
    background: var(--primary);
    color: white;
    border-color: var(--primary);
  }

  .file-list {
    border: 1px solid var(--border);
    border-radius: var(--radius);
    overflow: hidden;
  }

  .file-item {
    display: flex;
    align-items: center;
    padding: 10px 12px;
    border-bottom: 1px solid var(--border);
    gap: 12px;
  }

  .file-item:last-child {
    border-bottom: none;
  }

  .file-name {
    flex: 1;
    font-size: 14px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .file-dir {
    font-size: 13px;
    color: var(--primary);
    white-space: nowrap;
  }

  .remove-btn {
    padding: 2px 6px;
    background: transparent;
    border: none;
    color: var(--text-secondary);
    font-size: 14px;
  }

  .remove-btn:hover:not(:disabled) {
    color: var(--error);
  }

  .convert-btn {
    padding: 12px 24px;
    background: var(--primary);
    color: white;
    border: none;
    border-radius: var(--radius);
    font-size: 16px;
    font-weight: 500;
  }

  .convert-btn:hover:not(:disabled) {
    background: var(--primary-hover);
  }

  .convert-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .results {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .results-title {
    font-size: 15px;
    font-weight: 600;
  }

  .result-item {
    display: flex;
    justify-content: space-between;
    padding: 8px 12px;
    border-radius: var(--radius);
    border: 1px solid var(--border);
  }

  .result-item.success {
    background: #f0fdf4;
  }

  .result-item.error {
    background: #fef2f2;
  }

  .result-name {
    font-size: 14px;
  }

  .result-status {
    font-size: 13px;
    font-weight: 500;
  }

  .success .result-status {
    color: var(--success);
  }

  .error .result-status {
    color: var(--error);
  }
</style>
